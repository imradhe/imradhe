

<aside id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse overflow-auto">
      <div class="position-sticky pt-3">

        <div class="dropdown mt-3 fs-5">
            <strong class="ms-3 me-5">
        <i class="bi bi-person-circle"></i> Admin</strong>
      <a href="#" class="dropdown-toggle text-decoration-none text-dark bi bi-three-dots-vertical dropdownHide fs-5 pe-3 float-end" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false"></a>
          <ul class="dropdown-menu text-small shadow" id="Menu" style="z-index: 1000000 !important; transform: translate3d(110px, 30px, 10px) !important;" aria-labelledby="dropdownUser2">
            <li><a class="dropdown-item text-danger fw-bold" id="logout" href="<?php echo route('logout');?>"><i class="bi bi-box-arrow-left"></i> Logout</a></li>
          </ul>
        </div>

        <hr>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link home" aria-current="page" href="<?php echo route('admin');?>">
              <i class="bi bi-house-door"></i>
              Home
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link stories" aria-current="page" href="<?php echo route('admin/stories');?>">
              <i class="bi bi-film"></i>
              Stories
            </a>
          </li>
        
          <li class="nav-item">
            <a class="nav-link scenes" aria-current="page" href="<?php echo route('admin/scenes');?>">
              <i class="bi bi-book"></i>
              Scenes
            </a>
          </li>
        </ul>
      </div>
    </aside>
    
      
<script type="text/javascript">
  var url = window.location.pathname
  switch(url){
    case "/admin":
    console.log(url)
    document.querySelector(".home").classList.toggle("active")
    break
    case "/admin/stories":
    document.querySelector(".stories").classList.toggle("active")
    break
    case "/admin/scenes":
    document.querySelector(".scenes").classList.toggle("active")
    break
      }
</script>