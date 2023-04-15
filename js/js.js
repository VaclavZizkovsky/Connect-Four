var game;

function showMessage(message){
    document.querySelector("#message-snackbar").innerHTML = message;
    document.querySelector("#message-snackbar").className = 'showed';

    setTimeout(() => {
        document.querySelector("#message-snackbar").className = document.querySelector("#message-snackbar").className.replace('showed', '');
    }, 3000)
}


window.onload = () => {
    game = new Game(6, 7, true, 'game-area', 'menu');
}; 