var openedPage = 'start';
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
    if (loadStats() == null) {
        console.log('delam staty');
        makeStatsArray();
        localStorage.setItem("games", JSON.stringify([]));
    }

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
    users[0].score = 0;
    users[1].score = 0;
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

function openPage(id) {
    if (inGame) {
        return;
    }
    if (id == 'stats') {
        displayStats();
    }
    document.getElementById(openedPage).style.display = 'none';
    document.getElementById(id).style.display = id == 'start' ? 'block' : 'flex';
    openedPage = id;
}

function loadStats() {
    return JSON.parse(localStorage.getItem('stats'));
}

function loadStat(searchedStat) {
    var stats = loadStats();
    let foundStat = null;
    stats.forEach(stat => {
        if (stat.name == searchedStat) {
            foundStat = stat;
        }
    });
    return foundStat;
}

function uploadStats(stats) {
    localStorage.setItem('stats', JSON.stringify(stats));
}

function displayStats() {
    if (loadStats() == null) {
        document.getElementById('stats-table').innerHTML = '<tr><td colspan="2">Nejsou uloženy žádné statistiky</td></tr>';
    } else {
        document.getElementById('stats-table').innerHTML = '';
        let stats = loadStats();
        stats.forEach(stat => {
            document.getElementById('stats-table').innerHTML += '<tr><td>' + stat.name + '</td><td>' + stat.value + '</td></tr>';
        })
    }
}

function makeStatsArray() {
    uploadStats([]);
    setStat('Počet odehraných her', 0);
    setStat('Počet odehraných tahů', 0);
    setStat('Počet Hráč vs Hráč her', 0);
    setStat('Počet Hráč vs Bot her', 0);
    setStat('Počet Bot vs Bot her', 0);
    setStat('Průměr odehraných tahů na hru', 0);
}

function setStat(stat, value) {
    var stats = loadStats();
    let statFound = false;
    stats.forEach(statistic => {
        if (statistic.name == stat) {
            statistic.value = value;
            statFound = true;
        }
    });
    if (!statFound) {
        stats.push({
            name: stat,
            value: value,
        });
    }
    uploadStats(stats);
}

function deleteStats() {
    localStorage.setItem('stats', null);
    displayStats();
}