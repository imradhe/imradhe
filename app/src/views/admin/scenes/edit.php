<?php
//if(!preg_match("(KE[A-D][0-9]{5})", $_REQUEST['memberID'])) header("Location:".route("admin/".$_REQUEST['back']));
locked(['admin']);
view('admin/partials/head');
require('views/admin/partials/sidebar.php');

      controller('Story');
      $stories = new Story;
      $story = $stories->getStory($_REQUEST['slug']);
      $stories = $stories->getStories();
      
    controller('Scene');
    $scene = new Scene;
    $scene = $scene->getScene($_REQUEST['slug']);
      
?>
  <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2">Edit Scene - <?php echo $scene['title'];?></h1>
        </div>
  
  <form method="POST" class="container">
      <?php
        

    
    if(isset($_REQUEST['btn-submit'])){
        $updateScene = new Scene();
        
        $updateScene = $updateScene->update($_REQUEST['slug'], $_REQUEST['title'], $_REQUEST['content']);
        
            
        if($updateScene['error']){
            
            echo json_encode($updateScene);
        }else{
            ?>
            <script>
                window.location.href = "<?php echo route('admin/scenes');?>"
            </script>
            <?php
        }
    }
      ?>
        <div class="row">    
        
            <div class="col-sm-4 mb-3">
                <label for="title" class="form-label">Title</label> 
                <input type="title" class="form-control" id="title" name="title" value="<?php echo $scene['title'];?>" required>
                <strong id="titleMsg" class="text-danger"></strong>
            </div> 
            
            
            
            <div class="col-sm-12 mb-3">
                <textarea name="content" id="content"><?php echo htmlspecialchars(stripslashes(stripslashes($scene['content'])));?></textarea>
                
            </div>
            
            <div class="col-sm-12 my-5">
                <a href="<?php echo route('admin/'.$_GET['back']);?>" name="back" class="btn btn-secondary">Back</a> 
                
                <button type="submit" name="btn-submit" id="btn-submit" class="btn btn-primary"> Update </button>
            </div>
        </div>

        </form>          
        <script>
              ClassicEditor
            .create( document.querySelector( '#content' ),
            {
                alignment: {
                    options: [ 'left', 'right', 'center' ]
                },
                toolbar: {
                     items: [
                        'heading', '|',
                        'fontfamily', 'fontsize', '|',
                        'alignment', '|',
                        'fontColor', 'fontBackgroundColor', '|',
                        'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
                        'link', '|',
                        'outdent', 'indent', '|',
                        'bulletedList', 'numberedList', 'todoList', '|',
                        'code', 'codeBlock', '|',
                        'insertTable', '|',
                        'uploadImage', 'blockQuote', '|',
                        'undo', 'redo'
                    ],
                }
            })
            .catch( error => {
                console.error( error );
            } );
         </script>
         
  
  
  
    </main>
</div>     
</body>
</html>