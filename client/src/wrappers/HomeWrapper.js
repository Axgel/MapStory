import React, { useContext } from 'react';
import { GlobalStoreContext } from "../store";
import {
  HomeScreen,
  SplashScreen
} from '../screens'

export default function HomeWrapper() {
  const { store } = useContext(GlobalStoreContext);
  
  return <HomeScreen />
  // if (store.loggedIn)
  // else
  //   return <SplashScreen />
}