import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const userDataContext = createContext();

const serverUrl = "http://localhost:8000";

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [backendImage, setBackendImage] = useState();
  const [selectedImage, setSelectedImage] = useState();
  const [chatHistory, setChatHistory] = useState([]);

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true }
      );
      return result.data;
    } catch (error) {
      console.error("Backend error:", error.response?.data || error.message);
      return { type: "error", response: "Assistant server error" };
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/history`, {
        withCredentials: true,
      });
      setChatHistory(res.data || []);
    } catch (error) {
      console.error("Fetch chat history error:", error);
    }
  };

  const clearChatHistory = async () => {
    try {
      await axios.delete(`${serverUrl}/api/user/clear-history`, {
        withCredentials: true,
      });
      setChatHistory([]);
    } catch (error) {
      console.error("Clear history error:", error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        setUserData(res.data);
        console.log("Current user:", res.data);
      } catch (error) {
        if (error.response) {
          console.error("Server Error:", error.response.data);
        } else if (error.request) {
          console.error("No response from server. Is backend running?");
        } else {
          console.error("Error fetching user:", error.message);
        }
      }
    };

    fetchCurrentUser();
    fetchChatHistory();
  }, []);

  return (
    <userDataContext.Provider
      value={{
        userData,
        setUserData,
        backendImage,
        setBackendImage,
        selectedImage,
        serverUrl,
        setSelectedImage,
        getGeminiResponse,
        chatHistory,
        setChatHistory,
        fetchChatHistory,
        clearChatHistory,
      }}
    >
      {children}
    </userDataContext.Provider>
  );
};

export default UserDataProvider;