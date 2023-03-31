var game;


window.onload = () => {
    game = new Game(6, 7, false, 'game-area', 'menu');
    game.drawCurrentPosition();
}; 