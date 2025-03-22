import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { faqData } from "@/data";

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq" className="max-w-2xl mx-auto p-6">
      <h2 className="font-bold text-3xl md:text-5xl text-center z-[5000] mb-5 text-white">
        FAQ
      </h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center p-4 transition"
            >
              <span className="font-medium">{item.question}</span>
              <span>{openIndex === index ? "−" : "+"}</span>
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, maxHeight: 0 }}
                  animate={{ opacity: 1, maxHeight: 200 }} // Set a reasonable max height
                  exit={{ opacity: 0, maxHeight: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-4"
                >
                  {item.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
