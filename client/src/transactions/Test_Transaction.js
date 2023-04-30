import jsTPS_Transaction from "../common/jsTPS.js"
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
    constructor(initFile, initSubregionId) {
        super();
        this.file = initFile;
        this.subregionId = initSubregionId;
    }

    doTransaction() {
        // this.file.updateSubregions(this.subregionId, this.op);
        console.log("do trans");
    }
    
    undoTransaction() {
        console.log("undo trans");
    }
}