import React, { createContext, useEffect, useState } from "react";
// this is a store for context API , used to store data and send this into diffent componts instead of sharing one by one in every componts
export const userDataContext = createContext();
import axios from "axios";

const UserContext = ({ children }) => {
  const serverUrl = "https://jarvis-ai-assistant-uwsy.onrender.com"; // this is backend url

  const [userData, setUserData] = useState(null);

  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      }); //came from backend user.routes.js
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGeminiResponse = async(command) => { //command came from home.jsx
    try {
      const result = await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})
      console.log(result.data) 
      console.log(result.data);
      return result.data 
    } catch (error) {
      console.log(error) 
      console.log(error.response.data);
      return null;
    }
  }

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse
  };

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
};

export default UserContext;
