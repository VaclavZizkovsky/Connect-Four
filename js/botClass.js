/**
 * @class třída jednoho bota
 */
class Bot {
    depth = 0; // hloubka aktuálního minimaxu – měněno v game objektu
    maxDepth = 9;

    constructor() {

    }

    /** 
     * @description Spočítá skóre pozice, za předpokladu že oba hráči zahrajou, jak nejlépe umí
     * @param {Board} board board k analýze
     * @param {Number} depth hloubka prohledávání 
     * @param {Boolean} isMaximizing snaží se získat vyšší nebo nižší skóre
     * @param {Number} alpha nejvyšší skóre u maximizujícího
     * @param {Number} beta  nejnižší skóre u minimalizujícího
     * @returns {Number} nejlepší možné skóre
     */
    minimax(board, depth, isMaximizing, alpha, beta) {
        let bestMove = -1;
        if (board.checkWin()) {
            return !isMaximizing ? 1 : -1;
        } else if (depth < 1 || board.getPossibleMoves().length == 0) {
            return this.evaluateBoard(board);
        }


        /** Zjistí všechny možné tahy */
        let possibleMoves = board.getPossibleMoves();
        possibleMoves = this.sortMoves(possibleMoves, board);
        let addedPiece = board.getLastPiece();

        if (isMaximizing) {
            let maxEval = -Infinity;

            for (let i = 0; i < possibleMoves.length; i++) {
                let boardWithMove = board.copy();
                let newPieceColor = addedPiece.color == 'red' ? 'blue' : 'red';
                let pieceToAdd = new Piece(true, newPieceColor, board.getNewPieceRow(possibleMoves[i]), possibleMoves[i]);
                boardWithMove.addPiece(pieceToAdd);
                let positionEval = this.minimax(boardWithMove, depth - 1, false, alpha, beta);
                if (depth == this.depth) {
                    console.log('Move ' + (possibleMoves[i]) + ': ' + positionEval);
                }
                if (positionEval > maxEval) {
                    maxEval = positionEval;
                    bestMove = possibleMoves[i];
                }
                //alpha-beta pruning
                alpha = positionEval > alpha ? positionEval : alpha;
                if (beta <= alpha) {
                    break;
                }
            }

            if (depth == this.depth) {
                console.log('vracim: ' + bestMove + '; hloubka: ' + this.depth);
                return [bestMove, maxEval];
            }
            return maxEval;
        } else {
            let minEval = +Infinity;

            for (let j = 0; j < possibleMoves.length; j++) {
                let boardWithMove = board.copy();
                let newPieceColor = addedPiece.color == 'red' ? 'blue' : 'red';
                let pieceToAdd = new Piece(true, newPieceColor, board.getNewPieceRow(possibleMoves[j]), possibleMoves[j]);
                boardWithMove.addPiece(pieceToAdd);
                let positionEval;
                positionEval = this.minimax(boardWithMove, depth - 1, true, alpha, beta);
                if (positionEval < minEval) {
                    minEval = positionEval;
                }
                // alpha-beta pruning
                beta = positionEval < beta ? positionEval : beta;
                if (beta <= alpha) {
                    break;
                }
            }

            return minEval;
        }
    }

    /**
     * @description vypočte hodnoty mincí v dané pozici
     * @param {Board} board board k analýze
     * @param {String} botColor red nebo blue
     * @returns {Number} skóre pozice
     */
    evaluateBoard(board, botColor) {
        let evaluation = 0;

        board.pieces.forEach(piece => {
            if (piece.hasColor) {
                let postitiveEval = (-0.001 * (board.cols - Math.abs((board.cols + board.cols % 2) / 2 - piece.col))) + (-0.001 * (board.rows - Math.abs((board.rows + board.rows % 2) / 2 - piece.row)));
                postitiveEval *= botColor == piece.color ? 1 : -1;
                evaluation += postitiveEval;
            }
        });
        return +evaluation.toFixed(4);
    }

    /**
     * @description seřadí možné pohyby od středu
     * @param {Array} moves pole možných pohybů
     * @param {Board} board board
     * @returns {Array} seřazené pohyby
     */
    sortMoves(moves, board) {
        let newMoves = [];
        let middleMove = ((board.cols + (board.cols % 2)) / 2);
        if (moves.indexOf(middleMove) != -1) {
            newMoves.push(middleMove);
        }
        for (let i = middleMove - 1; i > 0; i--) {
            if (moves.indexOf(i) != -1) {
                newMoves.push(i);
            }
            if (moves.indexOf(board.cols - i + 1) != -1) {
                newMoves.push(board.cols - i + 1);
            }
        }
        return newMoves;
    }

}