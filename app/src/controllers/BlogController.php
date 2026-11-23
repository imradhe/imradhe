<?php

/**
 * Blog
 *
 * File based blog. Every post is a Markdown file in content/blog/<slug>.md that
 * starts with a small front-matter block:
 *
 *   ---
 *   title: My first post
 *   date: 2026-11-23
 *   description: One line that shows on the blog index and in search results.
 *   tags: speech, nlp
 *   draft: true            (optional: hides the post)
 *   ---
 *   Markdown body...
 *
 * Files whose name starts with "_" are ignored, so _example.md is a safe template.
 * The slug is the file name without ".md" and may only use a-z, 0-9 and "-".
 */
class Blog
{
    private $dir;

    public function __construct($dir = null)
    {
        $this->dir = rtrim($dir ?: __DIR__ . '/../content/blog', '/');
    }

    public static function isValidSlug($slug)
    {
        return is_string($slug) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug) === 1;
    }

    /** Published posts, newest first. The body is not included. */
    public function all()
    {
        $posts = [];
        foreach (glob($this->dir . '/*.md') ?: [] as $file) {
            $slug = basename($file, '.md');
            if (!self::isValidSlug($slug)) {
                continue;
            }
            $post = $this->parse($slug, (string) file_get_contents($file));
            if ($post['draft']) {
                continue;
            }
            unset($post['body']);
            $posts[] = $post;
        }
        usort($posts, function ($a, $b) {
            return [$b['timestamp'], $a['slug']] <=> [$a['timestamp'], $b['slug']];
        });
        return $posts;
    }

    /** One published post including its Markdown body, or null. */
    public function find($slug)
    {
        if (!self::isValidSlug($slug)) {
            return null;
        }
        $file = $this->dir . '/' . $slug . '.md';
        if (!is_file($file)) {
            return null;
        }
        $post = $this->parse($slug, (string) file_get_contents($file));
        return $post['draft'] ? null : $post;
    }

    private function parse($slug, $raw)
    {
        $raw = ltrim(str_replace("\r\n", "\n", $raw), "\xEF\xBB\xBF");
        $meta = [];
        $body = $raw;
        if (preg_match('/\A---\n(.*?)\n---[ \t]*(?:\n|\z)/s', $raw, $m)) {
            foreach (explode("\n", $m[1]) as $line) {
                if (strpos($line, ':') !== false) {
                    [$key, $value] = explode(':', $line, 2);
                    $meta[strtolower(trim($key))] = trim($value);
                }
            }
            $body = substr($raw, strlen($m[0]));
        }
        $timestamp = isset($meta['date']) ? (strtotime($meta['date']) ?: 0) : 0;
        $tags = isset($meta['tags']) ? array_values(array_filter(array_map('trim', explode(',', $meta['tags'])))) : [];

        return [
            'slug' => $slug,
            'title' => $meta['title'] ?? ucwords(str_replace('-', ' ', $slug)),
            'description' => $meta['description'] ?? '',
            'date' => $timestamp ? date('j F Y', $timestamp) : '',
            'iso_date' => $timestamp ? date('Y-m-d', $timestamp) : '',
            'timestamp' => $timestamp,
            'tags' => $tags,
            'draft' => in_array(strtolower($meta['draft'] ?? ''), ['1', 'true', 'yes'], true),
            'read_minutes' => max(1, (int) ceil(count(preg_split('/\s+/u', trim(strip_tags($body)), -1, PREG_SPLIT_NO_EMPTY)) / 200)),
            'body' => $body,
        ];
    }
}
