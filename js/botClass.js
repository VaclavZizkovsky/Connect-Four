class Bot {
    depth = 5;

    constructor() {

    }

    getBestMove(board, botColor) {
        let possibleMoves = board.getPossibleMoves();
        if (board.getPossibleMoves().length == 0) {
            return false;
        }

        let bestMove = possibleMoves[0];
        let bestEval = -Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            let boardWithMove = board.copy();
            let pieceToAdd = new Piece(true, botColor, board.getNewPieceRow(possibleMoves[i]), possibleMoves[i]);
            boardWithMove.addPiece(pieceToAdd);
            let evaluatedBranch = this.minimax(boardWithMove, this.depth, false, pieceToAdd, -Infinity, +Infinity, botColor);
            console.log('Evaluated move: ' + possibleMoves[i] + ' Minimax score: ' + evaluatedBranch);
            if (evaluatedBranch > bestEval) {
                bestMove = possibleMoves[i];
                bestEval = evaluatedBranch;
            }
        }
        console.log(bestMove);
        return bestMove;
    }

    minimax(board, depth, isMaximizing, alpha, beta) {
        if (board.checkWin()) {
            return !isMaximizing ? 1 : -1;
        } else if (depth < 1 || board.getPossibleMoves().length == 0) {
            let playingPlayer = board.getLastPiece().color;
            return this.evaluateBoard(board, playingPlayer);
        }


        /** Zjistí všechny možné tahy */
        let possibleMoves = board.getPossibleMoves();
        let addedPiece = board.getLastPiece();

        if (isMaximizing) {
            let maxEval = -Infinity;

            possibleMoves.forEach(move => {
                let boardWithMove = board.copy();
                let newPieceColor = addedPiece.color == 'red' ? 'blue' : 'red';
                let pieceToAdd = new Piece(true, newPieceColor, board.getNewPieceRow(move), move);
                boardWithMove.addPiece(pieceToAdd);
                let positionEval = this.minimax(boardWithMove, depth - 1, false, pieceToAdd);
                if (positionEval > maxEval) {
                    maxEval = positionEval;
                }
            })

            return maxEval;
        } else {
            let minEval = +Infinity;

            possibleMoves.forEach(move => {
                let boardWithMove = board.copy();
                let newPieceColor = addedPiece.color == 'red' ? 'blue' : 'red';
                let pieceToAdd = new Piece(true, newPieceColor, board.getNewPieceRow(move), move);
                boardWithMove.addPiece(pieceToAdd);
                let positionEval;
                positionEval = this.minimax(boardWithMove, depth - 1, true, pieceToAdd);
                if (positionEval < minEval) {
                    minEval = positionEval;
                }
            })

            return minEval;
        }
    }

    evaluateBoard(board, botColor) {
        let evaluation = 0;

       /* board.pieces.forEach(piece => {
            let postitiveEval = (-0.001 * Math.abs((board.cols + board.cols % 2) / 2 - piece.col)) + (-0.001 * Math.abs((board.rows + board.rows % 2) / 2 - piece.row));
            evaluation += playingPlayer == piece.color ? postitiveEval : -1 * postitiveEval;
        });*/
        //console.log(+evaluation.toFixed(3));
        return +evaluation.toFixed(3);
    }
}