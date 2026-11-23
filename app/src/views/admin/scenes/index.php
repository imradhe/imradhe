<?php
    controller('Scene');
    $scenes = new Scene;
    $scenes = $scenes->getScenes();
   // echo json_encode($scenes);
?>

<?php
locked(['admin','moderator']);
view('admin/partials/head');
require('views/admin/partials/sidebar.php');
//$members = $allMembers;
?>
    <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3">
          <h1 class="h2 mb-5">All Scenes</h1>
          <a href="<?php echo route('admin/scenes/new');?>?back=scenes" class="btn btn-secondary float-end mt-5 me-5"><i class="bi bi-plus-circle"></i> New </a>
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
                    <th class="text-nowrap">Scene ID</th>
                    <th class="text-nowrap">Title</th>
                    <th class="text-nowrap">Act</th>
                    <th class="text-nowrap">Chapter</th>
                    <th class="text-wrap">Scene</th>
                    <th class="text-nowrap">Story ID</th>
                    <th class="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                <?php foreach($scenes as $scene){
                ?>
                
                  <tr>
                    <td class="text-wrap"><a target="_blank" href="<?php echo route('scene/'.$scene['sceneID']);?>"><?php echo $scene['sceneID'];?></a></td>
                    <td class="text-wrap"><?php echo $scene['title'];?></td>
                    <td class="text-wrap"><?php echo $scene['actNumber'];?></td>
                    <td class="text-wrap"><?php echo $scene['chapterNumber'];?></td>
                    <td class="text-wrap"><?php echo $scene['sceneNumber'];?></td>
                    <td class="text-wrap"><?php echo $scene['storyID'];?></td>
                    <td class="Action text-center text-nowrap">
                        
                        
                         
                         <a class="btn action-btn btn-sm btn-secondary text-white" href="<?php echo route('admin/scenes/edit/').$scene['sceneID'];?>?back=scenes"> <i class="bi bi-pencil-square"></i></a>
                         
                         <a class="ms-3 btn action-btn btn-sm btn-danger text-white" data-bs-toggle="modal" data-bs-target="#delete<?php echo $scene['sceneID'];?>"> <i class="bi bi-trash"></i></a>
                         
                    </td>
                  </tr>
                <?php }?>
                                  
                </tbody>
              </table>
            </div>
      
      
                <?php foreach($scenes as $scene){
?>
         
          
          <div class="modal fade" id="delete<?php echo $scene['sceneID']; ?>" tabindex="-1" aria-labelledby="delete<?php echo $scene['storyID']; ?>Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Delete Scene - <?php echo $scene['title'];?></h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    
                 Are you sure you want to delete this Scene?
                  

                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                  <form method="POST">
                  <a href="<?php echo route('admin/scenes/delete/').$scene['sceneID'];?>?back=scenes" class="btn btn-primary">Yes</a>
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