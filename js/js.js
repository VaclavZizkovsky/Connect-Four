var openedPage = 'start';
var settings;
var game;
let users = [
    {
        color: 'red',
        name: 'Hráč 1',
        bot: false,
        botDepth: 0,
        score: 0,
    }, {
        color: 'blue',
        name: 'Hráč 2',
        bot: false,
        botDepth: 0,
        score: 0
    }
];
let inGame = false;
let hoveringCol = -1;

window.onload = (e) => {
    // loadne nastavení
    let loadedSettings = JSON.parse(localStorage.getItem('settings'));
    if (loadedSettings == null) {
        loadedSettings = {
            maxBotDepth: 11,
            tooltipsOff: false,
        };
        localStorage.setItem('settings', JSON.stringify(loadedSettings));
    }

    settings = loadedSettings;

    // provedení různých nastavení
    executeSettings();
};

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

    users[0].botDepth = document.querySelector('#bot-depth-slider-1').value;
    users[1].botDepth = document.querySelector('#bot-depth-slider-2').value;

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
    users[0].botDepth = 0;
    users[1].score = 0;
    users[1].name = 'Hráč 2';
    users[1].bot = false;
    users[1].botDepth = 0;

    if (openedPage == 'analysis') {
        displayOldGames();
    }
}

function copyPosition() {
    if (!inGame || !game.analysis.analysisMode) {
        return;
    }
    let boardCopy = game.board.copy();
    boardCopy.moves.splice(game.board.displayedMove);
    let position = boardCopy.moves.toString();
    navigator.clipboard.writeText(position);
    document.querySelector('#copy-game-button i').setAttribute('class', 'fa-solid fa-check');
    document.querySelector('#copy-game-button').setAttribute('data-title', 'Zkopírováno!');
    setTimeout(() => {
        document.querySelector('#copy-game-button i').setAttribute('class', 'fa-solid fa-copy');
        document.querySelector('#copy-game-button').setAttribute('data-title', 'Kopírovat pozici');
    }, 1500)
}

function savePosition() {
    if (!inGame || !game.analysis.analysisMode) {
        return;
    }

    let games = JSON.parse(localStorage.getItem('games'));
    var date = new Date();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    let firstPlayer = (game.playingPlayer == 'red' && game.board.moves.length % 2 == 0) || (game.playingPlayer == 'blue' && game.board.moves.length % 2 == 1) ? 'blue' : 'red';
    games.push({
        usersData: game.usersData,
        time: date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + minutes,
        moves: game.board.moves,
        firstPlayer: game.gameResigned ? (firstPlayer == 'red' ? 'blue' : 'red') : firstPlayer,
        gameResigned: game.gameResigned,
    });
    localStorage.setItem('games', JSON.stringify(games));

    document.querySelector('#save-game-button').style.display = 'none';
    showMessage('Hra byla uložena');
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
        document.querySelector('#bot-depth-' + input).style.display = 'none';
        document.querySelector('#username' + input).removeAttribute('disabled');
        document.querySelector('#username' + input).value = '';
    } else {
        document.querySelector('#bot-depth-' + input).style.display = 'block';
        document.querySelector('#username' + input).setAttribute('disabled', '1');
        document.querySelector('#username' + input).value = 'Bot lvl. ' + document.querySelector('#bot-depth-slider-' + input).value;
    }
}

function updateSliderSpan(sliderID) {
    let slider = document.querySelector('#bot-depth-slider-' + sliderID);
    let span = document.querySelector('#bot-depth-' + sliderID + ' span');
    let username = document.querySelector('#username' + sliderID);
    span.innerText = slider.value;
    username.value = 'Bot lvl. ' + slider.value;
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

// NASTAVENÍ

function saveSettings(){
    let maxBotDepth = document.querySelector('#max-bot-depth-input').value;
    if(!(parseInt(maxBotDepth) > 0)){
        showMessage('Špatný vstup u maximální hloubky bota');
        return;
    }
    settings.maxBotDepth = parseInt(maxBotDepth);
    settings.tooltipsOff = !document.querySelector('#tooltips-setting-checkbox').checked;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    executeSettings();
    openPage('start');
    showMessage('Nastavení bylo uloženo');
}

function executeSettings() {
    // maxBotDepth
    document.querySelector('#bot-depth-slider-1').setAttribute('max', settings.maxBotDepth);
    document.querySelector('#bot-depth-slider-2').setAttribute('max', settings.maxBotDepth);
    document.querySelector('#max-bot-depth-input').value = settings.maxBotDepth;
    
    //tooltipsOff
    if (settings.tooltipsOff) {
        document.querySelectorAll('[data-title]').forEach(element => {
            element.classList.add('notooltips');
        });
    } else {
        document.querySelectorAll('[data-title]').forEach(element => {
            element.classList.remove('notooltips');
        });
    }
    document.querySelector('#tooltips-setting-checkbox').checked = !settings.tooltipsOff;
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
    showMessage('Smazáno');
}

/**
 * @description vymaže všechny hry z localStorage
 */
function deleteGames(){
    localStorage.setItem('games', null);
    showMessage('Smazáno');
}

//ANALÝZA

/**
 * @description vykreslí odehrané hry do tabulky
 */
function displayOldGames() {
    //loadne staré hry z localStorage
    var games = JSON.parse(localStorage.getItem("games"));
    if (games == null) {
        games = [];
    }
    games.reverse();

    //načte checkboxy
    let pvpGames = document.querySelector('#last-played-games-select-1').checked; //pvp = hráč vs hráč
    let pvbGames = document.querySelector('#last-played-games-select-2').checked; //pvb = hráč vs bot
    let bvbGames = document.querySelector('#last-played-games-select-3').checked; //bvb = bot vs bot

    var table = document.getElementById("last-played-games-table");

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

    if (gameIDs.length == 0) {
        table.innerHTML = '<tr><td colspan="3">Žádné hry k načtení</td></tr>';
        return;
    }
    table.innerHTML = '';
    for (let i = 0; i < games.length; i++) {
        table.innerHTML += '<tr> <td class="normal-cell">' + games[i].usersData[0].name + ' vs. ' + games[i].usersData[1].name + '</td> <td class="normal-cell">' + games[i].time + '</td> <td class="normal-cell">' + games[i].usersData[0].score + ' – ' + games[i].usersData[1].score + '</td> <td class="normal-cell">' + games[i].moves.length + ' tahů</td> <td class="button-cell"><button onclick="analyseGame(' + gameIDs[i] + ')" data-title="Analyzovat"><i class="fa-solid fa-compass"></i></button></td> <td class="button-cell"><button onclick="deleteGame(' + gameIDs[i] + ')" data-title="Smazat"><i class="fa-solid fa-trash"></i></button></td> </tr>'
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
        await this.game.doMinimax(boardCopy, settings.maxBotDepth);
        let bestMove = {
            bestMove: this.game.bot.bestMove,
            evaluation: this.game.bot.evaluation,
        }
        bestMoves.push(bestMove);
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
    document.querySelector('#save-game-button').style.display = 'none';
}

/**
 * @description vstoupí do analýzy prázdné hry
 * aby v tom byl pořádek trochu
 */
function analyseEmptyGame() {
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
    document.querySelector('#save-game-button').style.display = 'none';
}

async function analyseCustomGame() {
    game = new Game(6, 7, users, true);
    game.analysis.emptyGame = true;

    let position = document.querySelector('#load-game-input').value;
    let moves = position.split(',');
    let parseSuccess = true;
    for (let i = 0; i < moves.length; i++) {
        let parsedMove = parseInt(moves[i]);
        if (!(parsedMove >= 1 && parsedMove <= 7)) {
            parseSuccess = false;
            break;
        }
        moves[i] = parseInt(moves[i]);
        let boardCopy = game.board.copy();
        boardCopy.moves = structuredClone(moves);
        boardCopy.moves.splice(i + 1);
        if (boardCopy.checkWin()) {
            break;
        }
    }
    if (!parseSuccess) {
        showMessage('Chybný kód. Správný formát kódu je popsán v návodu.');
        return;
    }
    let lastMove = moves[moves.length - 1];
    moves.pop();

    game.playingPlayer = moves.length % 2 == 0 ? 'red' : 'blue';
    game.board.moves = moves;
    game.board.getMovePosition(moves.length, 'red');

    //zapne loading
    document.querySelector('#loading-text').innerHTML = 'Načítám hru a hledám nejlepší tahy...';
    setProgress(0);
    await openPage('loading');


    //najde nejlepší tahy pro pozici
    let bestMoves = [];
    for (let i = 0; i < moves.length; i++) {
        let boardCopy = this.game.board.copy();
        boardCopy.latestPosition = true;
        boardCopy.getMovePosition(i + 1, 'red');
        boardCopy.moves.splice(boardCopy.displayedMove, boardCopy.moves.length - boardCopy.displayedMove);
        await this.game.doMinimax(boardCopy, settings.maxBotDepth);
        bestMoves.push(this.game.bot.bestMove);
        await setProgress((i + 1) / moves.length * 100);
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
    document.querySelector('#save-game-button').style.display = 'none';
    game.makeMove(lastMove);
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