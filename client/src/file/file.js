import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import * as Y from 'yjs'

export const fileStore = syncedStore({
  subregions: {},
  refresh: []
});

const ydoc = getYjsDoc(fileStore);
export const webrtcProvider = new WebrtcProvider('syncedstore', ydoc, { signaling: ['ws://localhost:4000'] });
export const disconnect = () => webrtcProvider.disconnect();
export const connect = () => webrtcProvider.connect();

webrtcProvider.connect();
// Connect to the provider to start synchronization
