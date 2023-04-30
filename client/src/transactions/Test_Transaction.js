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
    constructor(initFile, initMapId, initSubregionId, initOp) {
        super();
        this.file = initFile;
        this.mapId = initMapId;
        this.subregionId = initSubregionId;
        this.op = initOp;
        this.inverseOp = json1.type.invert(initOp);
    }

    doTransaction() {
        // this.file.updateSubregions(this.subregionId, this.op);
        this.file.sendOpMiddleware(this.mapId, this.subregionId, this.op);
    }
    
    undoTransaction() {
        //const inverse = json1.type.invert(this.op);
        // this.file.updateSubregions(this.subregionId, inverse);
        this.file.sendOpMiddleware(this.mapId, this.subregionId, this.inverseOp);
    }

    transformOp(op) {
        this.op = json1.type.transform(this.op, op, "right");
        this.inverseOp = json1.type.transform(this.inverseOp, op, "left");
    }

    toString() {
        let text = JSON.stringify(this.op)
        return text
    }
}