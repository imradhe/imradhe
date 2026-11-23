<!doctype html>
<html>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AR Demo (Video) - ImRadhe" />
    <meta name="keywords"
        content="AR Demo - ImRadhe, Radhe Shyam Salopanthula" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="author" content="ImRadhe" />
    <meta name="robots" content="follow" />
    <link rel="canonical" href="https://imradhe.com/" />
    <link rel="icon" href="<?php assets('img/imradhe.jpg')?>" />
    <meta name="theme-color" content="#86363B" />

    <!-- OPEN GRAPH -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="AR Demo (Video) - ImRadhe" />
    <meta property="og:url" content="https://imradhe.com/" />
    <meta property="og:description"
        content="AR Demo - ImRadhe" />
    <meta property="og:image" itemprop="image" content="<?php assets('img/imradhe.jpg')?>" />
    <meta property="og:image:secure_url" itemprop="image" content="<?php assets('img/imradhe.jpg')?>" />
    <meta property="og:site_name" content="ImRadhe" />

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="AR Demo (Video) - ImRadhe" />
    <meta name="twitter:description"
        content="AR Demo - ImRadhe" />
    <meta name="twitter:image" content="<?php assets('img/imradhe.jpg')?>" />

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <title>AR Demo (Video) - ImRadhe</title>
    <style>
        header{
            text-align: center;
            margin-top: 20vh;
            background-color: transparent;
            padding-bottom: 40vh !important;
        }
    </style>
  </head>
  <body>
    <header>
          <input id='autoplayVideo' hidden type='checkbox' />
    </header>
    <script type="module">
      import {WebXRButton} from 'https://immersive-web.github.io/webxr-samples/js/util/webxr-button.js';
      import {Scene} from 'https://immersive-web.github.io/webxr-samples/js/render/scenes/scene.js';
      import {Renderer, createWebGLContext} from 'https://immersive-web.github.io/webxr-samples/js/render/core/renderer.js';
      import {UrlTexture} from 'https://immersive-web.github.io/webxr-samples/js/render/core/texture.js';
      import {ButtonNode} from 'https://immersive-web.github.io/webxr-samples/js/render/nodes/button.js';
      import {Gltf2Node} from 'https://immersive-web.github.io/webxr-samples/js/render/nodes/gltf2.js';
      import {VideoNode} from 'https://immersive-web.github.io/webxr-samples/js/render/nodes/video.js';
      import {InlineViewerHelper} from 'https://immersive-web.github.io/webxr-samples/js/util/inline-viewer-helper.js';
      import {QueryArgs} from 'https://immersive-web.github.io/webxr-samples/js/util/query-args.js';
      import WebXRPolyfill from 'https://immersive-web.github.io/webxr-samples/js/third-party/webxr-polyfill/build/webxr-polyfill.module.js';
      if (QueryArgs.getBool('usePolyfill', true)) {
        let polyfill = new WebXRPolyfill();
      }

      let autoplayCheckbox = document.getElementById('autoplayVideo');
      let xrButton = null;
      let xrImmersiveRefSpace = null;
      let inlineViewerHelper = null;
      let gl = null;
      let renderer = null;
      let scene = new Scene();
      scene.enableStats(false);

      let video = document.createElement('video');
      video.loop = true;
      video.src = '<?php assets('video/greenscreen.webm')?>';

      let videoNode = new VideoNode({
        video: video,
        displayMode: 'stereo',
      });
      
      videoNode.translation = [0.2, 0.5, -4.4];
      videoNode.scale = [1.920/1.2, 1.080/1.2, 1.0];
      scene.addNode(videoNode);




      function initXR() {
        xrButton = new WebXRButton({
          onRequestSession: onRequestSession,
          onEndSession: onEndSession,
          textEnterXRTitle: "ENTER AR",
          textXRNotFoundTitle: "AR NOT FOUND",
          textExitXRTitle: "EXIT  AR",
        });
        
        document.querySelector('header').appendChild(xrButton.domElement);

        if (navigator.xr) {
          navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            xrButton.enabled = supported;
          });

          navigator.xr.requestSession('inline').then(onSessionStarted);
        }
      }

      function initGL() {
        if (gl)
          return;

        gl = createWebGLContext({
          xrCompatible: true
        });
        document.body.appendChild(gl.canvas);

        function onResize() {
          gl.canvas.width = gl.canvas.clientWidth * window.devicePixelRatio;
          gl.canvas.height = gl.canvas.clientHeight * window.devicePixelRatio;
        }
        window.addEventListener('resize', onResize);
        onResize();

        renderer = new Renderer(gl);
        scene.setRenderer(renderer);
      }

      function onRequestSession() {

        return navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local']
        }).then((session) => {
          xrButton.setSession(session);
          session.isImmersive = true;
          onSessionStarted(session);

          video.play();
        });
      }

      function onSessionStarted(session) {
        session.addEventListener('end', onSessionEnded);
        session.addEventListener('select', (ev) => {
          let refSpace = ev.frame.session.isImmersive ?
                           xrImmersiveRefSpace :
                           inlineViewerHelper.referenceSpace;
          scene.handleSelect(ev.inputSource, ev.frame, refSpace);
        });

        initGL();
        scene.inputRenderer.useProfileControllerMeshes(session);

        let glLayer = new XRWebGLLayer(session, gl);
        session.updateRenderState({ baseLayer: glLayer });


        let refSpaceType = session.isImmersive ? 'local' : 'viewer';
        session.requestReferenceSpace(refSpaceType).then((refSpace) => {
          if (session.isImmersive) {
            xrImmersiveRefSpace = refSpace;
          } else {
            inlineViewerHelper = new InlineViewerHelper(gl.canvas, refSpace);
          }

          session.requestAnimationFrame(onXRFrame);
        });
      }

      function onEndSession(session) {
        session.end();
      }

      function onSessionEnded(event) {
        if (event.session.isImmersive) {
          xrButton.setSession(null);
          video.pause();
        }
      }

      function onXRFrame(t, frame) {
        let session = frame.session;
        let refSpace = session.isImmersive ?
                         xrImmersiveRefSpace :
                         inlineViewerHelper.referenceSpace;
        let pose = frame.getViewerPose(refSpace);

        scene.startFrame();

        session.requestAnimationFrame(onXRFrame);

        scene.updateInputSources(frame, refSpace);

        scene.drawXRFrame(frame, pose);

        scene.endFrame();
      }
      
      initXR();
    </script>
  </body>
</html>
