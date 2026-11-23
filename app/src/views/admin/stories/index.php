<?php
    controller('Story');
    $stories = new Story;
    $stories = $stories->getStories();
   // echo json_encode($stories);
?>

<?php
locked(['admin','moderator']);
view('admin/partials/head');
require('views/admin/partials/sidebar.php');
$members = $allMembers;
?>
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2 mb-5">All Stories</h1>
          <a href="<?php echo route('admin/stories/new');?>?back=stories" class="btn btn-secondary float-end mt-5 me-5"><i class="bi bi-plus-circle"></i> New </a>
        </div>
  <head>
    <style type="text/css">
      th{
        text-transform: capitalize;
      }
      .action-btn{
        margin-right: 5px;
      }
      label{
        font-size: 16px;
        font-weight: bold;
      }
      small kbd{
        vertical-align: middle;
        padding: 2px 6px;
        user-select: none !important;
        font-size: 16px;
        font-weight: bold;
        background: white;
        color: black;
        border: 1px solid black;
      }
      .table-responsive::-webkit-scrollbar {
          height:12px !important;
          cursor: pointer !important;
      }
    </style>
  </head>

  <div class="table-responsive mb-5">
              <table id="myTable" class="table table-striped table-sm">
                <thead>
                  <tr>
                    <th class="text-nowrap">Story ID</th>
                    <th class="text-nowrap">Title</th>
                    <th class="text-nowrap">Author</th>
                    <th class="text-nowrap">Genre</th>
                    <th class="text-wrap">Description</th>
                    <th class="text-nowrap">Story Cover</th>
                    <th class="text-nowrap">Tags</th>
                    <th class="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                <?php foreach($stories as $story){
                ?>
                  <tr>
                    <td class="text-wrap"><a target="_blank" href="<?php echo route('story/'.$story['storyID']);?>"><?php echo $story['storyID'];?></a></td>
                    <td class="text-wrap"><?php echo $story['title'];?></td>
                    <td class="text-wrap"><?php echo $story['author'];?></td>
                    <td class="text-wrap"><?php echo $story['genre'];?></td>
                    <td class="text-wrap"><?php echo $story['description'];?></td>
                    <td class="text-wrap"><?php echo $story['cover'];?></td>
                    <td class="text-wrap"><?php echo $story['tags'];?></td>
                    <td class="Action text-center text-nowrap">
                        
                        
                         
                         <a class="btn action-btn btn-sm btn-secondary text-white" href="<?php echo route('admin/stories/edit/').$story['storyID'];?>?back=stories"> <i class="bi bi-pencil-square"></i></a>
                         
                         <a class="ms-3 btn action-btn btn-sm btn-danger text-white" data-bs-toggle="modal" data-bs-target="#delete<?php echo $story['storyID'];?>"> <i class="bi bi-trash"></i></a>
                         
                    </td>
                  </tr>
                <?php }?>
                                  
                </tbody>
              </table>
            </div>
      
      
                <?php foreach($stories as $story){
?>
         
          
          <div class="modal fade" id="delete<?php echo $story['storyID']; ?>" tabindex="-1" aria-labelledby="delete<?php echo $story['storyID']; ?>Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Delete Story - <?php echo $story['title'];?></h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    
                 Are you sure you want to delete this Story?
                  

                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                  <form method="POST">
                  <a href="<?php echo route('admin/stories/delete/').$story['storyID'];?>?back=stories" class="btn btn-primary">Yes</a>
                  </form>
                </div>
              </div>
            </div>
          </div>
  
<?php 
}?>              
  
  
  
  <script>
  $(document).ready( function () {
      $('#myTable').DataTable( {
      language: {
          search: ""
      }
      } )
      let search = document.querySelector("#myTable_filter input")
      search.placeholder = "Search"
      search.classList.remove("form-control-sm")
      search.style.width = "350px"
  } )
  
  
  </script>
            </main>
</div>     
</body>
</html>