import jsTPS_Transaction from "../common/jsTPS.js"
const json1 = require('ot-json1');
/**
 * CreateSong_Transaction
 * 
 * This class represents a transaction that creates a song
 * in the playlist. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export class Test_Transaction extends jsTPS_Transaction {
    constructor(initFile, initSubregionId, initOp) {
        super();
        this.file = initFile;
        this.subregionId = initSubregionId;
        this.op = initOp;
    }

    doTransaction() {
        this.file.updateSubregions(this.subregionId, this.op);
        this.file.sendOpToServer(this.subregionId, this.op);
    }
    
    undoTransaction() {
        const inverse = json1.type.invert(this.op);
        this.file.updateSubregions(this.subregionId, inverse);
        this.file.sendOpToServer(this.subregionId, inverse);
    }

    toString() {
        let text = JSON.stringify(this.op)
        return text
    }
}