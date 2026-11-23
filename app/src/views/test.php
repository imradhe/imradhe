<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR Video on Image Target</title>
    <!-- Include A-Frame and AR.js -->
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  </head>
  <body style="margin: 0; overflow: hidden;">
    <!-- A-Frame scene -->
    <a-scene embedded arjs>
      <!-- Define the marker based on the image target -->
      <a-marker preset="hiro">
        <!-- Add the video that will play when the marker is detected -->
        <a-video
          src="#myVideo"
          width="2"
          height="1"
          position="0 0.5 0"
          rotation="-90 0 0">
        </a-video>
      </a-marker>

      <!-- Set up the camera -->
      <a-entity camera></a-entity>

      <!-- Define the video asset -->
      <a-assets>
        <video id="myVideo" src="https://interactive-examples.mdn.mozilla.net/media/examples/flower.webm" autoplay loop="true" webkit-playsinline playsinline></video>
      </a-assets>
    </a-scene>
  </body>
</html>