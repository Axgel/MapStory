import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
// import * as Y from 'yjs'

export const fileStore = syncedStore({
  items: []
});

const doc = getYjsDoc(fileStore);
export const webrtcProvider = new WebrtcProvider('syncedstore', doc, { signaling: ['ws://localhost:4000'] });
export const disconnect = () => webrtcProvider.disconnect();
export const connect = () => webrtcProvider.connect();

// Connect to the WebRTC provider
webrtcProvider.on('synced', () => {
  console.log('Connected to peers!');
});

// Connect to the provider to start synchronization
