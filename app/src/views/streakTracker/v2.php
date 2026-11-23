<!DOCTYPE html>
<html>
<head>
    <title>StreakTracker - Streak & Reward</title>
    <style>=
        
        .card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
    </style>
</head>
<?php include('views/partials/head.php'); ?>
<body class="container text-center">
    <div class="mt-5 pt-5 mb-3">
        <h1 class="fw-bold">StreakTracker</h1>
        <h3 class="text-nowrap">Streak & Reward</h3>
    </div>
<div class="container">

  <div class="row">
    <div class="col-md-6 offset-md-3">
      <div class="card p-5">
        <div id="app" class="card-body">
          <h2 class="card-title fw-bolder text-danger" id="streakTitle"></h2>
          <h3 class="card-title fw-bolder text-danger"><i class="bi bi-fire h1"></i> <span id="streak">1</span></h3>
          <h5 class="card-title">Reward: <span id="reward"></span></h5>
          <p class="card-text">Keep track of your daily streaks!</p>
            <button id="practice" class="btn btn-primary rounded-pill my-2">Practice for the day</button>
            <button id="reset" class="btn btn-secondary rounded-pill my-2">Reset Reward</button>
        </div>
        
        
        <form id="settings" class="card-body">
            
            <input type="text" id="title" class="rounded-pill form-control" placeholder="Enter your streak title">
            <div class="row gy-2 my-3">
                <div class="col-md-6">
                    <input type="number" id="target" class="rounded-pill form-control" placeholder="Enter target reward in ₹">
                </div>
                <div class="col-md-6">
                    <input type="number" id="daily" class="rounded-pill form-control"  placeholder="Enter daily reward in ₹">
                </div>
            </div>
            <div class="d-grid gap-2">
                <button id="start"class="btn btn-primary rounded-pill">Start Streak</button>
            </div>
        </form>
        
        <div id="targetReached" class="card-body">
          <h2 class="card-title fw-bolder text-danger" id="successStreakTitle"></h2>
          <h3 class="card-title fw-bolder text-danger"><i class="bi bi-fire h1"></i> <span id="successStreak">1</span></h3>
          <h5 class="card-title">Reward: <span id="successReward"></span></h5>
          <h2 class="card-title fw-bolder text-success">Congrats! You reached your target</h2>
            
          <button onclick="location.reload()" class="btn btn-primary rounded-pill">New Streak</button>
        </div>
        
        
      </div>
    </div>
  </div>
</div>

   
        <h4 class="footer mt-5">
            Developed By
            <a rel="noopener" href="https://imradhe.com" style="text-decoration: none;">
            Radhe Shyam Salopanthula
            </a>
        </h4>
<script>
    var title = localStorage.getItem("title") || ""
    var streak = localStorage.getItem("streak") || 0
    var reward = localStorage.getItem("reward") || 0
    var target = localStorage.getItem("target") || 0
    var daily = localStorage.getItem("daily") || 0
    var lastClicked = localStorage.getItem("lastClicked") || 0
    app = document.querySelector('#app')
    settings = document.querySelector('#settings')
    targetReached = document.querySelector('#targetReached')


    checkStreak()
    
    function checkStreak(){
        if(localStorage.getItem("streak") === null || localStorage.getItem("streak") == 0 || localStorage.getItem("target") == 0 || localStorage.getItem("streak") == 0) {
            resetReward()
            app.style.display = "none"
            targetReached.style.display = "none"
            settings.style.display = "block"
        }else if(reward >= target){
                settings.style.display = "none"
                targetReached.style.display = "block"
                app.style.display = "none"
                document.getElementById("successStreakTitle").innerHTML =  title;
                document.getElementById("successStreak").innerHTML =  streak;
                document.getElementById("successReward").innerHTML = "₹" + reward;
                resetReward()
            }
        else{
            app.style.display = "block"
            settings.style.display = "none"
            targetReached.style.display = "none"
            document.getElementById("streakTitle").innerHTML =  title;
            document.getElementById("streak").innerHTML =  streak;
            document.getElementById("reward").innerHTML = "₹" + reward;

        }
    }

    function startStreak(e){
        e.preventDefault()
            streak = 1
            target = document.querySelector('#target').value
            daily = document.querySelector('#daily').value
            title = document.querySelector('#title').value
            reward = 0
            
            localStorage.setItem("target", target)
            localStorage.setItem("daily", daily)
            localStorage.setItem("streak", streak)
            localStorage.setItem("reward", reward)
            localStorage.setItem("title", title)
            checkStreak()
            var currentTime = new Date().getTime()
            lastClicked = currentTime
            localStorage.setItem("lastClicked", lastClicked)
    }

    
    function addToReward() {
        var currentTime = new Date().getTime()
        if (currentTime - lastClicked >= 24 * 60 * 60 * 1000) {
            streak++;
            localStorage.setItem("streak", streak);
            if (streak >= 3) {
                reward = streak * daily - daily;
            }
            localStorage.setItem("reward", reward);

            lastClicked = currentTime
            localStorage.setItem("lastClicked", lastClicked)

            if(reward >= target){
                settings.style.display = "none"
                targetReached.style.display = "block"
                app.style.display = "none"
                document.getElementById("successStreakTitle").innerHTML =  title;
                document.getElementById("successStreak").innerHTML =  streak;
                document.getElementById("successReward").innerHTML = "₹" + reward;
                resetReward()
                
            }
            else{
                document.getElementById("streak").innerHTML =  streak;
                document.getElementById("reward").innerHTML = "₹" + reward;
            }
        
        }else{
            alert("Wait till next day!")
        }
    }

    function resetReward(){
        reward = 0
        streak = 0
        target = 0
        daily = 0
        lastClicked = 0
        
        localStorage.setItem("reward", reward)
        localStorage.setItem("streak", streak)
        localStorage.setItem("target", target)
        localStorage.setItem("daily", daily)
        localStorage.setItem("lastClicked", lastClicked)
    }

    
       document.querySelector("#start").addEventListener("click", startStreak)
       document.querySelector("#settings").addEventListener("submit", startStreak)
       document.querySelector("#practice").addEventListener("click", addToReward)
       document.querySelector("#reset").addEventListener("click", function(){
        location.reload()
        resetReward()
    })
    </script>
</body>
</html>
