<?php
controller('Blog');
$blog = new Blog();
$posts = $blog->all();

$pageTitle = "Blog | " . $config['APP_NAME'];
$pageDescription = "Notes on speech, language technology and building things, by " . $config['APP_NAME'] . ".";
?>
<!DOCTYPE html>
<html lang="en">
<?php include("views/partials/head.php") ?>

<body class="light">
  <div class="d-flex justify-content-center">
    <main class="px-3 py-4 w-100" style="max-width: 800px;">
      <a href="<?php echo route(''); ?>" class="text-decoration-none small">&larr; <?php echo e($config['APP_NAME']); ?></a>
      <h1 class="h2 fw-bolder mt-3 mb-4">Blog</h1>

      <?php if (empty($posts)) { ?>
        <p class="text-muted">No posts yet. Check back soon.</p>
      <?php } ?>

      <?php foreach ($posts as $post) { ?>
        <article class="mb-4 pb-3 border-bottom">
          <h2 class="h5 fw-bold mb-1">
            <a href="<?php echo route('blog/' . $post['slug']); ?>" class="text-decoration-none"><?php echo e($post['title']); ?></a>
          </h2>
          <div class="small text-muted mb-2">
            <?php if ($post['date']) { ?><time datetime="<?php echo e($post['iso_date']); ?>"><?php echo e($post['date']); ?></time> &middot; <?php } ?>
            <?php echo (int) $post['read_minutes']; ?> min read
            <?php foreach ($post['tags'] as $tag) { ?><span class="badge bg-light text-dark border ms-1"><?php echo e($tag); ?></span><?php } ?>
          </div>
          <?php if ($post['description']) { ?><p class="mb-0"><?php echo e($post['description']); ?></p><?php } ?>
        </article>
      <?php } ?>

      <?php include("views/partials/footer.php") ?>
    </main>
  </div>
</body>

</html>
