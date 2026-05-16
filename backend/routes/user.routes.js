// import express from "express"
// import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controllers.js"
// import isAuth from "../middlewares/isAuth.js"
// import upload from "../middlewares/multer.js"

// const userRouter = express.Router()


// userRouter.get("/current",isAuth,getCurrentUser)
// userRouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)
// userRouter.post("/asktoassistant",isAuth,askToAssistant)
 
// export default userRouter

import express from "express";
import {
  askToAssistant,
  getCurrentUser,
  updateAssistant,
  saveMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/user.controllers.js";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRouter.post("/asktoassistant", isAuth, askToAssistant);

// NEW CHAT ROUTES
userRouter.post("/save-message", isAuth, saveMessage);
userRouter.get("/history", isAuth, getChatHistory);
userRouter.delete("/clear-history", isAuth, clearChatHistory);

export default userRouter;


