<?php
//if(!preg_match("(KE[A-D][0-9]{5})", $_REQUEST['memberID'])) header("Location:".route("admin/".$_REQUEST['back']));
locked(['admin']);
view('admin/partials/head');
require('views/admin/partials/sidebar.php');
?>
  <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2">New Story </h1>
        </div>
  
  <form method="POST" class="container">
      <?php
      controller('Story');
      $stories = new Story;
      $genres = $stories->genres;
      $stories = $stories->getStories();
        
      $storyIDs = [];

    foreach ($stories as $story) {
        array_push($storyIDs, $story['storyID']) ;
    }

    
    if(isset($_REQUEST['btn-submit'])){
        //ini_set('display_errors', 1);
        //ini_set('display_startup_errors', 1);
        //error_reporting(E_ALL);

       // echo json_encode($_REQUEST);
        $story = new Story();
        $story = $story->create($_REQUEST['title'], $_REQUEST['storyID'], $_REQUEST['author'],$_REQUEST['genre'], $_REQUEST['cover'], $_REQUEST['description'], $_REQUEST['tags']);
        if($story['error']){
            
            echo json_encode($story);
        }else{
            ?>
            <script>
                window.location.href = "<?php echo route('admin/stories');?>"
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
                <label for="storyID" class="form-label">Story ID</label> 
                <input type="storyID" class="form-control" id="storyID" name="storyID" value="<?php echo $_REQUEST['storyID'];?>" required>
                <strong id="storyIDMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="author" class="form-label">Author</label> 
                <input type="author" class="form-control" id="author" name="author" value="<?php echo $_REQUEST['author'];?>" required>
                <strong id="authorMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="genre" class="form-label">Genre</label> 
                <select class="form-control" id="genre" name="genre" required>
                  <option value="Choose Genre" selected disabled hidden>Choose Genre</option>
                  <?php foreach($genres as $genre ){?>
                  <option value="<?php echo $genre;?>" <?php echo ($_REQUEST['genre'] == $genre)? "selected":"";?>><?php echo $genre;?></option>
                  <?php }?>
                </select>
                <strong id="roleMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="cover" class="form-label">Cover Image</label> 
                <input type="cover" class="form-control" id="cover" name="cover" value="<?php echo $_REQUEST['cover'];?>" required>
                <strong id="coverMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="description" class="form-label">Description</label> 
                <input type="description" class="form-control" id="description" name="description" value="<?php echo $_REQUEST['description'];?>" required>
                <strong id="descriptionMsg" class="text-danger"></strong>
            </div> 
            
            <div class="col-sm-4 mb-3">
                <label for="tags" class="form-label">Tags</label> 
                <input type="tags" class="form-control" id="tags" name="tags" value="<?php echo $_REQUEST['tags'];?>" required>
                <strong id="tagsMsg" class="text-danger"></strong>
            </div> 


            
            <div class="col-sm-12 my-5">
                <a href="<?php echo route('admin/'.$_GET['back']);?>" name="back" class="btn btn-secondary">Back</a> 
                
                <button type="submit" name="btn-submit" id="btn-submit" class="btn btn-primary"> Add </button>
            </div>
        </div>

        </form>           
      
                <script>
                    
                    function capitalizeFirstLetter(string) {
                      return string.charAt(0).toUpperCase() + string.slice(1)
                    }
                
                    const camelToFlat=(camel)=>{
                       const camelCase =camel.replace(/([a-z])([A-Z])/g, '$1 $2')
                    
                        return capitalizeFirstLetter(camelCase)
                    }
                    
                    genres = document.querySelectorAll('#genre option')
                    
                    genres.forEach(genre => {
                        genre.innerText = camelToFlat(genre.value)
                    })
                    
                    title = document.querySelector('#title')
                    storyID = document.querySelector('#storyID')
                   
                   
                    slugify = str =>
                              str
                                .toLowerCase()
                                .trim()
                                .replace(/[^\w\s-]/g, '')
                                .replace(/[\s_-]+/g, '-')
                                .replace(/^-+|-+$/g, '');
    
                    title.addEventListener('keyup', function(){
                        storyID.value = slugify(title.value)
                    })
                </script>
  
  
  
    </main>
</div>     
</body>
</html>