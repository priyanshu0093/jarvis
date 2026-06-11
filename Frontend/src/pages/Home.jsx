import React, { useContext, useEffect } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import { useState } from "react";
import aiImg from "../assets/voice.gif";
import userImg from "../assets/user.gif";
import { RiMenu3Fill } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";

const Home = () => {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/Api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(null);
    }
  };

  const startRecognition = () => {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
      if (!error.message.includes("start")) {
        console.error("Recognition error:", err);
      }
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "hi-IN";
    const voice = window.speechSynthesis.getVoices();
    const hindiVoice = voice.find((v) => v.lang === "hi-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    isSpeakingRef.current = true;
    utterance.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(()=> {
        startRecognition();
      }, 800); 
    };

    synth.cancel() ;
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;

    speak(response);

    if (type === "google-search") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://www.google.com/search?q=${query}`;
    }
    if (type === "calculator-open") {
      window.location.href = `https://www.google.com/search?q=calculator`;
    }
    if (type === "instagram-open") {
      window.location.href = `https://www.instagram.com/`;
    }
    if (type === "facebook-open") {
      window.location.href = `https://www.facebook.com/`;
    }
    if (type === "youtube-search") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://www.youtube.com/results?search_query=${query}`;
    }
    if (type === "youtube-open") {
      window.location.href = `https://www.youtube.com/`;
    }
    if (type === "youtube-play") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://www.youtube.com/results?search_query=${query}`;
    }
    if (type === "chatgpt-open") {
      window.location.href = `https://chatgpt.com/`;
    }
    if (type === "spotify-search" || type === "spotify-play") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://open.spotify.com/search/${query}`;
    }
    if (type === "amazon-search" || type === "amazon_search") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://www.amazon.in/s?k=${query}`;
    }
    if (type === "weather-search") {
      const query = encodeURIComponent(userInput);
      window.location.href = `https://www.google.com/search?q=weather+${query}`;
    }
    if (type === "whatsapp-open") {
      window.location.href = `https://web.whatsapp.com/`;
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    const safeRecognization = () => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
          console.log("Recognition request to start");
        } catch (error) {
          if (error.name !== "InvalideStateError") {
            console.error("Start Error:", error);
          }
        }
      }
    };

    // start recognition
    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    // end recognition
    recognition.onend = () => {
      console.log("Recognition ended!");
      isRecognizingRef.current = false;
      setListening(false);
    };

    // Mic thode time ke bad automatic band nhi hoga
    if (!isSpeakingRef.current) {
      setTimeout(() => {
        safeRecognization();
      }, 1000); // delay avoids rapid loops
    }

    // show error in recognition
    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);

      if (event.error !== "aborted" && !isSpeakingRef.current) {
        setTimeout(() => {
          safeRecognization();
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      console.log("heard : " + transcript);

      if (
        transcript
          .toLowerCase()
          .includes(userData?.assistantName?.toLowerCase())
      ) {
        setAiText("");

        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        if (data?.type) {
          handleCommand(data);
        }
        setAiText(data.response);
        setUserText("");
      }
    };

    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        safeRecognization();
      }
    }, 10000);

    return () => {
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };

    // recognition.start();
  }, []);

  return (
    <div className="gap-[20px] w-full h-[100vh] bg-gradient-to-t from-black to-[#02023d] flex justify-center items-center flex-col">
      <RiMenu3Fill
        className="lg:hidden absolute text-white   top-[20px] right-[20px] w-[25px] h-[25px] "
        onClick={() => setHam(true)}
      />

      <div
        className={`absolute top-0 h-full w-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"}`}
      >
        <RxCross2
          className="text-white top-[20px] right-[20px] w-[25px] h-[25px]"
          onClick={() => setHam(false)}
        />

        <button
          className="bg-white rounded-full min-w-[150px] h-[60px] text-19px font-semibold cursor-pointer"
          onClick={handleLogOut}
        >
          Log Out
        </button>
        <button
          className="bg-white rounded-full min-w-[280px] h-[60px] text-19px font-semibold cursor-pointer"
          onClick={() => navigate("/customize")}
        >
          Customize Your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>

        <h1 className="text-white font-semibold text-[19px] mb-[20px]">History</h1>

        <div className="w-full h-[400px] overflow-y-auto flex flex-col truncate gap-[20px] text-white">
          {userData.history?.map((his, index) => (
            <span key={index}>{his}</span>
          ))}
        </div>
      </div>

      <button
        className="bg-white rounded-full min-w-[150px] h-[60px] text-19px absolute top-[20px] right-[20px] font-semibold hidden lg:block cursor-pointer"
        onClick={handleLogOut}
      >
        Log Out
      </button>
      <button
        className="bg-white rounded-full min-w-[280px] h-[60px] text-19px absolute top-[100px] right-[20px] font-semibold hidden lg:block cursor-pointer"
        onClick={() => navigate("/customize")}
      >
        Customize Your Assistant
      </button>
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden gap-[15px]">
        <img
          src={userData?.assistantImage}
          className="h-full object-cover rounded-4xl shadow-lg"
        />
      </div>
      <h1 className="text-white text-[20px] font-semibold">
        I'm {userData?.assistantName}
      </h1>
      {!aiText && <img src={userImg} className="w-[200px]" />}
      {aiText && <img src={aiImg} className="w-[200px]" />}

      <h1 className="text-white text-[18px] font-semibold text-wrap">
        {userText ? userText : aiText}
      </h1>
    </div>
  );
};

export default Home;
