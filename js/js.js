var game;


window.onload = () => {
    game = new Game(6, 7, 'game-area');
    game.drawCurrentPosition();
};