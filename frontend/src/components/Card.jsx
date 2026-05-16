// src/components/Card.jsx
import React from "react";

function Card({ image, isSelected, onClick }) {
  
  return (
    <div
      onClick={onClick}
      className={`w-[150px] h-[250px] bg-[#020220] border-2 rounded-2xl overflow-hidden 
        cursor-pointer flex items-center justify-center transition-all duration-200
        ${isSelected 
          ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]"
          : "border-[#0000ff66] hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        }`}
        
    >
      <img src={image} alt="assistant" className="w-full h-full object-cover" />
    </div>
  );
}

export default Card;
