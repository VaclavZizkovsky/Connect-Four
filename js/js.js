var openedPage = 'start';
var game;
let users = [
    {
        color: 'red',
        name: 'Hráč 1',
        bot: false,
        score: 0,
    }, {
        color: 'blue',
        name: 'Hráč 2',
        bot: false,
        score: 0
    }
];
let inGame = false;
let hoveringCol = -1;

/**
 * @description zobrazí zprávu ve snackbaru
 * @param {String} message zpráva
 */
function showMessage(message) {
    document.querySelector("#message-snackbar").innerHTML = message;
    document.querySelector("#message-snackbar").className = 'showed';

    setTimeout(() => {
        document.querySelector("#message-snackbar").className = document.querySelector("#message-snackbar").className.replace('showed', '');
    }, 3000)
}

/**
 * @description spustí hru
 */
function enterGame() {
    if (document.querySelector('#username1').value == '' || document.querySelector('#username2').value == '') {
        showMessage('Vyplň uživatelská jména');
        return;
    }

    if (loadStats() == null) {
        makeStatsArray();
        localStorage.setItem("games", JSON.stringify([]));
    }

    users[0].name = document.querySelector('#username1').value;
    users[1].name = document.querySelector('#username2').value;

    users[0].bot = document.querySelector('#bot-select1').checked;
    users[1].bot = document.querySelector('#bot-select2').checked;

    inGame = true;
    game = new Game(6, 7, users, false);
    document.querySelector('#start').style.display = 'none';
    document.querySelector('#game').style.display = 'flex';
}

/**
 * @description opustí hru
 */
function leaveGame() {
    if (!inGame) {
        showMessage('Zkurvenej bug jak je to možný že se tohle stane');
        return;
    }
    if (!game.gameEnded && !game.analysis.analysisMode) {
        showMessage('Nelze odejít v probíhající hře');
        return;
    }

    document.querySelector('#' + openedPage).style.display = openedPage == 'start' ? 'block' : 'flex';
    document.querySelector('#game').style.display = 'none';
    inGame = false;
    game = null;
    users[0].score = 0;
    users[0].name = 'Hráč 1';
    users[0].bot = false;
    users[1].score = 0;
    users[1].name = 'Hráč 2';
    users[1].bot = false;
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


/**
 * @description vypne input, když je selectnut bot
 * @param {Number} input číslo inputu (1 nebo 2)
 */
function disableUsernameInput(input) {
    if (!document.querySelector('#bot-select' + input).checked) {
        document.querySelector('#username' + input).removeAttribute('disabled')
    } else {
        document.querySelector('#username' + input).setAttribute('disabled', '1');
        document.querySelector('#username' + input).value = "Bot";
    }
}

/**
 * @description otevře stránku
 * @param {Number} id id stránky
 */
async function openPage(id) {
    if (inGame) {
        return;
    }
    if (id == 'stats') {
        displayStats();
    }
    if (id == 'analysis') {
        displayOldGames();
    }
    document.getElementById(openedPage).style.display = 'none';
    document.getElementById(id).style.display = id == 'start' ? 'block' : 'flex';
    openedPage = id;

    //počká ať se to resolvne
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1);
    })
}

//STATISTIKY

/**
 * @description načte statistiky z localStorage
 * @returns objekt statistik
 */
function loadStats() {
    return JSON.parse(localStorage.getItem('stats'));
}

/**
 * @description získá konkrétní statistiku z localStorage
 * @param {String} searchedStat název hledané statistiky
 * @returns {Object} načtená statistika
 */
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

/**
 * @description nahraje statistiky do localStorage
 * @param {Array} stats pole statistik 
 */
function uploadStats(stats) {
    localStorage.setItem('stats', JSON.stringify(stats));
}

/**
 * @description vykreslí statistiky do tabulky
 */
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

/**
 * @description udělá defaultní pole statistik v localStorage
 */
function makeStatsArray() {
    uploadStats([]);
    setStat('Počet odehraných her', 0);
    setStat('Počet odehraných tahů', 0);
    setStat('Počet Hráč vs Hráč her', 0);
    setStat('Počet Hráč vs Bot her', 0);
    setStat('Počet Bot vs Bot her', 0);
    setStat('Průměr odehraných tahů na hru', 0);
}

/**
 * @description nastaví statistiku v localStorage
 * @param {String} stat název statistiky
 * @param {*} value hodnota statistiky
 */
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

/**
 * @description vymaže všechny statistiky z localStorage
 */
function deleteStats() {
    localStorage.setItem('stats', null);
    localStorage.setItem('games', null);
    displayStats();
}

//ANALÝZA

/**
 * @description vykreslí odehrané hry do tabulky
 */
function displayOldGames() {
    //loadne staré hry z localStorage
    var games = JSON.parse(localStorage.getItem("games"));
    games.reverse();

    //načte checkboxy
    let pvpGames = document.querySelector('#last-played-games-select-1').checked; //pvp = hráč vs hráč
    let pvbGames = document.querySelector('#last-played-games-select-2').checked; //pvb = hráč vs bot
    let bvbGames = document.querySelector('#last-played-games-select-3').checked; //bvb = bot vs bot

    var table = document.getElementById("last-played-games-table");
    if (games == null || (!pvpGames && !pvbGames && !bvbGames)) {
        table.innerHTML = '<tr><td colspan="3">Žádné hry k načtení</td></tr>';
        return;
    }

    // uloží id filtrovaných her (aby se neukládaly z toho splicovaného pole)
    // nefunguje když je pole games prázdné? (neověřeno)
    let gameIDs = [];
    let splicedCount = 0;
    for (let i = 0; i < games.length; i++) {

        //hráč versus hráč
        if (!pvpGames && (!games[i].usersData[0].bot && !games[i].usersData[1].bot)) {
            games.splice(i, 1);
            i--;
            splicedCount++;
            continue;
        }

        //bot versus bot
        if (!bvbGames && (games[i].usersData[0].bot && games[i].usersData[1].bot)) {
            games.splice(i, 1);
            i--;
            splicedCount++;
            continue;
        }

        //hráč versus bot
        if (!pvbGames && ((games[i].usersData[0].bot && !games[i].usersData[1].bot) || (!games[i].usersData[0].bot && games[i].usersData[1].bot))) {
            games.splice(i, 1);
            i--;
            splicedCount++;
            continue;
        }

        gameIDs.push(i + splicedCount);
    }

    table.innerHTML = '';
    for (let i = 0; i < games.length; i++) {
        table.innerHTML += '<tr> <td class="normal-cell">' + games[i].usersData[0].name + ' vs. ' + games[i].usersData[1].name + '</td> <td class="normal-cell">' + games[i].time + '</td> <td class="normal-cell">' + games[i].usersData[0].score + ' – ' + games[i].usersData[1].score + '</td> <td class="normal-cell">' + games[i].moves.length + ' tahů</td> <td class="button-cell"><button onclick="analyseGame(' + gameIDs[i] + ')" title="Analyzovat"><i class="fa-solid fa-compass"></i></button></td> <td class="button-cell"><button onclick="deleteGame(' + gameIDs[i] + ')" title="Smazat hru"><i class="fa-solid fa-trash"></i></button></td> </tr>'
    }
}

/**
 * @description vstoupí do analýzy odehrané hry
 * @param {Number} id id hry
 */
async function analyseGame(id) {
    var games = JSON.parse(localStorage.getItem("games"));
    games.reverse();
    var analyzedGame = games[id];


    let users = analyzedGame.usersData;
    game = new Game(6, 7, users, true);
    game.playingPlayer = analyzedGame.moves.length % 2 == 0 ? (analyzedGame.firstPlayer == 'red' ? 'blue' : 'red') : analyzedGame.firstPlayer;
    game.playingPlayer = analyzedGame.gameResigned ? (game.playingPlayer == 'red' ? 'blue' : 'red') : game.playingPlayer;
    document.querySelector('.beginning-player').innerHTML = analyzedGame.usersData[0].color == analyzedGame.firstPlayer ? analyzedGame.usersData[0].name : analyzedGame.usersData[1].name;
    document.querySelector('.ending-player').innerHTML = analyzedGame.usersData[0].color == analyzedGame.firstPlayer ? analyzedGame.usersData[1].name : analyzedGame.usersData[0].name;
    game.gameEnded = true;
    game.gameResigned = analyzedGame.gameResigned;
    game.gameIsDraw = game.board.checkWin();
    game.board.moves = analyzedGame.moves;
    game.board.getMovePosition(game.board.moves.length, analyzedGame.firstPlayer);

    //zapne loading
    document.querySelector('#loading-text').innerHTML = 'Načítám hru a hledám nejlepší tahy...';
    setProgress(0);
    await openPage('loading');


    //najde nejlepší tahy pro pozici
    let bestMoves = [];
    for (let i = 0; i < analyzedGame.moves.length; i++) {
        let boardCopy = this.game.board.copy();
        boardCopy.latestPosition = true;
        boardCopy.getMovePosition(i + 1, analyzedGame.firstPlayer);
        boardCopy.moves.splice(boardCopy.displayedMove, boardCopy.moves.length - boardCopy.displayedMove);
        await this.game.doMinimax(boardCopy, this.game.bot.maxDepth)
        bestMoves.push(this.game.bot.bestMove);
        await setProgress((i + 1) / analyzedGame.moves.length * 100);
    }
    game.analysis.bestMoves = bestMoves;
    setProgress(100);

    inGame = true;
    game.drawCurrentPosition();

    openedPage = 'analysis';
    document.querySelector('#analysis').style.display = 'none'; //pro jistotu
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#start').style.display = 'none'; //pro jistotu
    document.querySelector('#game').style.display = 'flex';
}

/**
 * @description vstoupí do analýzy prázdné hry
 * aby v tom byl pořádek trochu
 */
function analyseEmptyGame(){
    inGame = true;
    game = new Game(6, 7, users, true);
    game.analysis.emptyGame = true;
    game.playingPlayer = 'red';

    game.drawCurrentPosition();

    openedPage = 'analysis';
    document.querySelector('#analysis').style.display = 'none'; //pro jistotu
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#start').style.display = 'none'; //pro jistotu
    document.querySelector('#game').style.display = 'flex';
}

/**
 * @description nastaví progress bar na počet procent
 * @param {Number} percents počet procent
 */
async function setProgress(percents) {
    document.querySelector('#progress-bar').style.width = (40 * percents / 100) + 'vw';
    //počká ať se to resolvne
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1);
    })
}

/**
 * @description vymaže odehranou hru z localStorage
 * @param {Number} id id hry
 */
function deleteGame(id) {
    var games = JSON.parse(localStorage.getItem("games"));
    games.reverse();
    games.splice(id, 1);
    games.reverse();
    localStorage.setItem("games", JSON.stringify(games));
    displayOldGames();
    showMessage('Hra byla úspěšně smazána');
}