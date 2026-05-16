import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

// ---------------- GET CURRENT USER ----------------
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

// ---------------- UPDATE ASSISTANT ----------------
export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage;

    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    } else if (imageUrl) {
      assistantImage = imageUrl;
    } else {
      return res.status(400).json({ message: "No image provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    console.log("Updated user:", user);

    return res.status(200).json(user);
  } catch (error) {
    console.error("Update assistant error:", error);
    return res.status(400).json({ message: "Update assistant error" });
  }
};

// ---------------- SAVE MESSAGE ----------------
export const saveMessage = async (req, res) => {
  try {
    const { sender, text } = req.body;

    if (!sender || !text) {
      return res.status(400).json({ message: "sender and text are required" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.history.push({ sender, text });
    await user.save();

    return res.status(200).json({
      message: "Message saved successfully",
      history: user.history,
    });
  } catch (error) {
    console.error("Save message error:", error);
    return res.status(500).json({ message: "Save message error" });
  }
};

// ---------------- GET CHAT HISTORY ----------------
export const getChatHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("history");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user.history);
  } catch (error) {
    console.error("Get chat history error:", error);
    return res.status(500).json({ message: "Get chat history error" });
  }
};

// ---------------- CLEAR CHAT HISTORY ----------------
export const clearChatHistory = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { history: [] },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear chat history error:", error);
    return res.status(500).json({ message: "Clear chat history error" });
  }
};

// ---------------- ASK TO ASSISTANT ----------------
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);

    const userName = user.name;
    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);
    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res.status(400).json({ response: "sorry, i can't understand" });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    let finalResponse = "";

    switch (type) {
      case "get-date":
        finalResponse = `current date is ${moment().format("YYYY-MM-DD")}`;
        break;

      case "get-time":
        finalResponse = `current time is ${moment().format("hh:mm A")}`;
        break;

      case "get-day":
        finalResponse = `today is ${moment().format("dddd")}`;
        break;

      case "get-month":
        finalResponse = `today is ${moment().format("MMMM")}`;
        break;

      case "youtube-play":
      case "get-year":
      case "google-search":
      case "youtube-search":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        finalResponse = gemResult.response;
        break;

      default:
        return res
          .status(400)
          .json({ response: "I didn't understand that command." });
    }

    // SAVE USER + ASSISTANT CHAT
    user.history.push({ sender: "user", text: command });
    user.history.push({ sender: "assistant", text: finalResponse });
    await user.save();

    return res.json({
      type,
      userInput: gemResult.userInput,
      response: finalResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ response: "ask assistant error." });
  }
};