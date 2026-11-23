<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ironman AR Model</title>
    <!-- Import the component -->
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.js"></script>
    <script nomodule src="https://unpkg.com/@google/model-viewer/dist/model-viewer-legacy.js"></script>
    <!-- Import Material Icons and Materialize CSS -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh;">
    <!-- Use it like any other HTML element -->
    <model-viewer 
        id="modelViewer"
        src="<?php assets('ar/chotabheem.glb')?>" 
        ar 
        alt="A 3D model of Chota Bheem" 
        animation-name="Chota Bheem"
        autoplay 
        animation-loop
        ar-modes="scene-viewer quick-look webxr" 
        interaction-prompt="when-focused"
        reveal="manual"
        camera-controls
        style="width: 100%; height: 100vh; background-color: #ffffff; position: relative;">
        
        <!-- AR button -->
        <button slot="ar-button" class="waves-effect waves-light btn-large" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; color: white; background-color: #00796B; border: none; padding: 10px 20px">
            <i class="material-icons left">view_in_ar</i>View in AR
        </button>
    </model-viewer>

    <!-- Circular toggle sound button -->
    <button id="toggleSound" class="waves-effect waves-light btn" style="position: absolute; top: 10px; right: 10px; width: 56px; height: 56px; border-radius: 50%; background-color: #00796B; display: flex; align-items: center; justify-content: center;">
        <i class="material-icons" id="soundIcon" style="font-size: 24px; color: white;">volume_up</i>
    </button>

    <!-- Audio playback -->
    <audio id="backgroundAudio" autoplay loop>
        <source src="<?php assets('audio/chotabheem.mp3')?>" type="audio/mp3">
        Your browser does not support the audio element.
    </audio>

    <!-- Script to handle sound toggle -->
    <script>
        const backgroundAudio = document.getElementById('backgroundAudio');
        const toggleSound = document.getElementById('toggleSound');
        const soundIcon = document.getElementById('soundIcon');

        toggleSound.addEventListener('click', () => {
            if (backgroundAudio.muted) {
                backgroundAudio.muted = false;
                soundIcon.textContent = 'volume_up';
            } else {
                backgroundAudio.muted = true;
                soundIcon.textContent = 'volume_off';
            }
        });
    </script>
</body>
</html>
