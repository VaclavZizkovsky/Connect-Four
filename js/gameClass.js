class Game {
    playingPlayer;
    playWithBot = false;
    gameEnded = false;
    gameResigned = false;
    gameIsDraw = false;
    bot = new Bot();
    oldGames = [];

    /**
     * 
     * @param {number} rows 
     * @param {number} cols 
     * @param {Array} usersData
     */
    constructor(rows, cols, usersData) {
        this.gameArea = document.getElementById('game-area');
        this.usersData = usersData;
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


        document.querySelector('#red-info span').innerHTML = this.usersData[0].color == 'red' ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('#blue-info span').innerHTML = this.usersData[0].color == 'blue' ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('.beginning-player').innerHTML = this.usersData[0].color == this.playingPlayer ? this.usersData[0].name : this.usersData[1].name;
        document.querySelector('.ending-player').innerHTML = this.usersData[0].color == this.playingPlayer ? this.usersData[1].name : this.usersData[0].name;
        showMessage('Začíná hráč ' + this.playingPlayer);
        await this.drawCurrentPosition();


        this.playWithBot = playWithBot;
        if (playWithBot && ((this.playingPlayer == this.usersData[0].color && this.usersData[0].bot) || (this.playingPlayer == this.usersData[1].color && this.usersData[1].bot))) {
            this.makeBotMove();
        }
    }

    /**
     * @description Udělá tah a zkontroluje výhru
     * @param {number} col
     */
    async makeMove(col) {
        if (this.gameEnded || this.botCalculating) {
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
            this.showWinningModal();
        }

    }

    /**
     * @description udělá move za bota
     */
    async makeBotMove() {
        if (this.playWithBot && !this.gameEnded) {
            this.botCalculating = true;
            let addedPiece = this.board.getLastPiece();
            let botColor = this.playingPlayer;

            /** hledani nejlepsiho tahu */
            let startTime = performance.now();
            let bestMove = this.bot.getBestMove(this.board.copy(), botColor);
            let endTime = performance.now();
            console.log('Time: ' + (endTime - startTime) / 1000 + ' s');

            /** bot udela move */
            this.addPieceToColumn(bestMove, true, botColor);
            this.gameEnded = this.board.checkWin(addedPiece) || this.board.getPossibleMoves().length == 0;
            this.gameIsDraw = this.board.getPossibleMoves().length == 0 && !this.board.checkWin(addedPiece);
            if (this.gameEnded) {
                this.showWinningModal();
                return;
            }
            this.changePlayer();
            this.botCalculating = false;
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

        document.getElementById('winning-modal').style.display = 'none';

        this.oldGames.push(this.board.moves);
        this.gameEnded = false;
        this.gameIsDraw = false;
        this.gameResigned = false;
        this.initializeStartingPosition(this.board.rows, this.board.cols, this.playWithBot);
    }

    /**
     * @description Vykreslí aktuální pozici
     */
    async drawCurrentPosition() {

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
                movesHTML += '<tr><td>' + (i / 2 + 1) + '</td><td>' + this.board.moves[i] + '</td>';
            } else {
                movesHTML += '<td>' + this.board.moves[i] + '</td></tr>';
            }
        }
        document.querySelector('#moves table tbody').innerHTML = movesHTML + '</tr>';


        /** ukaze kdo je na tahu v menu*/
        let playingImgSource = this.gameEnded ? 'empty' : this.playingPlayer;
        document.querySelector('#menu .playing-player-img').setAttribute('src', `./img/${playingImgSource}Piece.png`);

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

        this.drawCurrentPosition();

        let gameState = this.gameIsDraw ? ' remízou' : (this.gameResigned ? ' vzdáním hráče ' : '. Vyhrál hráč ') + this.playingPlayer;
        showMessage('Hra skončila' + gameState);
    }
}