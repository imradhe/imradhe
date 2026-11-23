async function transcribeAudio() {
    const audioInput = document.getElementById("audioInput");
    const languageSelect = document.getElementById("languageSelect");
    const transcriptionResult = document.getElementById("transcriptionResult");

    const selectedLanguage = languageSelect.value;
    const audioFile = audioInput.files[0];

    if (!audioFile) {
        alert("Please select an audio file.");
        return;
    }

    const formData = new FormData();
    formData.append("config", JSON.stringify({
        "language": {
            "sourceLanguage": selectedLanguage
        },
        "transcriptionFormat": { "value": "transcript" },
        "audioFormat": "wav"
    }));
    formData.append("audio", audioFile);

    try {
        // Send the audio file and language selection to the API endpoint
        const response = await fetch(`https://asr-api.ai4bharat.org/asr/v1/recognize/${selectedLanguage}`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            if (result.status === "SUCCESS" && result.output.length > 0) {
                const transcription = result.output[0].source;
                transcriptionResult.textContent = "Transcription: " + transcription;
            } else {
                console.error("Transcription failed.");
            }
        } else {
            console.error("Error transcribing audio.");
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}
