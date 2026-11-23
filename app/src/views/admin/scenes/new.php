<?php
//if(!preg_match("(KE[A-D][0-9]{5})", $_REQUEST['memberID'])) header("Location:".route("admin/".$_REQUEST['back']));
locked(['admin']);
view('admin/partials/head');
require('views/admin/partials/sidebar.php');
?>
  <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2">New Scene </h1>
        </div>
  
  <form method="POST" class="container">
      <?php
      controller('Story');
      $stories = new Story;
      $stories = $stories->getStories();
        

    
    if(isset($_REQUEST['btn-submit'])){

        controller('Scene');
        $scene = new Scene();
        
        $scene = $scene->create($_REQUEST['title'], $_REQUEST['actNumber'], $_REQUEST['chapterNumber'],$_REQUEST['sceneNumber'], $_REQUEST['storyID'], $_REQUEST['content']);
        
            
        if($scene['error']){
            
            echo json_encode($scene);
        }else{
            echo json_encode($scene);
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
                <input type="title" class="form-control" id="title" name="title" value="<?php echo $_REQUEST['title'];?>" required>
                <strong id="titleMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="storyID" class="form-label">Story</label> 
                <select class="form-control" id="storyID" name="storyID" required>
                  <option value="Choose Story" selected disabled hidden>Choose Story</option>
                  <?php foreach($stories as $story ){?>
                  <option value="<?php echo $story['storyID'];?>" <?php echo ($_REQUEST['storyID'] == $story['storyID'])? "selected":"";?>><?php echo $story['title'];?></option>
                  <?php }?>
                </select>
                <strong id="roleMsg" class="text-danger"></strong>
            </div> 
            <div class="col-sm-4 mb-3"></div>
            <div class="col-sm-4 mb-3">
                <label for="actNumber" class="form-label">Act Number</label> 
                <input type="actNumber" class="form-control" id="actNumber" name="actNumber" value="<?php echo $_REQUEST['actNumber'];?>" required>
                <strong id="actNumberMsg" class="text-danger"></strong>
            </div> 

            <div class="col-sm-4 mb-3">
                <label for="chapterNumber" class="form-label">Chapter Number</label> 
                <input type="chapterNumber" class="form-control" id="chapterNumber" name="chapterNumber" value="<?php echo $_REQUEST['chapterNumber'];?>" required>
                <strong id="chapterNumberMsg" class="text-danger"></strong>
            </div>  
            
            <div class="col-sm-4 mb-3">
                <label for="sceneNumber" class="form-label">Scene Number</label> 
                <input type="sceneNumber" class="form-control" id="sceneNumber" name="sceneNumber" value="<?php echo $_REQUEST['sceneNumber'];?>" required>
                <strong id="sceneNumberMsg" class="text-danger"></strong>
            </div> 
            
            
            <div class="col-sm-12 mb-3">
                <textarea name="content" id="content"><?php echo $_REQUEST['content'];?></textarea>
                
            </div>
            
            <div class="col-sm-12 my-5">
                <a href="<?php echo route('admin/'.$_GET['back']);?>" name="back" class="btn btn-secondary">Back</a> 
                
                <button type="submit" name="btn-submit" id="btn-submit" class="btn btn-primary"> Add </button>
            </div>
        </div>

        </form>           
      
         <script>
              ClassicEditor
            .create( document.querySelector( '#content' ) )
            .catch( error => {
                console.error( error );
            } );
         </script>
  
  
  
    </main>
</div>     
</body>
</html>