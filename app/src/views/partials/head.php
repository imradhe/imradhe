<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title><?php 
        
switch ($_SERVER['REQUEST_URI']) {
    case "/skills":
        $title = $config['APP_TITLE']." | Skills";
    break;
    case "/projects":
        $title = $config['APP_TITLE']." | Projects";
    break;
    case "/experience":
        $title = "Radhe Shyam Salopanthula | "."Experience";
    break;
    case "/interests":
        $title = $config['APP_TITLE']." | Interests";
    break;
    default:
        $title = $config['APP_TITLE']." | About";
    break;
}
        // A page can set $pageTitle before including this partial (used by the blog)
        if (!empty($pageTitle)) { $title = $pageTitle; }
        echo $title;
    ?></title>

  <meta name="description"
    content="<?php echo e($pageDescription ?? $config['APP_DESC']); ?>"/>
  <meta name="keywords" content="<?php echo $config['APP_KEYWORDS']; ?>">
  <meta name="author" content="<?php echo $config['APP_AUTHOR']; ?>" />
  <link rel="icon" type="image/jpeg" href="<?php echo route($config['APP_ICON']); ?>" />

  <link rel="canonical" href="<?php echo url();?>" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="<?php echo  $title;?>"/>
  <meta property="og:type" content="portfolio" />
  <meta property="og:url" content="<?php echo url();?>" />
  <meta property="og:image" content="<?php echo route($config['APP_OG_ICON']); ?>" />
  <meta property="og:description" content="<?php echo e($pageDescription ?? $config['APP_DESC']); ?>" />
  <meta property="og:site_name" content="<?php echo $config['APP_TITLE']; ?>" />
  <meta property="og:image:type" content="image/jpg" />
  <meta property="og:image:secure_url" itemprop="image" content="<?php echo route($config['APP_OG_ICON']); ?>"/>
  <meta property="og:image" itemprop="image" content="<?php echo route($config['APP_OG_ICON']); ?>"/>
  <meta property="og:image:secure_url" itemprop="image" content="<?php echo route($config['APP_OG_ICON_MOBILE']); ?>"/>


    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@imraadhe">
    <meta name="twitter:creator" content="<?php echo $config['APP_TWITTER_CREATOR'];?>">
    <meta name="twitter:title" content="<?php echo $title;?>">
    <meta name="twitter:description" content="<?php echo e($pageDescription ?? $config['APP_DESC']);?>">
    <meta name="twitter:image" content="<?php echo $config['APP_OG_ICON_MOBILE'];?>">
  <!-- CSS only -->
  <link href="<?php echo route('assets/bootstrap/css/bootstrap.min.css'); ?>" rel="stylesheet">


    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito" rel="stylesheet">

  <!-- JavaScript Bundle with Popper -->
  <script src="<?php echo route('assets/bootstrap/js/bootstrap.bundle.min.js'); ?>"></script>

  <link rel="stylesheet" href="<?php echo route('assets/bootstrap/icons/icons.css'); ?>">

  <link rel="stylesheet" href="<?php echo route('assets/css/app.css')?>">
  
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  

</head>