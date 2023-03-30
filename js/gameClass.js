class Game {
    board;
    gameArea;
    playingPlayer;
    isWinner = false;

    constructor(rows, cols, gameArea) {
        this.gameArea = document.getElementById(gameArea);
        this.playingPlayer = 'red'
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
        this.drawCurrentPosition();
        if (this.board.checkWin(addedPiece, this.playingPlayer)) {
            this.isWinner = true;
            //highlight winned
            alert("winner: "+this.playingPlayer);
            return;
        }
        this.playingPlayer = this.playingPlayer == 'red' ? 'blue' : 'red';
    }





    hoverCol(col, unhover) {
        /*if (this.isWinner) {
            return;
        }
        if (unhover) {

        } else {
            this.addPieceToColumn(col, false, this.playingPlayer + 'Hover');
            document.querySelector(`#${this.gameArea.id} .col-${col}`).removeAttribute('onmouseover');
            document.querySelector(`#${this.gameArea.id} .col-${col}`).setAttribute('onmousedown', `game.hoverCol(${col}, true)`);
        }
        this.drawCurrentPosition();*/
    }


    addPieceToColumn(col, pieceHasColor, pieceColor) {
        let highestPiece = -1;

        this.board.pieces.forEach(piece => {
            if (piece.col == col && piece.row > highestPiece) {
                if (piece.hasColor && highestPiece == -1) {
                    highestPiece = piece.row - 1;
                } else if (!piece.hasColor && piece.row == this.board.rows) {
                    highestPiece = piece.row;
                }
            }
        });

        if (highestPiece > 0) {
            let piece = new Piece(pieceHasColor, pieceColor, highestPiece, col);
            this.board.addPiece(piece);
            return piece;
        } else {
            return false;
        }
    }


    drawCurrentPosition() {
        this.gameArea.innerHTML = '';

        for (let i = 0; i < this.board.cols; i++) {
            this.gameArea.innerHTML += '<div class="col col-' + (i + 1) + '" onmouseover="" onmousedown="" onclick="game.makeMove(' + (i + 1) + ', false);"></div>';
        }

        this.board.pieces.forEach(piece => {
            document.querySelector(".col-" + piece.col).innerHTML += '<div class="row row-' + piece.row + '"><img src="./img/' + piece.color + 'Piece.png"></div>';
        });
    }
}