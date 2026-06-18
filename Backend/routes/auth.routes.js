import express from "express" ;
import { Login, logOut, singUp } from "../controllers/auth.controller.js";

const authRouter = express.Router() ;

authRouter.post("/signup", singUp) ;
authRouter.post("/signin", Login) ;
authRouter.get("/logout", logOut) ;

export default authRouter
