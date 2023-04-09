import React, { useContext } from 'react';
import {
  HomeScreen,
  SplashScreen
} from '../screens'
import AuthContext from '../auth';



export default function HomeWrapper() {
  const { auth } = useContext(AuthContext);
  
  return <HomeScreen />
  // if (auth.loggedIn)
  // else
    // return <SplashScreen />
}