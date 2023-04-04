import "./App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GlobalStoreContextProvider } from "./store";
import { 
  SplashScreen,
  RecoverPasswordScreen,
  RegisterScreen,
  ProfileScreen,
  HomeScreen,
  MapScreen
 } from "./screens";

import {
  HomeWrapper
} from './wrappers'

import { AuthContextProvider } from "./auth";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <GlobalStoreContextProvider>
          <Routes>
            <Route path="/" element={<HomeWrapper />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/recover" element={<RecoverPasswordScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/map" element={<MapScreen />} />
          </Routes>
        </GlobalStoreContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
