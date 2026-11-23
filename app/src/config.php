<?php
// Container config: every secret and host-specific value comes from environment
// variables set in Dokploy (Environment tab). Nothing sensitive lives in git.
$env = function ($key, $default = '') {
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
};

$config = [
        'APP_NAME'=>'Radhe Shyam Salopanthula',
        'APP_TITLE'=>'Radhe Shyam Salopanthula - PhD Scholar @ IIIT Hyderabad',
        // Public address with a trailing slash, e.g. https://imradhe.com/
        'APP_URL'=>$env('APP_URL', 'https://imradhe.com/'),
        // Only needed when the app is served from a sub-directory
        'APP_SLUG'=>$env('APP_SLUG', ''),

        'DB_CONNECTION'=>'mysql',
        'DB_HOST'=>$env('DB_HOST', 'localhost'),
        'DB_PORT'=>$env('DB_PORT', '3306'),
        'DB_DATABASE'=>$env('DB_DATABASE'),
        'DB_USERNAME'=>$env('DB_USERNAME'),
        'DB_PASSWORD'=>$env('DB_PASSWORD'),

        'MAIL_DRIVER'=>'smtp',
        'MAIL_HOST'=>$env('MAIL_HOST'),
        'MAIL_PORT'=>$env('MAIL_PORT'),
        'MAIL_USERNAME'=>$env('MAIL_USERNAME', null),
        'MAIL_PASSWORD'=>$env('MAIL_PASSWORD', null),
        'MAIL_ENCRYPTION'=>$env('MAIL_ENCRYPTION', null),

        //SEO
        'APP_DESC' => 'PhD Scholar in Computational Linguistics at IIIT Hyderabad. Researcher and product developer working at the intersection of AI, speech, and language technology. Passionate about building intelligent systems rooted in Indic knowledge and linguistics.',
        'APP_SHORT_TITLE'=>'Radhe Shyam Salopanthula - Portfolio',
        'APP_AUTHOR' => 'Radhe Shyam Salopanthula',
        'APP_ICON' => 'assets/img/imradhe.jpg', // Size 1000x1000
        'APP_OG_ICON' => 'assets/img/banner.jpg', // Size 600x300
        'APP_OG_ICON_MOBILE' => 'assets/img/banner.jpg', // Size 700x700
        'APP_THEME_COLOR' => '#FFFFFF', // Color in HEX Code
        'APP_KEYWORDS' => 'Radhe Shyam IIITH, PhD IIIT Hyderabad, Computational Linguistics, Radhe Shyam IITM, ImRadhe IITM, Radhe Shyam IIT Madras, ImRadhe, I\'m Radhe, Radhe Shyam Chess, Radhe Shyam Music, Radhe Shyam Product Developer, Radhe Shyam Language Tech, Radhe Shyam Salopanthula',
        'APP_TWITTER_CREATOR' => '@imraadhe', // Twitter Username
];
