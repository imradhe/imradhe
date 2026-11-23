<?php 
require('config.php');
?>
<!doctype html>
<html lang="en">


<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="<?php echo $config['APP_DESC']; ?>" />
    <meta name="keywords" content="<?php echo $config['APP_KEYWORDS']; ?>" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="author" content="<?php echo $config['APP_AUTHOR']; ?>" />
    <meta name="robots" content="follow"/>
    <link rel="canonical" href="<?php echo url();?>" />

    <link rel=icon sizes=192x192 href="<?php echo home().$config['APP_ICON']; ?>" />
    <meta name="theme-color" content="<?php echo $config['APP_THEME_COLOR']; ?>" />

     <!-- OPEN GRAPH -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="<?php echo $config['APP_SHORT_TITLE']; ?>" />
    <meta property="og:url" content="<?php echo home(); ?>" />
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:creator" content="<?php echo home().$config['APP_TWITTER_CREATOR']; ?>">

    <meta property="og:image:secure_url" itemprop="image" content="<?php echo home().$config['APP_OG_ICON']; ?>"/>
    <meta property="og:image" itemprop="image" content="<?php echo home().$config['APP_OG_ICON']; ?>"/>

    <meta property="og:image:secure_url" itemprop="image" content="<?php echo home().$config['APP_OG_ICON_MOBILE']; ?>"/>
    <meta property="og:image" itemprop="image" content="<?php echo home().$config['APP_OG_ICON_MOBILE']; ?>"/>
    <meta property="og:description" content="<?php echo $config['APP_DESC']; ?>" />
    <meta property="og:site_name" content="<?php echo $config['APP_NAME']; ?>"/>
    
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Roboto+Condensed&subset=cyrillic&display=swap" onload="this.onload=null;this.rel='stylesheet'">



    
    <!-- Jquery -->
    <script src="<?php assets("jquery/jquery.min.js");?>"></script>

    
    <!-- Bootstrap core CSS -->
    <link href="<?php assets("bootstrap/css/bootstrap.min.css");?>" rel="stylesheet">
    <script src="<?php assets("bootstrap/js/bootstrap.bundle.min.js");?>"></script>
    
    
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.25/css/dataTables.bootstrap5.min.css">
    
    <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js"></script>
    
    <script src="//cdn.datatables.net/1.10.25/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.10.25/js/dataTables.bootstrap5.min.js"></script>
    
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    
    <script src="//cdn.jsdelivr.net/npm/medium-editor@latest/dist/js/medium-editor.min.js"></script>
    <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/medium-editor@latest/dist/css/medium-editor.min.css" type="text/css" media="screen" charset="utf-8">


    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com">

    <!-- Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">    
    <script src="https://kit.fontawesome.com/30fd2510e8.js"></script>



    
    <script src="https://cdn.ckeditor.com/ckeditor5/35.3.1/classic/ckeditor.js"></script>
    
    <script src="https://cdn.tiny.cloud/1/qxn7p17ellwi7shbn412a8gmxnb4i1liqnimqo4ta977enfa/tinymce/5/tinymce.min.js"></script>
    
    <link href='https://cdn.jsdelivr.net/npm/froala-editor@latest/css/froala_editor.pkgd.min.css' rel='stylesheet' type='text/css' />
    <script type='text/javascript' src='https://cdn.jsdelivr.net/npm/froala-editor@latest/js/froala_editor.pkgd.min.js'></script>

    
    <!-- Custom styles for this template -->
    <link rel="stylesheet" href="<?php assets("css/admin.css");?>">
    <title>Radhe Shyam Salopanthula Admin Panel</title>
  </head>  
<body>
    <header class="navbar navbar-dark sticky-top bg-dark flex-lg-nowrap p-0 shadow">
      <a class="navbar-brand col-lg-2 me-0 px-3 bg-transparent" href="<?php echo route('admin');?>"><img src="<?php assets('img/imradhe.jpg');?>" height="40px" class="me-2 rounded-circle "> Admin Panel</a>
      <a class="text-white fs-3 ms-auto d-lg-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
        <i class="bi bi-list"></i> 
      </a>
      <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap">
        </li>
      </ul>
    </header>
       
    <div class="container-fluid">
      <div class="row">