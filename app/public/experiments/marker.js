const film = document.querySelector('#film');
document.querySelector('#play').addEventListener('click', () => film.play().catch(() => {}));
document.querySelector('a-marker').addEventListener('markerFound', () => film.play().catch(() => {}));
document.querySelector('a-marker').addEventListener('markerLost', () => film.pause());
