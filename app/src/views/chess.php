<html>
  <head>
    <link rel="stylesheet" href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css" />
    <link rel="stylesheet" href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css" />

   <style>
    .game{
      display: flex;
      justify-content: center;
    }
   </style>
  </head>
  <body>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chess.js@0.10.2/chess.min.js"></script>
    
    <div class="game">      
      <div id="board" style="width: 80vh"></div>
    </div>
    
    <div id="status"></div>
    <button id="resetBtn">Reset</button>
<br><br>
    <div id="position"></div>

    <script>
      var board = Chessboard('board', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true
      })
      
      var game = new Chess()
      
      var onDrop = function(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';
  savePosition()
  if (move.flags === 'k' || move.flags === 'q') {
    var rook = move.to.charAt(0) + (move.color === 'w' ? '1' : '8');
    board.move(rook, move.to > move.from ? move.to[0] + '3' : move.to[0] + '7');
  }

  updateStatus();
  board.position(game.fen());
}

      var updateStatus = function() {
        var status = ''
        
        var moveColor = 'White'
        if (game.turn() === 'b') {
          moveColor = 'Black'
        }
        

        if (game.in_checkmate() === true) {
          status = 'Game over, ' + moveColor + ' is in checkmate.'
        }
        
        else if (game.in_draw() === true) {
          status = 'Game over, drawn position'
        }
        
        else {
          status = moveColor + ' to move'
          
          if (game.in_check() === true) {
            status += ', ' + moveColor + ' is in check'
          }
        }

        
        
        document.querySelector('#status').innerHTML = status
        
        document.querySelector('#position').innerHTML = game.pgn()
      }
      



var game = new Chess();

function loadPosition() {
  var fen = localStorage.getItem('chessPosition')
  if (fen) {
    game.load(fen);
    board.position(fen);
    document.querySelector('#position').innerHTML = localStorage.getItem('pgn')
  }
}

function savePosition() {
  localStorage.setItem('chessPosition', game.fen())
  localStorage.setItem('pgn', game.pgn())
}

var board = Chessboard('board', {
              draggable: true,
              dropOffBoard: 'trash',
              onDrop: onDrop,
              position: 'start',
              moveSpeed: 'fast',
              pieceTheme: 'img/chesspieces/alpha/{piece}.png'
            })

loadPosition()



updateStatus()

resetBtn = document.querySelector('#resetBtn')
resetBtn.onclick = function() {
  game.reset();
  board.start();
  localStorage.removeItem('chessPosition');
  updateStatus();
}

document.addEventListener('keydown', function(event) {
  if (event.which === 37) {
    game.undo();
    board.position(game.fen());
    updateStatus();
  }
})

    </script>
  </body>
</html>