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
  MapScreen,
  AllScreen
 } from "./screens";

 import {
  PublishMapModal,
  DeleteMapModal,
  ShareMapModal,
  ExportMapModal,
  AccountFeedbackModal
 } from "./modals"

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
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/recover" element={<RecoverPasswordScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/all" element={<AllScreen />} />
          </Routes>
          <AccountFeedbackModal />
          <PublishMapModal />
          <DeleteMapModal />
          <ShareMapModal />
          <ExportMapModal />
        </GlobalStoreContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
