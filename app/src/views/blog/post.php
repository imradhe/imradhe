<?php
controller('Blog');
$blog = new Blog();
$post = $blog->find($_REQUEST['slug'] ?? '');

if (empty($post)) {
    pageNotFound();
    return;
}

$pageTitle = $post['title'] . " | Blog | " . $config['APP_NAME'];
$pageDescription = $post['description'] ?: $config['APP_DESC'];
?>
<!DOCTYPE html>
<html lang="en">
<?php include("views/partials/head.php") ?>

<body class="light">
  <div class="d-flex justify-content-center">
    <main class="px-3 py-4 w-100" style="max-width: 800px;">
      <a href="<?php echo route('blog'); ?>" class="text-decoration-none small">&larr; Blog</a>

      <article class="mt-3">
        <h1 class="h2 fw-bolder mb-2"><?php echo e($post['title']); ?></h1>
        <div class="small text-muted mb-4">
          <?php if ($post['date']) { ?><time datetime="<?php echo e($post['iso_date']); ?>"><?php echo e($post['date']); ?></time> &middot; <?php } ?>
          <?php echo (int) $post['read_minutes']; ?> min read
          <?php foreach ($post['tags'] as $tag) { ?><span class="badge bg-light text-dark border ms-1"><?php echo e($tag); ?></span><?php } ?>
        </div>

        <!-- Shown as plain text until marked (loaded in head.php) renders the Markdown -->
        <div id="post-body" style="white-space: pre-wrap;"></div>
      </article>

      <?php include("views/partials/footer.php") ?>
    </main>
  </div>

  <script>
    (function () {
      var el = document.getElementById('post-body');
      var md = <?php echo json_encode($post['body'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE); ?>;
      el.textContent = md;
      if (window.marked) {
        el.style.whiteSpace = 'normal';
        el.innerHTML = marked.parse(md);
      }
    })();
  </script>

  <script type="application/ld+json">
  <?php echo json_encode([
      '@context' => 'https://schema.org',
      '@type' => 'BlogPosting',
      'headline' => $post['title'],
      'description' => $post['description'],
      'datePublished' => $post['iso_date'] ?: null,
      'url' => url(),
      'author' => ['@type' => 'Person', 'name' => $config['APP_AUTHOR']],
  ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG); ?>
  </script>
</body>

</html>
