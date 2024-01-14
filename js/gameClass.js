class Game {
    usersData;
    playingPlayer;
    playWithBot = false;
    gameEnded = false;
    gameResigned = false;
    gameIsDraw = false;
    bot = new Bot();
    oldGames = [];
    analysis = {
        analysisMode: false,
        bestMoves: [],
    }

    /**
     * 
     * @param {number} rows 
     * @param {number} cols 
     * @param {Array} usersData
     */
    constructor(rows, cols, usersData, analysisMode) {
        this.gameArea = document.getElementById('game-area');
        this.usersData = usersData;
        this.analysis.analysisMode = analysisMode;
        this.initializeStartingPosition(rows, cols, usersData[0].bot || usersData[1].bot);
    }

    /**
     * @description Připraví hru a board s prazdnýma žetonama
     * @param {number} rows 
     * @param {number} cols 
     */
    async initializeStartingPosition(rows, cols, playWithBot) {
        this.playingPlayer = Math.random() > 0.5 ? 'red' : 'blue';

        let pieces = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                pieces.push(new Piece(false, 'empty', j + 1, i + 1));
            }
        }
        this.board = new Board(pieces, rows, cols);

        document.querySelector('.best-move').style.display = this.analysis.analysisMode ? 'block' : 'none';

        document.querySelector('.resign-button').innerHTML = '<i class="fa-solid fa-flag"></i>';
        document.querySelector('.resign-button').setAttribute('onclick', 'game.resignGame();');

        document.querySelector('#red-info span').innerHTML = this.usersData[0].color == 'red' ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('#blue-info span').innerHTML = this.usersData[0].color == 'blue' ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('.beginning-player').innerHTML = this.usersData[0].color == this.playingPlayer ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('.ending-player').innerHTML = this.usersData[0].color == this.playingPlayer ? this.usersData[1].name : this.usersData[0].name;

        if (this.analysis.analysisMode) {
            document.querySelector('.playing-player-button').style.display = 'none';
            document.querySelector('.resign-button').style.display = 'none';
            document.querySelector('.settings-button').style.display = 'none';
        } else {
            document.querySelector('.playing-player-button').style.display = 'block';
            document.querySelector('.resign-button').style.display = 'block';
            document.querySelector('.settings-button').style.display = 'block';
            showMessage('Začíná hráč ' + (this.usersData[0].color == this.playingPlayer ? this.usersData[0].name : this.usersData[1].name));
        }
        await this.drawCurrentPosition();


        this.playWithBot = playWithBot;
        if (!this.analysis.analysisMode && playWithBot && ((this.playingPlayer == this.usersData[0].color && this.usersData[0].bot) || (this.playingPlayer == this.usersData[1].color && this.usersData[1].bot))) {
            this.makeBotMove();
        }
    }

    /**
     * @description Udělá tah a zkontroluje výhru
     * @param {number} col
     */
    async makeMove(col) {
        if (this.gameEnded || this.botCalculating || !this.board.latestPosition || this.analysis.analysisMode) {
            return;
        }

        let addedPiece = this.addPieceToColumn(col, true, this.playingPlayer);
        if (!addedPiece) {
            return;
        }

        await this.drawCurrentPosition();

        this.gameEnded = this.board.checkWin(addedPiece) || this.board.getPossibleMoves().length == 0;
        this.gameIsDraw = this.board.getPossibleMoves().length == 0 && !this.board.checkWin(addedPiece);

        if (!this.gameEnded) {
            this.changePlayer();
        } else {
            if (!this.gameIsDraw) {
                this.board.pieces.forEach(piece => {
                    if (piece.hasColor) {
                        this.board.highlightPieces(piece);
                        return;
                    }
                });
            }
            this.showWinningModal();
        }

    }

    /**
     * @description udělá move za bota
     */
    async makeBotMove() {
        if (this.playWithBot && !this.gameEnded && this.board.latestPosition && !this.analysis.analysisMode) {
            this.botCalculating = true;
            let addedPiece = this.board.getLastPiece();
            let botColor = this.playingPlayer;

            /** hledani nejlepsiho tahu */
            let startTime = performance.now();
            let bestMove;
            await this.doMinimax(this.board.copy(), this.bot.depth);
            bestMove = this.bot.bestMove;
            console.log(bestMove);
            let endTime = performance.now();
            console.log('Time: ' + (endTime - startTime) / 1000 + ' s');

            /** bot udela move */
            this.addPieceToColumn(bestMove, true, botColor);
            this.gameEnded = this.board.checkWin(addedPiece) || this.board.getPossibleMoves().length == 0;
            this.gameIsDraw = this.board.getPossibleMoves().length == 0 && !this.board.checkWin(addedPiece);
            if (this.gameEnded) {
                if (!this.gameIsDraw) {
                    this.board.pieces.forEach(piece => {
                        if (piece.hasColor) {
                            this.board.highlightPieces(piece);
                            return;
                        }
                    });
                }
                this.showWinningModal();
                return;
            }
            this.botCalculating = false;
            this.changePlayer();
        }
    }

    async changePlayer() {
        this.playingPlayer = this.playingPlayer == 'red' ? 'blue' : 'red';
        await this.drawCurrentPosition();
        if ((this.playingPlayer == this.usersData[0].color && this.usersData[0].bot) || (this.playingPlayer == this.usersData[1].color && this.usersData[1].bot)) {
            this.makeBotMove();
        }
        await this.drawCurrentPosition();
    }

    /**
     * @description Přidá žeton do sloupce
     * @param {number} col 
     * @param {boolean} pieceHasColor 
     * @param {string} pieceColor 
     * @returns Objekt žetonu nebo false
     */
    addPieceToColumn(col, pieceHasColor, pieceColor) {
        let pieceRow = this.board.getNewPieceRow(col);

        if (pieceRow > 0) {
            let piece = new Piece(pieceHasColor, pieceColor, pieceRow, col);
            this.board.addPiece(piece);
            return piece;
        } else {
            return false;
        }
    }

    /**
     * @description resignuje hru
     */
    resignGame() {
        if (this.gameEnded || this.botCalculating) {
            return;
        }

        this.gameEnded = true;
        this.gameResigned = true;
        this.showWinningModal();
    }

    startNextGame() {
        if (!this.gameEnded) {
            return;
        }



        this.gameEnded = false;
        this.gameIsDraw = false;
        this.gameResigned = false;
        this.initializeStartingPosition(this.board.rows, this.board.cols, this.playWithBot);
    }

    /**
     * @description zobrazí na desce nějaký tah v probíhající hře
     * @param {Number} moveID číslo tahu který se má zobrazit 
     * @returns 
     */
    displayMove(moveID) {
        /** zabrání zobrazení předchozích tahů, když hrajou dva boti => přerušilo by to je a hra by se nedohrála (a hra není v analysis módu) */
        if (this.usersData[0].bot && this.usersData[1].bot && !this.gameEnded && !this.analysis.analysisMode) {
            return;
        }
        if (moveID == 'next') {
            moveID = this.board.latestPosition ? this.board.displayedMove : this.board.displayedMove + 1;
        } else if (moveID == 'previous') {
            if (this.board.displayedMove > 1) {
                moveID = this.board.displayedMove - 1;
            } else {
                return;
            }
        }
        let startingPlayer = this.board.moves.length % 2 == 0 ? this.playingPlayer : (this.playingPlayer == 'red' ? 'blue' : 'red');
        startingPlayer = this.gameEnded && !this.gameResigned ? (startingPlayer == 'red' ? 'blue' : 'red') : startingPlayer;
        this.board.getMovePosition(moveID, startingPlayer);
        this.drawCurrentPosition();

        if (this.analysis.analysisMode) {
            document.querySelector('.best-move').innerHTML = 'Nejlepší tah: ' + this.analysis.bestMoves[this.board.displayedMove - 1];
        }
    }

    /**
     * @description Vykreslí aktuální pozici
     */
    async drawCurrentPosition() {

        /** vykreslí board */
        this.gameArea.innerHTML = '';

        for (let i = 0; i < this.board.cols; i++) {
            this.gameArea.innerHTML += '<div class="col col-' + (i + 1) + '" onmouseover="" onmousedown="" onclick="game.makeMove(' + (i + 1) + ', false);"></div>';
        }

        this.board.pieces.forEach(piece => {
            let fullPiece = piece.hasColor ? 'full' : '';
            document.querySelector(`.col-${piece.col}`).innerHTML += '<div class="row row-' + piece.row + ' ' + fullPiece + '"><img src="./img/' + piece.color + 'Piece.png"></div>';
        });


        /** vypíše pohyby do side baru */
        let movesHTML = '';
        for (let i = 0; i < this.board.moves.length || (this.gameEnded && i <= this.board.moves.length); i++) {
            if (this.gameEnded && (this.board.moves.length == i)) {
                let beginningPlayerName = document.querySelector('.beginning-player').innerHTML;
                /** prosím nešahej na to NIKDY NIKDY jinak se to celý zboří díky moc */
                let player1Won = this.gameResigned ? (this.playingPlayer == (!this.usersData[0].name == beginningPlayerName ? this.usersData[0].color : this.usersData[1].color)) : (this.playingPlayer == (this.usersData[0].name == beginningPlayerName ? this.usersData[0].color : this.usersData[1].color));
                let gameResult = this.gameIsDraw ? '0.5 – 0.5' : (player1Won ? '1 – 0' : '0 – 1');
                movesHTML += i % 2 == 0 ? `<tr><td>${i / 2 + 1}</td><td>${gameResult}</td>` : `<td>${gameResult}</td></tr>`;
                continue;
            }
            if (i % 2 == 0) {
                movesHTML += '<tr><td>' + (i / 2 + 1) + '</td><td class="move ' + ((i + 1) == this.board.displayedMove ? 'displayed-move' : '') + '" onclick="game.displayMove(' + (i + 1) + ');">' + this.board.moves[i] + '</td>';
            } else {
                movesHTML += '<td class="move ' + ((i + 1) == this.board.displayedMove ? 'displayed-move' : '') + '" onclick="game.displayMove(' + (i + 1) + ');">' + this.board.moves[i] + '</td></tr>';
            }
        }
        document.querySelector('#moves table tbody').innerHTML = movesHTML + '</tr>';

        /** vykreslí skóre */
        document.querySelector('.game-score span').innerHTML = `${this.usersData[0].score}&nbsp;&nbsp;–&nbsp;&nbsp;${this.usersData[1].score}`;

        /** ukaze kdo je na tahu v menu*/
        document.querySelector('#menu .playing-player-img').setAttribute('src', `./img/${this.playingPlayer}Piece.png`);

        /** počká 1 ms, takže se promítnou změny v HTML */
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1);
        })
    }

    /**
     * @description Ukáže modal s výsledkem hry
     */
    showWinningModal() {
        if (!this.gameEnded) {
            return;
        }



        this.oldGames.push(this.board.moves);
        /** update skóre 
         *  prosím nešahej na to NIKDY NIKDY jinak se to celý zboří díky moc
         *  */
        let player1Won = this.gameResigned ? !(this.playingPlayer == this.usersData[0].color) : (this.playingPlayer == this.usersData[0].color);
        this.usersData[0].score += this.gameIsDraw ? 0.5 : (player1Won ? 1 : 0);
        this.usersData[1].score += this.gameIsDraw ? 0.5 : (player1Won ? 0 : 1);
        /** uloží statistiky */
        this.saveStats();

        this.drawCurrentPosition();
        document.querySelector('.resign-button').innerHTML = '<i class="fa-solid fa-forward"></i>';
        document.querySelector('.resign-button').setAttribute('onclick', 'game.startNextGame();');
        document.querySelector('.resign-button').setAttribute('title', 'Další hra');

        let player = this.usersData[0].color == this.playingPlayer ? this.usersData[0].name : this.usersData[1].name;
        let gameState = this.gameIsDraw ? ' remízou' : (this.gameResigned ? ' vzdáním hráče ' : '. Vyhrál hráč ') + player;
        showMessage('Hra skončila' + gameState);
    }

    /**
     * @description Provede minimax v jiném threadu
     * @param {Board} board kopie boardu
     * @param {Number} depth hloubka prohledávání 
     * @returns nejlepší tah, pokud chyba => -1
     */
    async doMinimax(board, depth) {
        let bestMove = -1;

        // TOHLETO ZTĚLESNĚNÍ DEMENCE MI ZABRALO PŘESNĚ 4,5 HODINY ČISTÝHO ČASU
        // TAK MI PROKAŽ TU LASKAVOST A UŽ NA TO NIKDY V ŽIVOTĚ NEŠAHEJ
        let botClass = Bot.toString();
        let boardClass = Board.toString();
        let pieceClass = Piece.toString(); // přendá všechny potřebné třídy do textové podoby

        var blob = new Blob([
            botClass + boardClass + pieceClass + document.querySelector('#minimax-worker').textContent
        ], { type: "text/javascript" }); // text skriptu se všema třídama (worker je neumí načíst)

        var worker = new Worker(window.URL.createObjectURL(blob)); // vytvoří workera s udělaným skriptem
        worker.postMessage({
            board: board,
            depth: depth,
            bot: this.bot
        }); // pošle v messagi potřebné parametry a tím zapne workera
        await new Promise((resolve) => {
            worker.onmessage = function (e) {
                bestMove = e.data; // počká na odpověď a tu zapíše do bestMove
                resolve();
            }
        });

        worker.terminate(); // zničí workera – zabíral by místo
        this.bot.bestMove = bestMove;
        return bestMove;
    }

    saveStats() {
        let games = JSON.parse(localStorage.getItem("games"));
        var date = new Date();
        let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        let firstPlayer = (this.playingPlayer == 'red' && this.board.moves.length % 2 == 0) || (this.playingPlayer == 'blue' && this.board.moves.length % 2 == 1) ? 'blue' : 'red';
        games.push({
            usersData: this.usersData,
            time: date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + minutes,
            moves: this.board.moves,
            firstPlayer: this.gameResigned ? (firstPlayer == 'red' ? 'blue' : 'red') : firstPlayer,
            gameResigned: this.gameResigned,
        });
        localStorage.setItem('games', JSON.stringify(games));
        setStat('Počet odehraných her', loadStat('Počet odehraných her').value + 1);
        let editedStat = this.usersData[0].bot && this.usersData[1].bot ? 'Počet Bot vs Bot her' : (this.usersData[0].bot || this.usersData[1].bot ? 'Počet Hráč vs Bot her' : 'Počet Hráč vs Hráč her');
        setStat(editedStat, loadStat(editedStat).value + 1);
        setStat('Počet odehraných tahů', loadStat('Počet odehraných tahů').value + this.board.moves.length);
        setStat('Průměr odehraných tahů na hru', Math.round(loadStat('Počet odehraných tahů').value / loadStat('Počet odehraných her').value));
    }
}