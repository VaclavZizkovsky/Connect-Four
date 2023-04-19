var game;

function showMessage(message) {
    document.querySelector("#message-snackbar").innerHTML = message;
    document.querySelector("#message-snackbar").className = 'showed';

    setTimeout(() => {
        document.querySelector("#message-snackbar").className = document.querySelector("#message-snackbar").className.replace('showed', '');
    }, 3000)
}

let users = [
    {
        color: 'red',
        name: 'Franta Vomáčka',
        bot: false,
    }, {
        color: 'blue',
        name: 'Bot',
        bot: true,
    }
];


game = new Game(6, 7, users);
