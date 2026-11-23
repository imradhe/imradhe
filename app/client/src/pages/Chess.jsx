import { useRef, useState } from 'react';
import { Chess as ChessGame } from 'chess.js';
import { useStoredState } from '../hooks';
import { PageTitle } from '../components/Common';
const pieces = { wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙', bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟' };
export default function Chess() {
  const [saved, setSaved] = useStoredState('imradhe:chess', '');
  const game = useRef(null);
  if (!game.current) { game.current = new ChessGame(); try { if (saved) game.current.loadPgn(saved); else { const old = localStorage.getItem('chessPosition'); if (old) game.current.load(old); } } catch { game.current.reset(); } }
  const [selected, setSelected] = useState(''); const [, redraw] = useState(0); const [notice, setNotice] = useState('');
  const [flipped, setFlipped] = useState(false);
  function sync() { setSaved(game.current.pgn()); setSelected(''); redraw(v => v + 1); }
  function move(square) {
    if (selected) {
      try { game.current.move({ from: selected, to: square, promotion: 'q' }); setNotice(''); sync(); return; } catch { /* Selecting another own piece changes selection. */ }
    }
    const piece = game.current.get(square);
    if (piece?.color === game.current.turn()) { setSelected(square); setNotice(''); }
    else { setSelected(''); setNotice('Select a piece of the side to move.'); }
  }
  const turn = game.current.turn() === 'w' ? 'White' : 'Black';
  const status = game.current.isCheckmate() ? `${turn} is in checkmate.` : game.current.isDraw() ? 'Drawn position.' : `${turn} to move${game.current.isCheck() ? ' — in check' : ''}.`;
  const legal = selected ? game.current.moves({ square: selected, verbose: true }).map(m => m.to) : [];
  const squares = game.current.board().flat(); if (flipped) squares.reverse();
  return <div className="chess-page"><PageTitle title="Chess"/><h1>Chess</h1><p role="status">{status}</p><p className="muted">Select a piece, then its destination. Pawns promote to queens.</p><div className="chessboard" aria-label="Chess board">{squares.map((piece, index) => {
    const rank = flipped ? 1 + Math.floor(index / 8) : 8 - Math.floor(index / 8); const file = 'abcdefgh'[flipped ? 7 - index % 8 : index % 8]; const square = `${file}${rank}`;
    return <button type="button" key={square} aria-label={`${square}${piece ? ` ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ' empty'}`} aria-pressed={selected === square} className={`square ${(index + Math.floor(index / 8)) % 2 ? 'black-square' : 'white-square'} ${selected === square ? 'selected' : ''} ${legal.includes(square) ? 'legal' : ''}`} onClick={() => move(square)}><span>{piece ? pieces[piece.color + piece.type] : ''}</span><small>{square}</small></button>;
  })}</div><p role="status">{notice}</p><div className="actions"><button onClick={() => { game.current.undo(); sync(); }}>Undo</button><button className="secondary" onClick={() => setFlipped(v => !v)}>Flip board</button><button className="secondary" onClick={() => { game.current.reset(); localStorage.removeItem('chessPosition'); localStorage.removeItem('pgn'); sync(); }}>Reset</button></div><pre className="pgn">{game.current.pgn()}</pre></div>;
}
