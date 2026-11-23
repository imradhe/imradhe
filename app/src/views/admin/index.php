<?php
locked(['admin','moderator']);
view('admin/partials/head');
renderView('views/admin/partials/sidebar.php');

?>

<!--Main Start-->
<style>
    .apexcharts-toolbar{
        display:none !important;
    }
</style>
<main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
    <h1 class="text-center mt-5"> <i class="bi bi-clock"></i> <span id="time"></span>
        
                <script>
                    function showTime(){
            var date = new Date()
            var h = date.getHours() 
            var m = date.getMinutes() 
            var s = date.getSeconds() 
            var session = "AM"
            
            if(h == 0){
                h = 12
            }
            
            if(h > 12){
                h = h - 12
                session = "PM"
            }
            
            h = (h < 10) ? "0" + h : h
            m = (m < 10) ? "0" + m : m
            s = (s < 10) ? "0" + s : s
            
            var time = h + ":" + m + " " + session
            document.querySelector("#time").innerText = time
            
            setTimeout(showTime, 1000)
            
        }

        showTime()
            </script>
    </h1>
    
</main>

<!--Main End-->