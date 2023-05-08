import { TransactionType } from "../enums"
export function CreateVertexTransaction(transaction, e, subregionId){
  switch(transaction){
    case TransactionType.ADD_VERTEX:
      return createAddVertexTransaction(transaction, e, subregionId);
    case TransactionType.MOVE_VERTEX:
      return createMoveVertexTransaction(transaction, e, subregionId);
    case TransactionType.REMOVE_VERTEX:
      return createRemoveVertexTransaction(transaction, e, subregionId);
   }
}


function createAddVertexTransaction(transaction, e, subregionId){
  return [transaction, subregionId, e.indexPath, [e.latlng.lat, e.latlng.lng]];

}

function createMoveVertexTransaction(transaction, e, subregionId){
  const [i,j,k] = e.indexPath;
  const temp = e.layer.getLatLngs()[i][j][k];
  const newVal = [temp.lat, temp.lng];
  return [transaction, subregionId, e.indexPath, newVal]
}

function createRemoveVertexTransaction(transaction, e, subregionId){
  const [i,j,k] = e.indexPath;
  const newVal =  [e.marker._latlng.lat, e.marker._latlng.lng];
  return [transaction, subregionId, e.indexPath, newVal]
}


