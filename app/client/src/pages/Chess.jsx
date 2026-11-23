import { useEffect, useRef, useState } from 'react';
import { Chess as ChessGame } from 'chess.js';
import useOriginalPage, { loadScript } from '../original/useOriginalPage';
export default function Chess() {
  const game = useRef(new ChessGame()); const board = useRef(null);
  const [status, setStatus] = useState(''); const [position, setPosition] = useState('');
  useOriginalPage({ styles: ['https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css'], css: '.game{display:flex;justify-content:center}', bodyClass: '', title: '' });
  function updateStatus() {
    const g = game.current; const color = g.turn() === 'w' ? 'White' : 'Black';
    setStatus(g.isCheckmate() ? `Game over, ${color} is in checkmate.` : g.isDraw() ? 'Game over, drawn position' : `${color} to move${g.isCheck() ? `, ${color} is in check` : ''}`);
    setPosition(g.pgn().replace(/^\[[^\n]*\]\r?$/gm, '').trim().replace(/(?:^|\s)(?:1-0|0-1|1\/2-1\/2|\*)$/, ''));
  }
  useEffect(() => {
    let cancelled = false;
    loadScript('/assets/jquery/jquery.min.js').then(() => loadScript('https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js')).then(() => {
      if (cancelled) return;
      try { const pgn = localStorage.getItem('pgn'); const fen = localStorage.getItem('chessPosition'); if (pgn) game.current.loadPgn(pgn); else if (fen) game.current.load(fen); } catch { game.current.reset(); }
      board.current = window.Chessboard('board', { draggable: true, dropOffBoard: 'trash', onDrop(source, target) {
        try { game.current.move({ from: source, to: target, promotion: 'q' }); }
        catch { return 'snapback'; }
        localStorage.setItem('chessPosition', game.current.fen()); localStorage.setItem('pgn', game.current.pgn());
        updateStatus(); board.current.position(game.current.fen());
      }, position: game.current.fen(), moveSpeed: 'fast', pieceTheme: '/img/chesspieces/alpha/{piece}.png' });
      updateStatus();
    }).catch(() => {});
    function key(event) { if (event.key === 'ArrowLeft') { game.current.undo(); board.current?.position(game.current.fen()); updateStatus(); } }
    document.addEventListener('keydown', key);
    return () => { cancelled = true; document.removeEventListener('keydown', key); board.current?.destroy(); };
  }, []);
  return <><div className="game"><div id="board" style={{ width: '80vh' }}/></div><div id="status">{status}</div><button id="resetBtn" onClick={() => { game.current.reset(); board.current?.start(); localStorage.removeItem('chessPosition'); localStorage.removeItem('pgn'); updateStatus(); }}>Reset</button><br/><br/><div id="position">{position}</div></>;
}
