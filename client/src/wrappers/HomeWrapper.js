import React, { useContext } from 'react';
import { GlobalStoreContext } from "../store";
import {
  HomeScreen,
  SplashScreen
} from '../screens'

export default function HomeWrapper() {
  const { store } = useContext(GlobalStoreContext);

  if (store.loggedIn)
    return <HomeScreen />
  else
    return <SplashScreen />
}