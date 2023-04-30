import { syncedStore, getYjsDoc } from "@syncedstore/core";
import { WebrtcProvider } from "y-webrtc";
import * as Y from 'yjs'

export const fileStore = syncedStore({
  subregions: {},
  refresh: [],
});


const ydoc = getYjsDoc(fileStore);
export const webrtcProvider = new WebrtcProvider('syncedstore', ydoc, { signaling: ['wss://test.emailgravely.com/'] });
export const disconnect = () => webrtcProvider.disconnect();
export const connect = () => webrtcProvider.connect();


webrtcProvider.connect();
// Connect to the provider to start synchronization

webrtcProvider.on('peers', (changedPeers, peer) => {
  console.log('A new peer has connected:', peer, changedPeers);
});

webrtcProvider.on('sync', () => {
  console.log('Connected to at least one peer');
});

webrtcProvider.on('disconnect', () => {
  console.log('No peers connected');
});
