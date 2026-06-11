import React, { useState } from "react";
import bg from "../assets/authBg.png";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [loading,setLoading] = useState(false) ;

  const { serverUrl,userData, setUserData } = useContext(userDataContext); //takes data from userContext.jsx

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true) 
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true },
      );
      setUserData(result.data) 
      setLoading(false) 
      navigate("/customize")
    } catch (error) {
      console.log(error.response.data);
      setUserData(null)
      setErr(error.response.data.message);
      setLoading(false) 
    }
  };

  return (
    <div
      className="w-full h-[100vh] bg-cover flex justify-center items-center "
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form
        className="w-[30%] h-[600px] max-w-[500px] bg-[#00000069] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-[20] px-[20px]"
        onSubmit={handleSignUp}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        {/* for Name */}
        <input
          type="text"
          placeholder="Enter your Name"
          className="w-full h-[60px] outline-none border-2 border-white text-white bg-transparent placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] mb-[25px]"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
          name="name"
          id="name"
        />

        {/* For Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] outline-none border-2 border-white text-white bg-transparent placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px] mb-[25px]"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          name="email"
          id="email"
        />

        {/* for password */}
        <div className="w-full h-[60px] border-2 border-white bg-transparent rounded-full outline-none relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-full placeholder-gray-300 text-[18px] px-[20px] py-[10px] outline-none bg-transparent text-white rounded-full"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            name="password"
            id="password"
          />
          {!showPassword ? (
            <IoMdEye
              className="absolute text-white right-[20px] h-[25px] w-[25px] cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <IoMdEyeOff
              className="absolute text-white right-[20px] h-[25px] w-[25px] cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {/* showing error in frontend */}
        {err && <p className="text-red-500 mt-[15px] text-[17px]">{err}</p>}

        {/* for Button */}
        <button className="min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold mt-[40px] text-[19px]" disabled={loading}>
          
          {loading? "loading..." : "Sign Up"}
        </button>
        <p
          className="text-[18px] text-[white] cursor-pointer mt-[20px]"
          onClick={() => navigate("/signin")}
        >
          Already have an account ?{" "}
          <span className="text-blue-400">Sign In</span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
