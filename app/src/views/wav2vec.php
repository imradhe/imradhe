<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Speech to Text</title>
    <style>
        #transcript{
            white-space: pre !important;
        }
    </style>
</head>
<body>
    <h1>Speech to Text Conversion</h1>
    <form id="speechToTextForm">
        <label for="language">Select Language:</label>
        <select name="language" id="language">
            <option value="hi">Hindi</option>
            <option value="sa">Sanskrit</option>
            <option value="bn">Bangla</option>
            <option value="gu">Gujarathi</option>
            <option value="kn">Kannada</option>
            <option value="ml">Malayalam</option>
            <option value="mr">Marathi</option>
            <option value="or">Oriya</option>
            <option value="pa">Panjabi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="ur">Urdu</option>
            <!-- Add more language options as needed -->
        </select>
        <br><br>
        <label for="audio">Upload Audio:</label>
        <input type="file" name="audio" id="audio" accept=".wav,.mp3">
        <br><br>
        <input type="submit" value="Convert to Text">
    </form>

    <div id="audioPlayerContainer" style="display: none;">
        <audio controls id="audioPlayer"></audio>
    </div>

    <div id="transcript"></div>

    <script>
        const form = document.getElementById('speechToTextForm');
        const transcriptDiv = document.getElementById('transcript');
        const audioPlayerContainer = document.getElementById('audioPlayerContainer');
        const audioPlayer = document.getElementById('audioPlayer');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const language = document.getElementById('language').value;
            const audioFile = document.getElementById('audio').files[0];

            if (!audioFile) {
                alert('Please select an audio file.');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const audioContent = event.target.result.split(',')[1];

                // Dynamically create an audio element and set its source to the uploaded file
                audioPlayer.src = event.target.result;
                audioPlayerContainer.style.display = 'block';

                const api_url = "https://demo-api.models.ai4bharat.org/inference/asr/conformer";
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");

                const data = {
                    "config": {
                        "language": {
                            "sourceLanguage": language
                        },
                        "transcriptionFormat": {
                            "value": "transcript"
                        },
                        "audioFormat": "wav",
                        "samplingRate": "48000",
                        "postProcessors": null
                    },
                    "audio": [
                        {
                            "audioContent": audioContent
                        }
                    ],
                    "controlConfig": {"dataTracking": true}
                };

                const requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: JSON.stringify(data),
                    redirect: 'follow'
                };

                try {
                    const response = await fetch(api_url, requestOptions);
                    const result = await response.json();
                    console.log("Text Conversion Result:", result);

                    // Display the transcript in the HTML element
                    transcript = format(result.output[0].source);
                    transcriptDiv.innerText = transcript;
                } catch (error) {
                    console.error('Error:', error);
                }
            };

            reader.readAsDataURL(audioFile);
        });

        function format(inputString) {
            const words = inputString.split(' ');
            const lines = [];

            for (let i = 0; i < words.length; i += 8) {
                const lineWords = words.slice(i, i + 8);
                lines.push(lineWords.join(' '));
            }

            return lines.join('\n') + '\n';
        }
    </script>
</body>
</html>
