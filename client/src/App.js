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
  AllScreen, 
  About,
  AboutScreen
 } from "./screens";

 import {
  PublishMapModal,
  DeleteMapModal,
  ShareMapModal,
  ForkMapModal,
  ExportMapModal,
  AccountFeedbackModal,
  AddTagModal,
  ChangeUsernameModal,
  ChangePasswordModal,
  CreateMapModal,
  ForgotPasswordModal
 } from "./modals"

import {
  HomeWrapper
} from './wrappers'

import { AuthContextProvider } from "./auth";
import { GlobalFileContextProvider } from "./file";

function App() {
  return (
    <BrowserRouter>
      <AuthContextProvider>
        <GlobalStoreContextProvider>
          <GlobalFileContextProvider>
            <Routes>
              <Route path="/" element={<HomeWrapper />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/recover" element={<RecoverPasswordScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/map/:mapId" element={<MapScreen />} />
              <Route path="/about" element={<AboutScreen />} />
            </Routes>
            <AccountFeedbackModal />
            <PublishMapModal />
            <DeleteMapModal />
            <ShareMapModal />
            <ForkMapModal />
            <ExportMapModal />
            <AddTagModal />
            <ChangeUsernameModal />
            <ChangePasswordModal />
            <CreateMapModal />
            <ForgotPasswordModal />
          </GlobalFileContextProvider>
        </GlobalStoreContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  );
}

export default App;
