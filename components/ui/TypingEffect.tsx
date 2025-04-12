"use client";

import { useState, useEffect } from "react";

const words = [
  "100% clé en main",
  "en un temps record",
  "sans paperasse",
  "sans complications",
  "sans efforts",
];

const TypingEffect = () => {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | number | undefined; // ✅ Correction du typage

    const currentWord = words[wordIndex];

    if (deleting) {
      if (charIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 100); // ⬅️ Suppression plus lente (100ms au lieu de 50ms)
      } else {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    } else {
      if (charIndex < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        }, 200); // ⬅️ Ajout plus lent (200ms au lieu de 100ms)
      } else {
        timeout = setTimeout(() => setDeleting(true), 2000); // ⬅️ Pause plus longue avant suppression (2000ms au lieu de 1000ms)
      }
    }

    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex]);

  return (
    <h1 className="font-bold text-center text-[43px] leading-[125%] md:text-6xl lg:leading-[130%] h-[250px]">
      Votre société à Dubaï{" "}
      <span className="text-[#7b3bfbf5]">{displayText}</span>
      <span className="animate-blink">|</span> par les meilleurs du marché
    </h1>
  );
};

export default TypingEffect;
