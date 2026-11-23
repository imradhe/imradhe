<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR Model Viewer Carousel</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">
    <style>
        body {
            margin: 0;
            background-color: #000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .owl-carousel .item {
            text-align: center;
            padding: 10px;
        }
        model-viewer {
            width: 100%;
            height: 80vh;
        }
    </style>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
</head>
<body>

    <div class="owl-carousel owl-theme">
        <div class="item">
            <model-viewer src="<?php assets('ar/ironman.glb');?>" ar ar-modes="scene-viewer webxr quick-look"
                          environment-image="neutral"
                          auto-rotate
                          camera-controls>
            </model-viewer>
        </div>
        <div class="item">
            <model-viewer src="<?php assets('ar/tomnjerry.glb');?>" ar ar-modes="scene-viewer webxr quick-look"
                          environment-image="neutral"
                          auto-rotate
                          camera-controls>
            </model-viewer>
        </div>
        <div class="item">
            <model-viewer src="<?php assets('ar/hulk.glb');?>" ar ar-modes="scene-viewer webxr quick-look"
                          environment-image="neutral"
                          auto-rotate
                          camera-controls>
            </model-viewer>
        </div>
        <!-- Add more items as needed -->
    </div>

    <script>
        $(document).ready(function(){
            $('.owl-carousel').owlCarousel({
                items: 1,
                loop: true,
                margin: 10,
                nav: true,
                dots: true,
                autoplay: false,
                autoplayTimeout: 5000,
                autoplayHoverPause: true
            });
        });
    </script>

</body>
</html>
