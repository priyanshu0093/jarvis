import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import genToken from "../config/token.js"

export const singUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // email exist or not 
    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email Already exists!" });
    }

    // check password
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters!" });
    }

    // password security 
    const hashedPassword = await bcrypt.hash(password,10) ;

    // create user
    const user = await User.create({
        name, email, password:hashedPassword 
    })

    // create token 
    const token = await genToken(user._id) 

    res.cookie("token", token, {
      httpOnly:true ,
      maxAge:7*24*60*60*1000 ,
      sameSite:"None" ,
      secure:true 
    }) 

    return res.status(201).json(user) 

  } catch (error) {
    return res.status(500).json({message: `sign up error ${error}`}) 
  }
};


export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // email exist or not 
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email does not exists!" });
    }
    
    // compare password
    const isMatch = await bcrypt.compare(password, user.password)  

    if(!isMatch){
      return res.status(400).json({ message: "Incorrect password !" });
    }

    // create token 
    const token = await genToken(user._id) 

    res.cookie("token", token, {
      httpOnly:true ,
      maxAge:7*24*60*60*1000 ,
      sameSite:"None" ,
      secure:true 
    }) 

    return res.status(201).json(user) 

  } catch (error) {
    return res.status(500).json({message: `Login ${error}`}) 
  }
};

export const logOut = async (req,res) => {
  try{
    res.clearCookie("token") 
    return res.status(200).json({message:"LogOut successfully!"})
  }
  catch(error){
    return res.status(500).json({message:`logout error ${error}`})
  }
}
