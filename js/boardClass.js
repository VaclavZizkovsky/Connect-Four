class Board {
    constructor(pieces, rows, cols) {
        this.pieces = pieces;
        this.rows = rows;
        this.cols = cols;
    }

    addPiece(piece) {
        for (let i = 0; i < this.pieces.length; i++) {
            if (piece.col == this.pieces[i].col && piece.row == this.pieces[i].row) {
                this.pieces.splice(i, 1, piece);
            }
        }
    }

    checkWin(piece, playerColor) {
        //horizontal
        let verticalSameColor = this.samePiecesInDirection(piece, playerColor, 0, 1) + this.samePiecesInDirection(piece, playerColor, 0, -1);
        let horizontalSameColor = this.samePiecesInDirection(piece, playerColor, 1, 0) + this.samePiecesInDirection(piece, playerColor, -1, 0);
        let diagonal1SameColor = this.samePiecesInDirection(piece, playerColor, 1, 1) + this.samePiecesInDirection(piece, playerColor, -1, -1);
        let diagonal2SameColor = this.samePiecesInDirection(piece, playerColor, -1, 1) + this.samePiecesInDirection(piece, playerColor, 1, -1);
        //alert(diagonal1SameColor);
        /*for (let i = piece.row + 1; i < this.rows; i++) {
            let nextPiece = this.findPiece(i, piece.col);
            if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == playerColor)) {
                break;
            } else {
                horizontalSameColor++;
            }
        }

        for (let i = piece.row - 1; i > 0; i--) {
            let nextPiece = this.findPiece(i, piece.col);
            if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == playerColor)) {
                break;
            } else {
                horizontalSameColor++;
            }
        }*/

        if (verticalSameColor >= 5 || horizontalSameColor >= 5 || diagonal1SameColor >= 5 || diagonal2SameColor >= 5) {
            return true;
        }

        return false;
    }

    samePiecesInDirection(piece, playerColor, horizontalIncrement, verticalIncrement) {
        let i = piece.row;
        let j = piece.col;
        let samePiecesInDirection = 0;

        while (i <= this.rows && i > 0 && j > 0 && j <= this.cols){
            let nextPiece = this.findPiece(i, j);
            if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == playerColor)) {
                break;
            } else {
                samePiecesInDirection++;
            }
            i += verticalIncrement;
            j += horizontalIncrement;
        }

            /*for (let i = piece.row + 1; i < this.rows; i = i + horizontalIncrement) {
                let nextPiece = this.findPiece(i, piece.col);
                if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == playerColor)) {
                    break;
                } else {
                    horizontalSameColor++;
                }
            }*/
        return samePiecesInDirection;
    }

    findPiece(row, col) {
        let foundPiece = false;
        for (let i = 0; i < this.pieces.length; i++) {
            if (this.pieces[i].row == row && this.pieces[i].col == col) {
                foundPiece = this.pieces[i];
                break;
            }
        }
        return foundPiece;
    }
}