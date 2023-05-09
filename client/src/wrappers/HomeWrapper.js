import React, { useContext } from 'react';
import {
  HomeScreen,
  SplashScreen
} from '../screens'
import AuthContext from '../auth';



export default function HomeWrapper() {
  const { auth } = useContext(AuthContext);
  
  if (auth.loggedIn || auth.isGuest)
    return <HomeScreen />
  else
    return <SplashScreen />
}