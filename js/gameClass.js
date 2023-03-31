class Game {
    board;
    gameArea;
    playingPlayer;
    isWinner = false;
    gameIsDraw = false;

    constructor(rows, cols, playWithBot, gameArea, menu) {
        this.gameArea = document.getElementById(gameArea);
        this.menu = document.getElementById(menu);
        this.playingPlayer = 'red';
        this.initializeStartingPosition(rows, cols);
    }


    initializeStartingPosition(rows, cols) {
        let pieces = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                pieces.push(new Piece(false, 'empty', j + 1, i + 1));
            }
        }
        this.board = new Board(pieces, rows, cols);
    }


    makeMove(col) {
        if (this.isWinner) {
            return;
        }

        let addedPiece = this.addPieceToColumn(col, true, this.playingPlayer);
        if (!addedPiece) {
            return;
        }

        this.isWinner = this.board.checkWin(addedPiece, this.playingPlayer) || this.board.getPossibleMoves().length == 0;
        this.gameIsDraw = this.board.getPossibleMoves().length == 0 && !this.board.checkWin(addedPiece, this.playingPlayer);


        if (!this.isWinner) {
            this.playingPlayer = this.playingPlayer == 'red' ? 'blue' : 'red';
        } else {
            this.showWinningModal();
        }

        this.drawCurrentPosition();


    }


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
     * @description Vykreslí aktuální pozici
     */
    drawCurrentPosition() {
        this.gameArea.innerHTML = '';

        for (let i = 0; i < this.board.cols; i++) {
            this.gameArea.innerHTML += '<div class="col col-' + (i + 1) + '" onmouseover="" onmousedown="" onclick="game.makeMove(' + (i + 1) + ', false);"></div>';
        }

        this.board.pieces.forEach(piece => {
            let fullPiece = piece.hasColor ? 'full' : '';
            document.querySelector(".col-" + piece.col).innerHTML += '<div class="row row-' + piece.row + ' ' + fullPiece + '"><img src="./img/' + piece.color + 'Piece.png"></div>';
        });

        /** ukaze kdo je na tahu v menu*/
        this.menu.querySelector('#' + this.menu.id + ' .playing-player-img').setAttribute('src', './img/' + this.playingPlayer + 'Piece.png');
    }

    showWinningModal() {
        if(!this.isWinner){
            return;
        }

        document.getElementById('winning-modal').style.display = 'flex';
        
        let gameState = this.gameIsDraw ? ' remízou' : '. Vyhrál hráč '+this.playingPlayer;
        document.querySelector('#winning-modal .modal-content').innerHTML = `
        <p>Hra skončila${gameState}</p>`;
    }
}