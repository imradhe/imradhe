<!DOCTYPE html>
<html lang="en">

<?php
    controller('Scene');
    $scene = new Scene();
    controller('Story');
    $story = new Story();
    $scene = $scene->getScene($_REQUEST['slug']);
    $story = $story->getStory($scene['storyID']);
    
    
    if(empty($story)){
        pageNotFound();
        exit;
    }
    
?>


<?php include("views/partials/scene/head.php") ?>
<style>
    body{
        overflow-x: none !important;
    }
</style>

<body class="light">
    <div class="d-flex justify-content-center text-center">
        <div id="header" class="row g-0 py-3 px-1" style="max-width: 800px;">
            <div class="col-md-8">
                <div class="row p-0 m-0 g-0">
                    <div class="col-3 col-sm-2 p-2">
                        <a href="<?php echo home();?>" class="text-decoration-none"><img src="<?php echo route('assets/img/imradhe.jpg');?>" class="rounded rounded-circle d-block img-fluid" alt="Radhe Shyam Salopanthula"></a>
                    </div>
                    <div class="col-9 col-sm-10 text-start p-2 pt-3">
                        <a href="<?php echo home();?>" class="link text-decoration-none"><h6>Radhe Shyam Salopanthula</h6></a>
                        <div class="list">
                            <span id="date">14 Nov, 2022</span>
                            · <span id="words">1202 Words</span>
                            · <a type="button" class="btn-play p-0 m-0 text-decoration-none" id="play"> <i class="bi bi-play-circle-fill"></i>
                                Listen </a>

                            <a type="button" class="btn-pause d-none p-0 m-0 text-decoration-none" id="pause" disabled> <i
                                    class="bi bi-pause-circle-fill"></i> Pause </a>

                            <a type="button" class="btn-resume d-none p-0 m-0 text-decoration-none" id="resume" disabled> <i
                                    class="bi bi-play-circle-fill"></i> Resume </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="social-icons p-2 pt-4">
                    <a target="_blank" href="https://instagram.com/imraadhe"><i
                            class="fs-5 bi bi-instagram mx-1"></i></a>
                    <a target="_blank" href="https://twitter.com/imraadhe"><i class="fs-5 bi bi-twitter mx-1"></i></a>
                    <a target="_blank" href="https://linkedin.com/in/imradhe"><i
                            class="fs-5 bi bi-linkedin mx-1"></i></a>
                    <a target="_blank" href="<?php echo home();?>"><i class="fs-5 bi bi-globe mx-1"></i></a>
                    <a type="button" data-bs-toggle="modal" data-bs-target="#shareModal" href="#"><i class="fs-5 bi bi-share-fill mx-1"></i></a>
                </div>
            </div>
        </div>
    <button class="btn btn-dark btn-theme position-fixed" title="toggleTheme"> <i class="bi bi-moon-fill text-white fs-6"></i> </button>

    </div>

    <div class="container px-5 text-justify mb-5 pb-5">
        <div class="title position-sticky bg-white pt-5 pb-3 border-bottom">
            <h1 class="scene"><?php echo $scene['title'];?></h1>
            <h5><a href="<?php echo route('stories/').$story['storyID'];?>" class="story"><?php echo $story['title'];?></a> · <span class="act">Act <?php echo integerToRoman($scene['actNumber']);?></span> · <span
                    class="chapter">Chapter <?php echo $scene['chapterNumber'];?></span></h5>
        </div>

        <article class="content mt-5 text-justify text-wrap" style="text-align: justify;" data-clarity-region="article">
             
           <?php echo stripslashes(stripslashes($scene['content']));?>
         
        </article>
    </div>

    <div class="modal fade" id="shareModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title fw-bolder" id="shareModalTitle"><span>Radhe Shyam Salopanthula</span></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                    <h4>Share this story with your friends and family!</h4>
                    <ul class="social-icons list-inline d-flex justify-content-center text-center mt-3">
                        <li class="social-icon mx-2 list-inline-item"><a
                                href="https://wa.me/?text=Here is a story for you.%0A%0AClick the link below to Read Now%0A%0A<?php echo url();?>"
                                class="bi bi-whatsapp fs-2" target="_blank"></a></li>
                        <li class="social-icon mx-2 list-inline-item"><a
                                href="https://www.facebook.com/sharer/sharer.php?u=<?php echo url();?>&quote=Here is a story for you.%0A%0AClick the link below to Read Now%0A"
                                class="bi bi-facebook fs-2" target="_blank"></a></li>
                        <li class="social-icon mx-2 list-inline-item"><a
                                href="https://twitter.com/intent/tweet?text=Here is a story for you.%0A%0AClick the link below to Read Now%0A%0A<?php echo url();?>"
                                class="bi bi-twitter fs-2" target="_blank"></a></li>
                        <li class="social-icon mx-2 list-inline-item"><a
                                href="https://www.linkedin.com/cws/share?url=<?php echo url();?>"
                                class="bi bi-linkedin fs-2" target="_blank"></a></li>
                    </ul>
                    <div class="input-group">
                        <input type="url" class="form-control" id="shareUrl" readonly>
                        <button class="btn" type="button" id="copyBtn">copy</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    
    <script>
        imgElements = document.querySelectorAll('img')
        imgElements.forEach(img => {
            img.classList.add('img-fluid')
        })
    </script>
    <script>

        content = document.querySelector('.content')
        words = content.innerText.match(/\b[-?(\w+)?]+\b/gi).length
        readMins = Math.ceil(words/183) + " mins read"
        document.querySelector('#words').innerText = readMins
        date = new Date("<?php echo $scene['createdDate']?>")
        document.querySelector('#date').innerText = date.toLocaleString('default', { month: 'short' })+" "+date.getDate()+", "+date.getFullYear()



        const body = document.querySelector("body")
        const themeBtn = document.querySelector(".btn-theme")
        const title = document.querySelector(".title")

        // Listen for button clicks
        themeBtn.addEventListener("click", changeThemes)
        themeBtn.addEventListener("click", changeButtonColors)
        themeBtn.addEventListener("click", changeButtonText)

        // Change theme colors
        function changeThemes() {
            body.classList.toggle("dark");
            title.classList.toggle("bg-black");
        }

        // Change button colors
        function changeButtonColors() {
            themeBtn.classList.toggle("light");
            title.classList.toggle("bg-white");
        }

        // Change button text
        function changeButtonText() {

            if (themeBtn.innerHTML === '<i class="bi bi-sun-fill text-dark fs-4"></i>') {
                themeBtn.classList.remove('btn-light')
                themeBtn.classList.add('btn-dark')
                themeBtn.innerHTML = '<i class="bi bi-moon-fill text-white fs-4"></i>'
            } else {
                themeBtn.classList.remove('btn-dark')
                themeBtn.classList.add('btn-light')
                themeBtn.innerHTML = '<i class="bi bi-sun-fill text-dark fs-4"></i>'
            }
        }       
    </script>

    <script>
        playBtn = document.querySelector('#play')
        pauseBtn = document.querySelector('#pause')
        resumeBtn = document.querySelector('#resume')

        msg = content.innerText
        msg = new SpeechSynthesisUtterance();
        msg.text = content.innerText;
        msg.voice = window.speechSynthesis.getVoices()[1]
        synth = window.speechSynthesis


        synth.cancel()

        play.addEventListener('click', function () {

            if (!('speechSynthesis' in window)) {
                alert('Text to Speech not available')
            }
            synth.cancel()

            msg.onstart = function (e) {
                play.disabled = true
                play.classList.add('d-none')
                pauseBtn.disabled = false
                pause.classList.remove('d-none')
            }
            msg.onend = function (e) {
                console.log('Finished in ' + event.elapsedTime + ' seconds.')
                play.disabled = false
                play.classList.remove('d-none')
                pauseBtn.disabled = true
                pause.classList.add('d-none')
                resume.disabled = true
                resume.classList.add('d-none')
            }
            synth.speak(msg);
        })


        pause.addEventListener('click', function () {
            synth.pause()
            play.disabled = true
            play.classList.add('d-none')
            pauseBtn.disabled = true
            pause.classList.add('d-none')
            resume.disabled = false
            resume.classList.remove('d-none')
            console.log(synth)
            if(synth.paused){
                alert('Paused')
            }
        })

        resume.addEventListener('click', function () {
            synth.resume()
            play.disabled = true
            play.classList.add('d-none')
            pauseBtn.disabled = false
            pause.classList.remove('d-none')
            resume.disabled = true
            resume.classList.add('d-none')
        })


        var copyBtn = document.querySelector("#copyBtn")
        var shareUrl = document.querySelector("#shareUrl") 
        var getUrl =  window.location.href
        shareUrl.value = getUrl
        copyBtn.addEventListener('click',function(){
        shareUrl.select()
        shareUrl.setSelectionRange(0, 99999)
        document.execCommand("copy")               
        copyBtn.innerHTML = "Copied!"
        setTimeout(function(){ copyBtn.innerHTML="copy" }, 1000)
        })
    </script>


  
</body>

</html>