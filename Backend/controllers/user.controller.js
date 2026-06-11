import { response } from "express";
import geminiRespone from "../gemini.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // comes from middleware isAuth
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "user not found! " });
    }

    return res.status(200).json(user); // return the data of single user jo login hai
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

// to update user image and name
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body; // comes form customize and customize2
    let assistantImage;

    if (req.file) {
      // vo file jo hmane input se add ki hai!
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantImage,
        assistantName,
      },
      { new: true },
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "updateAssistant user error" });
  }
};

// ask to assistant ,
export const askToAssistant = async (req, res) => {
  let gemResult;

  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command)  // history came from model/user.model
    user.save()

    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiRespone(command, userName, assistantName);

    // console.log("=== RAW GEMINI OUTPUT ===");
    // console.log(result); // 👈 add this
    // console.log("=========================");

    // ✅ New - strips markdown fences before parsing
    let cleanedResult = result
      .replace(/```json/g, "") // remove ```json
      .replace(/```/g, "") // remove closing ```
      .trim();

    const jsonMatch = cleanedResult.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({
        message: "sorry! JsonMatch can't understand",
      });
    }
    gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `current date is ${moment().format("YYYY-MM-DD")}`,
        });
      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("dddd")}`,
        });
      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `today is ${moment().format("MMMM")}`,
        });
      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "youtube-open": // ✅ add this
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "chatgpt-open":
      case "weather-search":
      case "weather-show":
      case "spotify-search":
      case "spotify-play":
      case "amazon-search":
      case "amazon-search":
      case "whatsapp-open":
      case "open-website":
      case "open-app":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });

      default:
        return res
          .status(400)
          .json({ response: "I didn't understand that command!" });
    }
  } catch (err) {
    console.log("=== ACTUAL ERROR ===");
    console.log(err?.response?.data || err.message || err);
    console.log("====================");
    return res.status(400).json({
      response: "Invalid JSON from Gemini",
      error: err?.message, // shows real reason
    });
  }
};
