class Game {
    gameArea;
    playingPlayer;
    gameEnded = false;
    gameResigned = false;
    gameIsDraw = false;
    oldGames = [];

    /**
     * 
     * @param {number} rows 
     * @param {number} cols 
     * @param {boolean} playWithBot 
     * @param {*} gameArea 
     * @param {*} menu 
     */
    constructor(rows, cols, playWithBot, gameArea, menu) {
        this.gameArea = document.getElementById(gameArea);
        this.menu = document.getElementById(menu);
        this.initializeStartingPosition(rows, cols, playWithBot);
    }

    /**
     * @description Připraví hru a board s prazdnýma žetonama
     * @param {number} rows 
     * @param {number} cols 
     */
    initializeStartingPosition(rows, cols, playWithBot) {
        this.playingPlayer = 'red';
        this.playWithBot = playWithBot;
        if (playWithBot) {
            this.bot = new Bot();
        }

        let pieces = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                pieces.push(new Piece(false, 'empty', j + 1, i + 1));
            }
        }
        this.board = new Board(pieces, rows, cols);
        this.drawCurrentPosition();
        showMessage('Začíná hráč red');
    }

    /**
     * @description Udělá tah a zkontroluje výhru
     * @param {number} col
     */
    async makeMove(col) {
        if (this.gameEnded) {
            return;
        }

        let addedPiece = this.addPieceToColumn(col, true, this.playingPlayer);
        if (!addedPiece) {
            return;
        }

        await this.drawCurrentPosition();
        console.log(this.drawCurrentPosition());

        this.gameEnded = this.board.checkWin(addedPiece) || this.board.getPossibleMoves().length == 0;
        this.gameIsDraw = this.board.getPossibleMoves().length == 0 && !this.board.checkWin(addedPiece);

        if (!this.gameEnded) {
            /** Zapnout bota */
            if (this.playWithBot) {
                let botColor = this.playingPlayer == 'red' ? 'blue' : 'red';

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
                    this.playingPlayer = this.playingPlayer == 'red' ? 'blue' : 'red';
                    this.showWinningModal();
                    return;
                }

            } else {
                this.playingPlayer = this.playingPlayer == 'red' ? 'blue' : 'red';
            }
        } else {
            this.showWinningModal();
        }

        this.drawCurrentPosition();
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

    resignGame() {
        if (this.gameEnded) {
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

        
        /** ukaze kdo je na tahu v menu*/
        let playingImgSource = this.gameEnded ? 'empty' : this.playingPlayer;
        this.menu.querySelector('#' + this.menu.id + ' .playing-player-img').setAttribute('src', `./img/${playingImgSource}Piece.png`);
        await new Promise((resolve, reject) => {
            setTimeout(() =>{
                resolve()
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
        document.getElementById('winning-modal').style.display = 'flex';

        let gameState = this.gameIsDraw ? ' remízou' : (this.gameResigned ? ' vzdáním hráče ' : '. Vyhrál hráč ') + this.playingPlayer;
        document.querySelector('#winning-modal .modal-content').innerHTML = `
        <p>Hra skončila${gameState}</p>`;
    }
}