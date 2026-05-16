import React, { useContext, useEffect, useRef, useState } from "react";
import { userDataContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

function Home() {
  const {
    userData,
    serverUrl,
    setUserData,
    getGeminiResponse,
    chatHistory,
    fetchChatHistory,
    clearChatHistory,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [showChatScreen, setShowChatScreen] = useState(false);

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);
  const chatEndRef = useRef(null);

  // ---------------- LOAD CHAT HISTORY ----------------
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
    } else {
      setMessages([
        {
          sender: "assistant",
          text: "Hello! I am your assistant. How can I help you today?",
        },
      ]);
    }
  }, [chatHistory]);

  // ---------------- AUTO SCROLL ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------- LOGOUT ----------------
  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ---------------- OPEN URL ----------------
  const openUrl = (url) => {
    window.open(url, "_blank");
  };

  // ---------------- SAFE START LISTENING ----------------
  const startListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || isRecognitionActiveRef.current || isSpeakingRef.current)
      return;

    try {
      recognition.start();
    } catch (error) {
      console.log("Recognition start skipped:", error.message);
    }
  };

  // ---------------- SAFE STOP LISTENING ----------------
  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !isRecognitionActiveRef.current) return;

    try {
      recognition.stop();
    } catch (error) {
      console.log("Recognition stop skipped:", error.message);
    }
  };

  // ---------------- ADD MESSAGE ----------------
  const addMessage = (sender, text) => {
    if (!text) return;
    setMessages((prev) => [...prev, { sender, text }]);
  };

  // ---------------- CLEAR CHAT ----------------
  const clearChatUI = async () => {
    try {
      await clearChatHistory();

      const clearedMessage = {
        sender: "assistant",
        text: "Chat history cleared. How can I help you now?",
      };

      setMessages([clearedMessage]);
      speak(clearedMessage.text);
    } catch (error) {
      console.error("Clear chat error:", error);
      addMessage("assistant", "Failed to clear chat.");
      speak("Failed to clear chat.");
    }
  };

  // ---------------- SPEAK ----------------
  const speak = (text) => {
    if (!text) return;

    stopListening();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice =
      voices.find((voice) =>
        voice.name.toLowerCase().includes("google us english")
      ) ||
      voices.find((voice) => voice.name.toLowerCase().includes("zira")) ||
      voices.find((voice) => voice.lang === "en-US") ||
      voices[0];

    if (selectedVoice) utterance.voice = selectedVoice;

    setIsSpeaking(true);
    setIsListening(false);
    isSpeakingRef.current = true;

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      setTimeout(() => {
        if (assistantStarted) startListening();
      }, 700);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      setTimeout(() => {
        if (assistantStarted) startListening();
      }, 700);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  };

  // ---------------- START ASSISTANT ----------------
  const handleStartAssistant = () => {
    setAssistantStarted(true);

    const unlock = new SpeechSynthesisUtterance("Assistant activated");
    unlock.onend = () => {
      setTimeout(() => {
        startListening();
      }, 500);
    };

    unlock.onerror = () => {
      setTimeout(() => {
        startListening();
      }, 500);
    };

    window.speechSynthesis.speak(unlock);
  };

  // ---------------- STOP ASSISTANT ----------------
  const handleStopAssistant = () => {
    setAssistantStarted(false);
    stopListening();
    window.speechSynthesis.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  };

  // ---------------- MATH ----------------
  const isMathCommand = (text) => {
    const mathWords = ["plus", "minus", "multiply", "divide", "times", "into"];
    const hasMathWords = mathWords.some((w) => text.toLowerCase().includes(w));
    const hasNumbers = /\d/.test(text);
    const hasMathSymbols = /[+\-*/×÷]/.test(text);
    return (hasMathWords || hasMathSymbols) && hasNumbers;
  };

  const safeEval = (expr) => {
    try {
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
      return Function(`"use strict"; return (${expr})`)();
    } catch {
      return null;
    }
  };

  const handleMath = (transcript) => {
    try {
      const expr = transcript
        .toLowerCase()
        .replace(/(calculate|solve|what is|compute|evaluate|please)/g, "")
        .replace(/plus/g, "+")
        .replace(/minus/g, "-")
        .replace(/times|multiply|into/g, "*")
        .replace(/divide|divided by/g, "/")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .trim();

      const result = safeEval(expr);
      if (result === null) return false;

      const response = `${expr} = ${result}`;
      addMessage("assistant", response);
      speak(response);
      return true;
    } catch {
      return false;
    }
  };

  // ---------------- HANDLE BACKEND RESPONSE ----------------
  const handleBackendAction = async (data) => {
    if (!data?.type) {
      addMessage("assistant", "Sorry, I didn't understand that.");
      speak("Sorry, I didn't understand that.");
      return;
    }

    const { type, response } = data;

    const openAndSpeak = (url) => {
      openUrl(url);
      addMessage("assistant", response);
      speak(response);
    };

    switch (type) {
      case "google-search":
        openAndSpeak(
          `https://www.google.com/search?q=${encodeURIComponent(response)}`
        );
        break;

      case "youtube-search":
      case "youtube-play":
        openAndSpeak(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(
            response
          )}`
        );
        break;

      case "calculator-open":
        openAndSpeak("https://www.google.com/search?q=calculator");
        break;

      case "instagram-open":
        openAndSpeak("https://www.instagram.com");
        break;

      case "facebook-open":
        openAndSpeak("https://www.facebook.com");
        break;

      case "weather-show":
        openAndSpeak("https://www.google.com/search?q=weather");
        break;

      default:
        addMessage("assistant", response || "Sorry, I didn't understand that.");
        speak(response || "Sorry, I didn't understand that.");
    }

    setTimeout(() => {
      fetchChatHistory();
    }, 500);
  };

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText("");
    addMessage("user", text);

    if (text.toLowerCase() === "clear chat") {
      await clearChatUI();
      return;
    }

    if (text.toLowerCase().includes("open whatsapp")) {
      openUrl("https://web.whatsapp.com");
      addMessage("assistant", "Opening WhatsApp");
      speak("Opening WhatsApp");
      return;
    }

    if (isMathCommand(text)) {
      const done = handleMath(text);
      if (done) return;
    }

    try {
      const data = await getGeminiResponse(text);
      handleBackendAction(data);
    } catch (error) {
      console.error("Backend error:", error);
      addMessage("assistant", "Sorry, something went wrong.");
      speak("Sorry, something went wrong.");
    }
  };

  // ---------------- ENTER KEY ----------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // ---------------- SPEECH RECOGNITION ----------------
  useEffect(() => {
    if (!userData?.assistantName) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isRecognitionActiveRef.current = true;
      if (!isSpeakingRef.current) {
        setIsListening(true);
        setIsSpeaking(false);
      }
    };

    recognition.onend = () => {
      isRecognitionActiveRef.current = false;
      setIsListening(false);

      if (!isSpeakingRef.current && assistantStarted) {
        setTimeout(() => {
          startListening();
        }, 1000);
      }
    };

    recognition.onerror = () => {
      isRecognitionActiveRef.current = false;
      setIsListening(false);

      if (!isSpeakingRef.current && assistantStarted) {
        setTimeout(() => {
          startListening();
        }, 1500);
      }
    };

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();

      const assistantName = userData.assistantName.toLowerCase();
      const lowerTranscript = transcript.toLowerCase();

      if (!lowerTranscript.includes(assistantName)) return;

      const text = lowerTranscript.replace(assistantName, "").trim();

      if (!text) {
        addMessage("assistant", "Yes, how can I help you?");
        speak("Yes, how can I help you?");
        return;
      }

      addMessage("user", text);

      if (text.toLowerCase() === "clear chat") {
        await clearChatUI();
        return;
      }

      if (text.includes("open whatsapp")) {
        openUrl("https://web.whatsapp.com");
        addMessage("assistant", "Opening WhatsApp");
        speak("Opening WhatsApp");
        return;
      }

      if (isMathCommand(text)) {
        const done = handleMath(text);
        if (done) return;
      }

      try {
        const data = await getGeminiResponse(text);
        handleBackendAction(data);
      } catch (error) {
        console.error("Backend error:", error);
        addMessage("assistant", "Sorry, something went wrong.");
        speak("Sorry, something went wrong.");
      }
    };

    return () => {
      stopListening();
      window.speechSynthesis.cancel();
    };
  }, [userData, assistantStarted]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-[#02023d] to-[#0a0a4f] flex justify-center items-center overflow-hidden px-4 py-4">
      <div className="w-full max-w-7xl h-full bg-white/5 backdrop-blur-xl rounded-[30px] border border-white/10 shadow-2xl overflow-hidden">
        
        {/* ================= MAIN VOICE SCREEN ================= */}
        {!showChatScreen ? (
          <div className="w-full h-full flex flex-col justify-center items-center px-6 relative">
            {/* Top Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button
                className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
                onClick={() => navigate("/customize")}
              >
                Customize
              </button>

              <button
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
                onClick={handleLogOut}
              >
                Logout
              </button>
            </div>

            {/* Assistant Image */}
            <div className="w-[300px] h-[380px] rounded-[30px] overflow-hidden border border-white/20 shadow-2xl">
              <img
                src={userData?.assistantImage}
                alt="assistant"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Assistant Name */}
            <h1 className="text-white text-4xl font-bold mt-6">
              I'm {userData?.assistantName}
            </h1>

            {/* Status */}
            <p className="text-white/80 text-lg mt-3">
              {!assistantStarted
                ? "Click Start Assistant"
                : isSpeaking
                ? "Assistant is speaking..."
                : isListening
                ? "Listening..."
                : "Waiting..."}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {!assistantStarted ? (
                <button
                  onClick={handleStartAssistant}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition hover:scale-105"
                >
                  Start Assistant
                </button>
              ) : (
                <button
                  onClick={handleStopAssistant}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition hover:scale-105"
                >
                  Stop Assistant
                </button>
              )}

              {/* <button
                onClick={startListening}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition hover:scale-105"
              >
                Speak
              </button> */}

              <button
                onClick={() => setShowChatScreen(true)}
                className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold transition hover:scale-105"
              >
                Open Chat
              </button>
            </div>

            {/* Voice Animation */}
            <div className="mt-8 h-[180px] flex items-center justify-center">
              {isListening && !isSpeaking && (
                <img src={userImg} alt="user listening" className="w-[180px]" />
              )}

              {isSpeaking && (
                <img src={aiImg} alt="assistant speaking" className="w-[180px]" />
              )}
            </div>
          </div>
        ) : (
          /* ================= CHAT SCREEN ================= */
          <div className="w-full h-full flex flex-col p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowChatScreen(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  ← Back
                </button>

                <h2 className="text-white text-2xl font-bold">
                  Chat with {userData?.assistantName}
                </h2>
              </div>

              <button
                onClick={clearChatUI}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold transition"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-white/10 rounded-[25px] border border-white/10 p-5 overflow-hidden flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scroll-smooth">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-5 py-3 rounded-2xl text-[16px] leading-relaxed shadow-md break-words ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-white text-black rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>

              {/* Input */}
              <div className="mt-5 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-5 py-4 rounded-full bg-white text-black outline-none text-[16px]"
                />

                <button
                  onClick={handleSendMessage}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
