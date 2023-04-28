import { OTOperations } from "../../enums"

export function createVertexOperationPath(subregionId, indexPath){
  const path = [subregionId, OTOperations.COORDINATES];
  path.push(...indexPath);
  return path;
}