import './App.css'
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GlobalStoreContextProvider } from './store'
import { HomeScreen, RegisterScreen, SplashScreen } from './components'


function App() {
  return (
		<BrowserRouter>
			<GlobalStoreContextProvider>
				<Routes>
					<Route path="/" element = {<SplashScreen/>} />
					<Route path="/register" element = {<RegisterScreen/>} />
					<Route path="/home" element = {<HomeScreen/>} />
				</Routes>
			</GlobalStoreContextProvider>
		</BrowserRouter>
	)
}

export default App;
