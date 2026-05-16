import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { IoArrowBackSharp } from "react-icons/io5";
import { userDataContext } from "../context/userContext";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.jpeg";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";

function Customize() {
  const [selectedImage, setSelectedImage] = useState(null);
  const { setSelectedImage: setContextSelectedImage } = useContext(userDataContext); // Add this
  const navigate = useNavigate();

  const handleSelect = (image) => {
    setSelectedImage(image);
    setContextSelectedImage(image); // Update context
  };

  const images = [image1, image2, image4, image5, image6, image7];

  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-[20px]">
      <IoArrowBackSharp className = 'absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px]' onClick={()=>navigate("/")}/>
      <h1 className="text-white text-2xl font-bold mb-6">
        Choose Your <span className="text-blue-200">Assistant Image</span>
      </h1>

      {/* Image Grid */}
      <div className="w-[90%] max-w-[900px] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[2px] justify-items-center">
        {images.map((img, idx) => (
          <Card
            key={idx}
            image={img}
            isSelected={selectedImage === img}
            onClick={() => handleSelect(img)}
          />
        ))}
      </div>

      {/* Fixed height space for the button (prevents layout shift) */}
      <div className="mt-[30px] h-[60px] flex items-center justify-center">
        {selectedImage && (
          <button
            className="min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px] hover:bg-gray-200 transition"
            onClick={() => navigate("/customize2")}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 

export default Customize;

 