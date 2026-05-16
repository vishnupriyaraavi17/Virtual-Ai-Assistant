import React, {useState, useContext} from 'react'
import { userDataContext } from '../context/userContext'
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Customize2() {
  const {userData, backendImage, selectedImage, setUserData, serverUrl} = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {
    setLoading(true)
    try {
      setLoading(true);
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      
      // If backendImage exists (file upload), use it
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } 
      // If selectedImage exists (local image), send as URL
      else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLoading(false)
      console.log("Update result:", result.data);
      setUserData(result.data);
      navigate("/"); // Navigate to home after successful update
      
    } catch(error) {
      setLoading(false)
      console.log("Update error:", error);
      alert("Failed to update assistant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-[20px] relative">
      <IoArrowBackSharp 
        className='absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px]' 
        onClick={() => navigate("/customize")}
      /> 
      <h1 className="text-white text-2xl font-bold mb-6">
        Enter Your <span className="text-blue-200">Assistant Name</span>
      </h1>
      <input 
        type="text"
        placeholder="eg. bob"
        className="w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]" 
        required 
        onChange={(e) => setAssistantName(e.target.value)} 
        value={assistantName}
      />
      {assistantName && (
        <button
          className="min-w-[300px] h-[60px] mt-[30px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] disabled:opacity-50"
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {!loading ? "Finally Create Your Assistant" : "Loading..."}
        </button>
      )}
    </div>
  );
}

export default Customize2;