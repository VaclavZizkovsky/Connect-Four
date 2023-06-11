var game;
let users = [
    {
        color: 'red',
        name: 'Franta Vomáčka',
        bot: false,
        score: 0,
    }, {
        color: 'blue',
        name: 'Bot',
        bot: false,
        score: 0
    }
];
let inGame = false;


function showMessage(message) {
    document.querySelector("#message-snackbar").innerHTML = message;
    document.querySelector("#message-snackbar").className = 'showed';

    setTimeout(() => {
        document.querySelector("#message-snackbar").className = document.querySelector("#message-snackbar").className.replace('showed', '');
    }, 3000)
}

function enterGame() {
    users[0].name = document.querySelector('#username1').value;
    users[1].name = document.querySelector('#username2').value;

    users[0].bot = document.querySelector('#bot-select1').checked;
    users[1].bot = document.querySelector('#bot-select2').checked;

    document.querySelector('#start').style.display = 'none';
    document.querySelector('#game').style.display = 'flex';
    inGame = true;
    game = new Game(6, 7, users);
}

function leaveGame() {
    if (!inGame) {
        showMessage('Zkurvenej bug jak je to možný že se tohle stane');
        return;
    }
    if (!game.gameEnded) {
        showMessage('Nelze odejít v probíhající hře');
        return;
    }

    document.querySelector('#start').style.display = 'block';
    document.querySelector('#game').style.display = 'none';
    inGame = false;
    game = null;
}


window.addEventListener('keydown', (e) => {
    if (!inGame) {
        return;
    }

    if (e.key == 'ArrowRight') {
        game.displayMove('next');
    }

    if (e.key == 'ArrowLeft') {
        game.displayMove('previous');
    }
});

function disableUsernameInput(input) {
    if (!document.querySelector('#bot-select' + input).checked) {
        document.querySelector('#username' + input).removeAttribute('disabled')
    } else {
        document.querySelector('#username' + input).setAttribute('disabled', "1");
        document.querySelector('#username' + input).value = "Bot";
    }
}