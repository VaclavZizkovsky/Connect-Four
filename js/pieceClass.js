/**
 * @class Třída pro jeden žeton hráče
 */
class Piece {

    /**
     * 
     * @param {Boolean} hasColor 
     * @param {String} color 
     * @param {Number} row 
     * @param {Number} col 
     */
    constructor(hasColor, color, row, col) {
        this.hasColor = hasColor;
        this.color = color;
        this.row = row;
        this.col = col;
    }

}