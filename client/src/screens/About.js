import React, { useContext } from "react";
import { GlobalStoreContext } from "../store";
import AuthContext from "../auth";
import { ViewMode } from "../enums";
import { useNavigate } from "react-router-dom";
import MushroomLogo from '../assets/MushroomLogo.png';
import Kenny from '../assets/kenny.jpg';
import Tracy from '../assets/tracy.jpg';
import Angel from '../assets/angel.jpg';
import Arvin from '../assets/arvin.jpg';

export default function About() {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleGuestAccess(){
    store.setViewMode(ViewMode.PUBLISHED);
    auth.setGuestAccess(true);
    navigate("/")
  }

  function handleRegister(){
    navigate("/register");
  }

  function handleSplashScreen(){
    navigate("/")
  }

  const sectionClass = "text-black text-4xl my-5 ml-10 text-center";
  const listClass = "text-xl"

  return (
    <div className="">
      <div className="flex justify-center">
        <img onClick={handleSplashScreen} className="cursor-pointer w-18 h-18 p-1 mx-4 my-5 hover:w-20 hover:h-20" src={MushroomLogo} alt=""></img>
        <h1 className="text-white text-7xl py-3 pt-6 text-center">
            MapStory
        </h1>
      </div>  

      <h1 className={sectionClass}>
          About Us
      </h1>
      <p className="mx-48 mb-10 text-xl text-center"> 
        MapStory is a web application that designed to streamline and enhance your map editing experience! Maps are a fundamental  <br/>
        invention that helps visualize geographic data. Digital file formats such as Shapefile and GeoJSON have been created to represent them. <br/>
        However, current online tools for editing and sharing map data are inadequate or unintuitive. Our goal is to consolidate these tools <br/> 
        and functions under one application that allows users to share and collaboratively edit maps in real-time, export files in various <br/>
        formats, and save map data into a database.
      </p>

      <h1 className={sectionClass}>
          Features
      </h1>
      <div className="flex flex-wrap justify-center">
        <div className="px-8">
          <p className="text-center text-2xl pb-2">Map Editing</p>
          <ul>
            <li className={listClass}>Collaborative</li>
            <li className={listClass}>Editing Vertices</li>
            <li className={listClass}>Merge/Split Subregions</li>
            <li className={listClass}>Subregion Properties</li>
          </ul>
        </div>
        <div className="px-8">
          <p className="text-center text-2xl pb-2">Supported File Types</p>
          <ul>
            <li className={listClass}>GeoJSON</li>
            <li className={listClass}>Shapefile</li>
          </ul>
        </div>
        <div className="px-8">
          <p className="text-center text-2xl pb-2">Community Interactions</p>
          <ul>
            <li className={listClass}>Commenting</li>
            <li className={listClass}>Voting</li>
          </ul>
        </div>
      </div>

      <h1 className={sectionClass}>
          Meet the Team
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        <div className="mb-6 px-6">
            <div className="flex flex-col">
              <img className="w-[250px] h-[229px] rounded-2xl drop-shadow-md"
                  src={Angel}/> 
                  {/* image width height=400 */}
              <div className="text-center mt-6">
                  <h1 className="text-gray-900 text-xl font-bold mb-1">
                      Angel Li
                  </h1>
              </div>
            </div>
        </div>

        <div className="mb-6 px-6">
            <div className="flex flex-col justify-center">
              <img className="w-[250px] h-[229px] rounded-2xl drop-shadow-md"
                  src={Arvin}/>
              <div className="text-center mt-6">
                  <h1 className="text-gray-900 text-xl font-bold mb-1">
                      Arvin Wang
                  </h1>
              </div>
            </div>
        </div>

        <div className="mb-6 px-6">
            <div className="flex flex-col justify-center">
              <img className="w-[250px] h-[229px] rounded-2xl drop-shadow-md"
                  src={Kenny}/>
              <div className="text-center mt-6">
                  <h1 className="text-gray-900 text-xl font-bold mb-1">
                      Kenny Li
                  </h1>
              </div>
            </div>
        </div>

        <div className="mb-6 px-6">
            <div className="flex flex-col">
              <img className="w-[250px] h-[229px] rounded-2xl drop-shadow-md"
                  src={Tracy}/>
              <div className="text-center mt-6">
                  <h1 className="text-gray-900 text-xl font-bold mb-1">
                      Tracy Ho
                  </h1>
              </div>
            </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3 mb-7">
          <input onClick={handleSplashScreen} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600 rounded-md" value="Log In"></input>
          <input onClick={handleRegister} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600 rounded-md" value="Register"></input>
          <input onClick={handleGuestAccess} type="submit" className="h-12 w-[150px] bg-brownshade-500 hover:bg-brownshade-600 rounded-md" value="Explore"></input>
        </div>
    </div>
  );
}
