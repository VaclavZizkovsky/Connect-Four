class Bot {
    constructor() {

    }

    getBestMove(board, playerColor) {
        let possibleMoves = board.getPossibleMoves();
        let bestMove = possibleMoves[0];
        let bestEval = +Infinity;
        for (let i = 0; i < possibleMoves.length; i++) {
            let boardWithMove = board.copy();
            let pieceToAdd = new Piece(true, playerColor, board.getNewPieceRow(i + 1), i + 1);
            boardWithMove.addPiece(pieceToAdd);
            let evaluatedBranch = this.minimax(boardWithMove, 5, true, pieceToAdd);
            if (evaluatedBranch < bestEval) {
                bestMove = i + 1;
                bestEval = evaluatedBranch;
            }
        }
        showMessage(bestMove);
    }

    minimax(board, depth, isMaximizing, addedPiece) {
        //console.log(addedPiece.color);
        if (board.checkWin(addedPiece)) {
            return !isMaximizing ? 1 : -1;
        } else if (depth < 1 || board.getPossibleMoves().length == 0) {
            return 0;
        }


        /** Zjistí všechny možné tahy */
        let possibleMoves = board.getPossibleMoves();

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
}