/**
 * @class Třída pro jeden žeton hráče
 */
class Piece {

    /**
     * 
     * @param {boolean} hasColor 
     * @param {string} color 
     * @param {number} row 
     * @param {number} col 
     */
    constructor(hasColor, color, row, col) {
        this.hasColor = hasColor;
        this.color = color;
        this.row = row;
        this.col = col;
    }

} 