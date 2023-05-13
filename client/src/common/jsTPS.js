/**
 * jsTPS_Transaction
 * 
 * This provides the basic structure for a transaction class. Note to use
 * jsTPS one should create objects that define these two methods, doTransaction
 * and undoTransaction, which will update the application state accordingly.
 * 
 * @author THE McKilla Gorilla (accept no imposters)
 * @version 1.0
 */
export class jsTPS_Transaction {
    /**
     * This method is called by jTPS when a transaction is executed.
     */
    doTransaction() {
        console.log("doTransaction - MISSING IMPLEMENTATION");
    }
    
    /**
     * This method is called by jTPS when a transaction is undone.
     */
    undoTransaction() {
        console.log("undoTransaction - MISSING IMPLEMENTATION");
    }

    transformOp(op) {
        console.log("transformOp - MISSING IMPLEMENTATION");
    }
}

/**
 * jsTPS
 * 
 * This class serves as the Transaction Processing System. Note that it manages
 * a stack of jsTPS_Transaction objects, each of which know how to do or undo
 * state changes for the given application. Note that this TPS is not platform
 * specific as it is programmed in raw JavaScript.
 */
export default class jsTPS {
    constructor() {
        // THE TRANSACTION STACK
        this.undoStack = [];
        this.redoStack = [];
    }


    addTransaction(subregionIds, opType){
        this.undoStack.push({subregionIds: subregionIds, opType: opType});
        this.redoStack = [];
    }

    redoTransaction() {
        const metadata = this.redoStack.pop();
        this.undoStack.push(metadata);
        return metadata;
    }

    /**
     * This function gets the most recently executed transaction on the 
     * TPS stack and undoes it, moving the TPS counter accordingly.
     */
    undoTransaction() {
        const metadata = this.undoStack.pop();
        this.redoStack.push(metadata);
        return metadata;
    }

    undoPeek(){
        return this.undoStack[this.undoStack.length-1];
    }

    /**
     * clearAllTransactions
     * 
     * Removes all the transactions from the TPS, leaving it with none.
     */
    clearAllTransactions() {
        this.undoStack = [];
        this.redoStack = [];
    }

    /**
     * toString
     * 
     * Builds and returns a textual represention of the full TPS and its stack.
     */
    toString() {        
        let text = "--Number of Transactions: " + this.numTransactions + "\n";
        text += "--Current Index on Stack: " + this.mostRecentTransaction + "\n";
        text += "--Current Transaction Stack:\n";
        for (let i = 0; i <= this.mostRecentTransaction; i++) {
            let jT = this.transactions[i];
            text += "----" + jT.toString() + "\n";
        }
        return text;        
    }
}