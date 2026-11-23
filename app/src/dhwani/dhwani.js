let audio = document.querySelector("audio")
let syncContainer = document.querySelector("#sync-container")
let audioUrlInput = document.querySelector("#audio-url")
let transcription = document.querySelector("#transcript")
let syncBtn = document.querySelector("#pills-sync-tab")
let resetButton = document.querySelector('#reset')
let resetSync = document.querySelector('#resetSync')
let transcript = localStorage.getItem('transcript') || transcription.value
let lines = []
transcription.value = localStorage.getItem('transcript') || ""
audioUrlInput.value = localStorage.getItem('audioUrl') || ""
audio.src = localStorage.getItem('audioUrl') || ""


document.addEventListener("keydown", (event) => {
  if (event.shiftKey && event.code === "Space") {
    event.preventDefault() // Prevent default Spacebar behavior (e.g., scrolling down)
    if (audio.paused) {
      audio.play()
    } else {
      audio.pause()
    }
  }
})

function events(lines){
  let playBtns = document.querySelectorAll('.btn-play')
  let resetBtns = document.querySelectorAll('.btn-reset')
  let plusBtns = document.querySelectorAll('.btn-plus')
  let minusBtns = document.querySelectorAll('.btn-minus')
    playBtns.forEach(playBtn => {
      playBtn.addEventListener('click', function (e) {
          e.preventDefault()

          let lineElement = this.closest('.line')
          let lineId = lineElement.id
          let lineIndex = parseInt(lineId.replace('line', ''))
          let line = lines[lineIndex]

          if (line && line.start !== null) {
          audio.currentTime = parseFloat(line.start)
          audio.play()
          }
      })
      })



    resetBtns.forEach(resetBtn => {
        resetBtn.addEventListener('click', function (e) {
            e.preventDefault()
            let lineIndex = this.closest('.line').id.replace('line', "")
            if (lineIndex !== -1) {
                lines[lineIndex].start = null
                let lineTime = document.querySelector('#line' + lineIndex + " .time")
                lineTime.innerHTML = time(null)
                disableButtons(document.querySelector('#line'+lineIndex))
            }
        })
    })


    


    plusBtns.forEach(plusBtn => {
      plusBtn.addEventListener('click', function (e) {
        e.preventDefault()
        let lineId = this.closest('.line').id
        let lineIndex = lines.findIndex(item => "line" + item.id === lineId)
        if (lineIndex >= 0) {
          let currentLine = lines[lineIndex]

          if (currentLine.start !== null) {
            let maxStartTime = audio.duration - 0.25
            if (currentLine.start < maxStartTime) {
              currentLine.start += 0.25
              let currentLineTime = document.querySelector('#line' + currentLine.id + ' .time')
              currentLineTime.innerHTML = time(currentLine.start)
              audio.currentTime = currentLine.start

            }
          }
        }
      })
    })


    minusBtns.forEach(minusBtn => {
      minusBtn.addEventListener('click', function (e) {
        e.preventDefault()
        let lineId = this.closest('.line').id
        let lineIndex = lines.findIndex(item => "line" + item.id === lineId)
        if (lineIndex >= 0) {
          let currentLine = lines[lineIndex]

          if (currentLine.start !== null) {
            if (currentLine.start >= 0.25) {
              currentLine.start -= 0.25
              let currentLineTime = document.querySelector('#line' + currentLine.id + ' .time')
              currentLineTime.innerHTML = time(currentLine.start)

              audio.currentTime = currentLine.start

              // Automatically update the end time of the previous line
              if (lineIndex > 0) {
                let prevLine = lines[lineIndex - 1]
                let prevLineTime = document.querySelector('#line' + prevLine.id + ' .time')
                prevLineTime.innerHTML = time(prevLine.start)
              }
            }
          }
        }
      })
    })

    
  document.addEventListener('keydown', (event) => {
    let activeLine = document.querySelector('.line.active')
  
    if (!activeLine) {
      // If there are no active lines and the first line has a null start time, update the first line.
      if (lines.length > 0 && lines[0].start === null) {
        event.preventDefault()
        let currentTime = audio.currentTime
        let firstLine = document.getElementById('line0')
        let firstLineTimeElement = firstLine.querySelector('.time')
        
        if (firstLineTimeElement) {
          let newStartTime = currentTime.toFixed(2)
          firstLineTimeElement.innerHTML = time(newStartTime)
          lines[0].start = parseFloat(newStartTime)
          // Enable reset and play buttons
          enableButtons(firstLine)
        }
      }
      return
    }
  
    let activeLineId = activeLine.id
    let activeLineIndex = parseInt(activeLineId.replace('line', ''))
  
    if (event.code === 'ArrowDown') { // Down arrow
      event.preventDefault()
      
      let nextLine = document.getElementById('line' + (activeLineIndex + 1))
      if (nextLine) {
        let currentTime = audio.currentTime
        let currentLineTimeElement = activeLine.querySelector('.time')
        let nextLineTimeElement = nextLine.querySelector('.time')
  
        if (currentLineTimeElement && nextLineTimeElement) {
          let newStartTime = currentTime.toFixed(2)
          nextLineTimeElement.innerHTML = time(newStartTime)
          lines[activeLineIndex + 1].start = parseFloat(newStartTime)
          // Enable reset and play buttons
          enableButtons(nextLine)
        }
      }
    } else if (event.code === 'ArrowUp') { // Up arrow
      event.preventDefault()
      
      let currentLineTimeElement = activeLine.querySelector('.time')
      if (currentLineTimeElement) {
        currentLineTimeElement.innerHTML = time(null)
        lines[activeLineIndex].start = null
        // Disable reset and play buttons
        disableButtons(activeLine)
      }
    } else if (event.code === 'ArrowLeft') { // Left arrow
      event.preventDefault()
      let minusButton = activeLine.querySelector('.btn-minus')
      if (minusButton) {
        minusButton.click()
      }
    } else if (event.code === 'ArrowRight') { // Right arrow
      event.preventDefault()
      let plusButton = activeLine.querySelector('.btn-plus')
      if (plusButton) {
        plusButton.click()
      }
    }
    
  })



}

syncBtn.addEventListener("click", function () {
  syncBtn.blur()
  transcript = localStorage.getItem('transcript') || transcription.value
  lines = JSON.parse(localStorage.getItem('lines')) || transcriptParser(transcript)
  loadSync(lines)
})



function time(time) {
  if (isNaN(time) || time === null) {
    return "- -:- -:- -"
  } else {
    var minutes = Math.floor(time / 60)
    var seconds = Math.floor(time % 60)
    var milliseconds = Math.round((time - Math.floor(time)) * 100)

    var result =
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0") +
      ":" +
      milliseconds.toString().padStart(2, "0")
    return result
  }
}

function loadAudio() {
  let audioUrl = audioUrlInput.value;
  audio.src = audioUrl;
  
  if (localStorage.getItem('audioUrl') !== audioUrl) {
    transcript = "";
    lines = [];
    transcription.value = "";
    loadSync(lines);
    check(lines);
    localStorage.removeItem('transcript');
    localStorage.removeItem('lines');
    localStorage.setItem('audioUrl', audioUrl);
  }
}



function check(lines){
  for (let i = 0; i < lines.length; i++) {
    if(lines[i].start === null) disableButtons(document.querySelector('#line'+i))
    
  }
}

function transcriptParser(transcript) {
  let lines = transcript.split("\n")
  let linesData = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    let lineObject = {
      id: i,
      start: null,
      line: line,
    }

    if (i === 0) {
      lineObject = {
        id: i,
        start: 0.01,
        line: line,
      }
    }

    linesData.push(lineObject)
  }

  return linesData
}

function generateSync(lines) {
  let html = ""
  for (let line of lines) {
    html += `<div class="row my-2 line rounded-pill mx-2" id="line${line.id}">
                  <div class="col-auto d-flex align-items-center">
                    <a class="link btn-reset fs-4 mx-1" id="reset${line.id}"><i class="bi bi-x"></i></a>
                    <span class="text-nowrap time">${time(line.start)}</span> 
                    <a class="link btn-minus fs-4 mx-1" id="minus${line.id}"><i class="bi bi-dash"></i></a>
                    <a class="link btn-plus fs-4 mx-1" id="plus${line.id}"><i class="bi bi-plus"></i></a>
                    <a class="link btn-play fs-4 mx-1" id="play${
      line.id
    }"><i class="bi bi-play-circle-fill"></i></a>
                  </div>
                  <div class="col-lg-7 col-md-5 col-sm-5">
                    <input title="line" class="form-control" type="text" value="${
                      line.line
                    }">
                  </div>
                  <div class="d-none col-auto d-flex">
                  
                  <a class="link btn-add fs-4 mx-1" id="add${line.id}"><i class="bi bi-plus-circle"></i></a>
                      <a class="link btn-delete fs-4 mx-1 text-danger" id="delete${line.id}"><i class="bi bi-trash"></i></a>
                  </div>
               </div>`
  }
  return html
}

function loadSync(lines) {
  syncContainer.innerHTML = generateSync(lines)
  check(lines)
  events(lines)
}

audio.addEventListener("timeupdate", () => {
  let currentTime = audio.currentTime

  lines.forEach((line, index) => {
    let lineElement = document.getElementById("line" + line.id)

    let currentLineStartTime = parseFloat(line.start)
    let nextLineStartTime = findNextLineStartTime(index)

    if (
      currentLineStartTime &&
      currentTime >= currentLineStartTime &&
      currentTime < nextLineStartTime
    ) {
      lineElement.classList.add("active")
      lineElement.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      lineElement.classList.remove("active")
    }

    localStorage.setItem('audioUrl', audio.src)
    localStorage.setItem('transcript', transcript)
    localStorage.setItem('lines', JSON.stringify(lines))
  })
})

function findNextLineStartTime(startIndex) {
  for (let i = startIndex + 1; i < lines.length; i++) {
    let nextLineStartTime = lines[i].start
    if (nextLineStartTime !== null) {
      return nextLineStartTime
    }
  }
  return Number.POSITIVE_INFINITY
}



function enableButtons(lineElement) {
    let playBtn = lineElement.querySelector('.btn-play');
    let resetBtn = lineElement.querySelector('.btn-reset');
    let plusBtn = lineElement.querySelector('.btn-plus');
    let minusBtn = lineElement.querySelector('.btn-minus');
    
    playBtn.classList.remove('disabled');
    playBtn.classList.remove('text-muted');
    playBtn.style.pointerEvents = 'auto';
    
    plusBtn.classList.remove('disabled');
    plusBtn.classList.remove('text-muted');
    plusBtn.style.pointerEvents = 'auto';
    
    
    minusBtn.classList.remove('disabled');
    minusBtn.classList.remove('text-muted');
    minusBtn.style.pointerEvents = 'auto';
  
    resetBtn.classList.remove('disabled');
    resetBtn.classList.remove('text-muted');
    resetBtn.style.pointerEvents = 'auto';
  }

  function disableButtons(lineElement) {
    let playBtn = lineElement.querySelector('.btn-play');
    let resetBtn = lineElement.querySelector('.btn-reset');
    let plusBtn = lineElement.querySelector('.btn-plus');
    let minusBtn = lineElement.querySelector('.btn-minus');
    
    playBtn.classList.add('disabled');
    playBtn.classList.add('text-muted');
    playBtn.style.pointerEvents = 'none';
    
    plusBtn.classList.add('disabled');
    plusBtn.classList.add('text-muted');
    plusBtn.style.pointerEvents = 'none';
    
    
    minusBtn.classList.add('disabled');
    minusBtn.classList.add('text-muted');
    minusBtn.style.pointerEvents = 'none';
  
    resetBtn.classList.add('disabled');
    resetBtn.classList.add('text-muted');
    resetBtn.style.pointerEvents = 'none';
  }

  function download(data) {
    let jsonData = JSON.stringify(data, null, 2); // The third argument adds indentation for better readability
    let blob = new Blob([jsonData], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'lines.json';
    a.click();
    URL.revokeObjectURL(url);
}

function downloadAsSRT(data) {
    let srtContent = '';
    for (let i = 0; i < data.length; i++) {
        if (data[i].start !== null) {
            let startTime = data[i].start === "- -:- -:- -" ? "" : time(data[i].start);
            let endTime = data[i + 1] && data[i + 1].start !== null ? time(data[i + 1].start) : "";
            let line = data[i + 1] ? data[i + 1].line : "";
            srtContent += `${data[i].id + 1}\n${startTime} --> ${endTime}\n${line}\n\n`;
        }
    }

    let blob = new Blob([srtContent], { type: 'text/srt' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'subtitles.srt';
    a.click();
    URL.revokeObjectURL(url);
}


resetButton.addEventListener('click', function() {
  localStorage.clear();
  transcription.value = '';
  lines = []
  loadSync(lines)
  check(lines)
  audio.src = null
  audioUrlInput.value = ""
});


resetSync.addEventListener('click', function() {
  lines = transcriptParser(transcription.value)
  loadSync(lines)
  check(lines)
  audio.currentTime = 0
  audio.play()
})