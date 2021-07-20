export default class Ean13Code {
    constructor(left: number, right: number) {
        this.left = left;
        this.right = right;
    }
    
    readonly left: number;
    readonly right: number;
}