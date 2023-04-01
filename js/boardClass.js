/**
 * @class Třída pro board s žetony
 */
class Board {
    moves = [];

    /**
     * 
     * @param {Array} pieces 
     * @param {number} rows 
     * @param {number} cols 
     */
    constructor(pieces, rows, cols) {
        this.pieces = pieces;
        this.rows = rows;
        this.cols = cols;
    }

    /**
     * 
     * @param {Piece} piece
     * @description Přidá žeton na board 
     */
    addPiece(piece) {
        for (let i = 0; i < this.pieces.length; i++) {
            if (piece.col == this.pieces[i].col && piece.row == this.pieces[i].row) {
                this.pieces.splice(i, 1, piece);
                this.moves.push(piece.col);
            }
        }
    }

    /**
     * @description Vrátí všechny možné tahy v této pozici
     * @returns {Array} Všechny možné tahy
     */
    getPossibleMoves() {
        let moves = [];

        for (let i = 0; i < this.cols; i++) {
            if (this.getNewPieceRow(i + 1) != -1) {
                moves.push(i + 1);
            }
        }

        return moves;
    }

    /**
     * @description Zjistí řádek, kam umístit žeton v daném sloupci
     * @param {number} col 
     * @returns {number} řádek, kam se umístí příští žeton
     */
    getNewPieceRow(col) {
        let pieceRow = -1;

        this.pieces.forEach(piece => {
            if (piece.col == col && piece.row > pieceRow) {
                if (piece.hasColor && pieceRow == -1) {
                    pieceRow = piece.row - 1;
                } else if (!piece.hasColor && piece.row == this.rows) {
                    pieceRow = piece.row;
                }
            }
        });

        pieceRow = pieceRow == 0 ? -1 : pieceRow;
        return pieceRow;
    }

    /**
     * @description Zjistí jestli někdo nevyhrál
     * @param {Piece} piece 
     * @param {string} playerColor 
     * @returns {boolean} vyhrál nějaký hráč
     */
    checkWin(piece, playerColor) {

        let verticalSameColor = this.samePiecesInDirection(piece, playerColor, 0, 1) + this.samePiecesInDirection(piece, playerColor, 0, -1);
        let horizontalSameColor = this.samePiecesInDirection(piece, playerColor, 1, 0) + this.samePiecesInDirection(piece, playerColor, -1, 0);
        let diagonal1SameColor = this.samePiecesInDirection(piece, playerColor, 1, 1) + this.samePiecesInDirection(piece, playerColor, -1, -1);
        let diagonal2SameColor = this.samePiecesInDirection(piece, playerColor, -1, 1) + this.samePiecesInDirection(piece, playerColor, 1, -1);

        if (verticalSameColor >= 5 || horizontalSameColor >= 5 || diagonal1SameColor >= 5 || diagonal2SameColor >= 5) {
            return true;
        }

        return false;
    }

    /**
     * @description Vrátí žetony stejné barvy
     * @param {Piece} piece 
     * @param {string} playerColor 
     * @param {number} horizontalIncrement 
     * @param {number} verticalIncrement 
     * @returns {number} všechny žetony stejné barvy v dané řadě
     */
    samePiecesInDirection(piece, playerColor, horizontalIncrement, verticalIncrement) {
        let i = piece.row;
        let j = piece.col;
        let samePiecesInDirection = 0;

        while (i <= this.rows && i > 0 && j > 0 && j <= this.cols) {
            let nextPiece = this.findPiece(i, j);
            if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == playerColor)) {
                break;
            } else {
                samePiecesInDirection++;
            }
            i += verticalIncrement;
            j += horizontalIncrement;
        }

        return samePiecesInDirection;
    }

    /**
     * @description Najde žeton podle řádku a sloupce
     * @param {number} row 
     * @param {number} col 
     * @returns nalezený žeton nebo false
     */
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