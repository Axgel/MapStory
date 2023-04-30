import jsTPS_Transaction from "../common/jsTPS.js"
//const json1 = require('ot-json1');
const json0 = require('ot-json0');
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
        this.inverseOp = json0.type.invert(initOp);
    }

    doTransaction() {
        this.file.sendOpMiddleware(this.mapId, this.subregionId, this.op);
    }
    
    undoTransaction() {
        this.file.sendOpMiddleware(this.mapId, this.subregionId, this.inverseOp);
    }

    transformOp(op) {
        this.op = json0.type.transform(this.op, op, "right");
        this.inverseOp = json0.type.transform(this.inverseOp, op, "left");
    }

    toString() {
        let text = JSON.stringify(this.op)
        return text
    }
}