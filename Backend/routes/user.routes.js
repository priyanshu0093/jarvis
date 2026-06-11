import express from "express" 
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js" 

const userRouter = express.Router() 

userRouter.get("/current",isAuth , getCurrentUser) 
userRouter.post("/update",isAuth,upload.single("assistantImage") ,updateAssistant)  //upload is a multer 
//upload me frontend se aayi image upload hogi, jo formData me humne append ki hai!

userRouter.post("/asktoassistant",  isAuth, askToAssistant) 

export default userRouter 