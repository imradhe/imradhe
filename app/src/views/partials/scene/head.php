<head>
<meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=none">

  <title><?php echo $scene['title']." - ".$story['title']; ?></title>

  <meta name="description"
    content="<?php echo $scene['title']." is scene ".$scene['sceneNumber']." of the story ".$story['title']; ?>" />
  <meta name="keywords" content="<?php echo $story['tags']; ?>">
  <meta name="author" content="<?php echo $story['author']; ?>" />
  <link rel="icon" type="image/jpeg" href="<?php echo route($config['APP_ICON']); ?>" />

  <!-- Open Graph Tags -->
  <meta property="og:title" content="<?php echo $scene['title']." - ".$story['title']; ?>" />
  <meta property="og:type" content="story.scene" />
  <meta property="story:title" content="<?php echo $story['title']?>" />
  <meta property="story.scene:title" content="<?php echo $scene['title']?>" />
  <meta property="story.scene:number" content="<?php echo $scene['sceneNumber']?>" />
  <meta property="story.chapter:number" content="<?php echo $scene['chapterNumber']?>" />
  <meta property="story.act:number" content="<?php echo integerToRoman($scene['actNumber'])?>" />
  <meta property="story.scene:published_time" content="<?php echo $scene['createdDate']?>" />
  <meta property="og:url" content="<?php echo url();?>" />
  <meta property="og:image" content="<?php echo route($config['APP_OG_ICON']); ?>" />
  <meta property="og:description"
    content="<?php echo $scene['title']." is scene ".$scene['sceneNumber']." of the story ".$story['title']; ?>" />
  <meta property="og:site_name" content="<?php echo $config['APP_TTILE']; ?>" />
  <meta property="og:image:type" content="image/jpg" />
  <meta property="og:image:secure_url" itemprop="image" content="<?php echo route($config['APP_OG_ICON']); ?>"/>
  <meta property="og:image" itemprop="image" content="<?php echo route($config['APP_OG_ICON']); ?>"/>
  <meta property="og:image:secure_url" itemprop="image" content="<?php echo route($config['APP_OG_ICON_MOBILE']); ?>"/>

  <!-- CSS only -->
  <link href="<?php echo route('assets/bootstrap/css/bootstrap.min.css'); ?>" rel="stylesheet">

  <!-- JavaScript Bundle with Popper -->
  <script src="<?php echo route('assets/bootstrap/js/bootstrap.bundle.min.js'); ?>"></script>

  <link rel="stylesheet" href="<?php echo route('assets/bootstrap/icons/icons.css'); ?>">

  <link rel="stylesheet" href="<?php echo route('assets/css/app.css')?>">

    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>


