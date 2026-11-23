<?php
locked(['admin']);
controller('Story');
$story = new Story;
$story = $story->delete($_REQUEST['slug']);
if($story) {
    ?>
            <script>
                window.location.href = "<?php echo route('admin/stories');?>"
            </script>
            <?php
}else echo "<h1 style='text-align:center;'>Story Deletion Failed</h1>";