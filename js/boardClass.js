/**
 * @class Třída pro board s žetony
 */
class Board {
    moves = [];
    latestPosition = true;
    displayedMove = 0;


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
                this.displayedMove = this.moves.length;
            }
        }
    }

    /**
     * @description Vrátí všechny možné tahy v této pozici
     * @returns {Array} Všechny možné tahy
     */
    getPossibleMoves() {
        let moves = [];
        if (this.checkWin()) {
            return moves;
        }

        for (let i = 0; i < this.cols; i++) {
            if (this.getNewPieceRow(i + 1) != 0) {
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

        return pieceRow;
    }

    /**
     * @description Zjistí jestli někdo nevyhrál
     * @param {Piece} piece 
     * @param {string} playerColor 
     * @returns {boolean} vyhrál nějaký hráč
     */
    checkWin() {
        let piece = this.getLastPiece();

        let verticalSameColor = this.samePiecesInDirection(piece, 0, 1) + this.samePiecesInDirection(piece, 0, -1);
        let horizontalSameColor = this.samePiecesInDirection(piece, 1, 0) + this.samePiecesInDirection(piece, -1, 0);
        let diagonal1SameColor = this.samePiecesInDirection(piece, 1, 1) + this.samePiecesInDirection(piece, -1, -1);
        let diagonal2SameColor = this.samePiecesInDirection(piece, -1, 1) + this.samePiecesInDirection(piece, 1, -1);

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
    samePiecesInDirection(piece, horizontalIncrement, verticalIncrement) {
        let i = piece.row;
        let j = piece.col;
        let samePiecesInDirection = 0;

        while (i <= this.rows && i > 0 && j > 0 && j <= this.cols) {
            let nextPiece = this.findPiece(i, j);
            if (!nextPiece || !(nextPiece.hasColor && nextPiece.color == piece.color)) {
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
     * @description změní v board.pieces zdroj obrázku výherních žetonů – přidá W (jako výhra) 
     * @param {Piece} piece žeton 
     * @returns false pokud selhalo, true pokud něco změnil
     */
    highlightPieces(piece) {
        let horizontalIncrements = [];
        let verticalIncrements = [];

        let winDirection = (this.samePiecesInDirection(piece, 0, 1) + this.samePiecesInDirection(piece, 0, -1)) > 4 ? 'vertical' : '';
        winDirection = (this.samePiecesInDirection(piece, 1, 0) + this.samePiecesInDirection(piece, -1, 0)) > 4 ? 'horizontal' : winDirection;
        winDirection = (this.samePiecesInDirection(piece, 1, 1) + this.samePiecesInDirection(piece, -1, -1)) > 4 ? 'diagonal1' : winDirection;
        winDirection = (this.samePiecesInDirection(piece, -1, 1) + this.samePiecesInDirection(piece, 1, -1)) > 4 ? 'diagonal2' : winDirection;

        switch (winDirection) {
            case 'vertical':
                horizontalIncrements.push(0);
                horizontalIncrements.push(0);
                verticalIncrements.push(1);
                verticalIncrements.push(-1);
                break;
            case 'horizontal':
                horizontalIncrements.push(1);
                horizontalIncrements.push(-1);
                verticalIncrements.push(0);
                verticalIncrements.push(0);
                break;
            case 'diagonal1':
                horizontalIncrements.push(1);
                horizontalIncrements.push(-1);
                verticalIncrements.push(1);
                verticalIncrements.push(-1);
                break;
            case 'diagonal2':
                horizontalIncrements.push(-1);
                horizontalIncrements.push(1);
                verticalIncrements.push(1);
                verticalIncrements.push(-1);
                break;
            default:
                return false;
        }

        /** moc na to nesahej */
        for (let k = 0; k < 2; k++) {
            let verticalIncrement = verticalIncrements[k];
            let horizontalIncrement = horizontalIncrements[k]
            let i = piece.row;
            let j = piece.col;

            while (i <= this.rows && i > 0 && j > 0 && j <= this.cols) {
                let nextPiece = this.findPiece(i, j);
                if (!nextPiece || !(nextPiece.hasColor && (nextPiece.color == piece.color || nextPiece.color + 'W' == piece.color))) {
                    break;
                } else {
                    nextPiece.color += (nextPiece.color == 'blue' || nextPiece.color == 'red') ? 'W' : '';
                }
                i += verticalIncrement;
                j += horizontalIncrement;
            }
        }
        return true;
    }

    /**
     * @description přepíše pieces na stav v daném tahu
     * @param {number} moveID na jaké číslo tahu se má posunout
     * @param {string} startingPlayer 
     */
    getMovePosition(moveID, startingPlayer) {
        let boardCopy = this.copy();
        let pieces = [];
        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                pieces.push(new Piece(false, 'empty', j + 1, i + 1));
            }
        }
        boardCopy.pieces = pieces;

        boardCopy.moves = this.moves.slice(0, moveID);
        boardCopy.moves.forEach(move => {
            let pieceRow = boardCopy.getNewPieceRow(move);

            if (pieceRow > 0) {
                let piece = new Piece(true, startingPlayer, pieceRow, move);
                boardCopy.addPiece(piece);
                /** zabrání duplikaci a dvojnásobné délce pole moves (způsobeno board.addPiece)*/
                boardCopy.moves.pop();
                startingPlayer = startingPlayer == 'red' ? 'blue' : 'red';
            }
        });


        /** zvýraznění win žetonů */
        if (boardCopy.checkWin()) {
            boardCopy.pieces.forEach(piece => {
                if (piece.hasColor) {
                    boardCopy.highlightPieces(piece);
                    return;
                }
            });
        }

        this.pieces = boardCopy.pieces;
        this.latestPosition = this.moves.length == boardCopy.moves.length;
        this.displayedMove = boardCopy.moves.length;
    }

    /**
     * @description hledá žeton, který byl přidaný v posledním tahu
     * @returns nalezený žeton, když nenajde => false
     */
    getLastPiece() {
        //if (this.latestPosition) {
        if (!this.moves.length >= 1) {
            return false;
        }
        return this.findPiece(this.getNewPieceRow(this.moves[this.moves.length - 1]) + 1, this.moves[this.moves.length - 1]);
        /*} else {
            console.log('co sakra nefunguje');
            console.log(this);
        }*/
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

    /**
     * @description udělá deep kopii boardu
     * @returns {Board} kopie boardu
     */
    copy() {
        let newBoard = new Board([], this.rows, this.cols);
        newBoard.pieces = structuredClone(this.pieces);
        newBoard.moves = structuredClone(this.moves);
        newBoard.displayedMove = this.displayedMove;
        newBoard.latestPosition = this.latestPosition;
        return newBoard;
    }
}
