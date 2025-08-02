import React from "react";
import { FaWhatsapp } from "react-icons/fa";

const WhatsappButton = () => {
  const phoneNumber = "33612345678"; // Remplace avec ton numéro en format international sans le "+"

  return (
    <a
      href={`https://calendly.com/contact-dubailaunchers/30min`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center z-[6000]"
      style={{ width: "60px", height: "60px" }}
    >
      <FaWhatsapp size={30} />
    </a>
  );
};

export default WhatsappButton;
