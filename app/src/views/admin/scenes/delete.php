<?php
locked(['admin']);
controller('Scene');
$scene = new Scene;
$scene = $scene->delete($_REQUEST['slug']);
if($scene) {
    ?>
            <script>
                window.location.href = "<?php echo route('admin/scenes');?>"
            </script>
            <?php
}else echo "<h1 style='text-align:center;'>Scene Deletion Failed</h1>";