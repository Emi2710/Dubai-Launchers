"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import MagicButton from "../MagicButton";
import { FaLocationArrow, FaBars, FaXmark } from "react-icons/fa6";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Gère la visibilité de la navbar au scroll
  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;
      setVisible(scrollYProgress.get() < 0.05 || direction < 0);
    }
  });

  // Fonction pour gérer le scroll vers les sections
  const handleNavClick = (link: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Fermer le menu mobile si ouvert
    setIsMenuOpen(false);

    // Si c'est un lien avec hash (ancre)
    if (link.includes("#")) {
      const sectionId = link.substring(1); // Enlever le #
      const element = document.getElementById(sectionId);

      if (element) {
        // Calculer la position en tenant compte de votre navbar flottante
        const navbarHeight = 100; // Ajustez selon votre design
        const elementPosition = element.offsetTop - navbarHeight;

        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });

        // Mettre à jour l'URL
        window.history.pushState(null, "", link);
      }
    } else {
      // Pour les liens normaux, utiliser la navigation Next.js
      window.location.href = link;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div className="flex items-center justify-between lg:justify-center px-4 md:px-10 py-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="z-[5000]"
        >
          <img
            src="/logo/2.png"
            alt="Logo Dubai Launchers"
            className="w-[140px]"
          />
        </motion.div>

        {/* Bouton de menu mobile */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white relative z-[5000]"
          >
            {isMenuOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Navbar principale (Desktop) */}
        <motion.div
          initial={{ opacity: 1, y: -100 }}
          animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className={cn(
            "hidden lg:flex items-center space-x-4 z-[5000] top-10 inset-x-0 pl-10 pr-2 py-2 rounded-lg border border-black/10 shadow-md justify-center",
            className
          )}
          style={{
            backdropFilter: "blur(16px) saturate(180%)",
            backgroundColor: "rgba(17, 25, 40, 0.75)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
        >
          {navItems.map((navItem, idx) => (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              onClick={(e) => handleNavClick(navItem.link, e)}
              className="relative dark:text-neutral-50 flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500 cursor-pointer"
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="text-sm">{navItem.name}</span>
            </Link>
          ))}

          {/* Magic Button Desktop */}
          <div className="pl-10 hidden md:block">
            <MagicButton
              title="Je réserve un appel"
              icon={<FaLocationArrow />}
              position="right"
            />
          </div>
        </motion.div>

        {/* Menu mobile animé */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-[150px] h-[270px] w-[90vw] z-[5000] p-3 rounded-xl text-center bg-[#000319]"
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.125)",
              }}
            >
              {navItems.map((navItem, idx) => (
                <Link
                  key={`mobile-link=${idx}`}
                  href={navItem.link}
                  className="text-white text-lg block py-2 px-4 hover:bg-purple-800 rounded-md"
                  onClick={(e) => handleNavClick(navItem.link, e)}
                >
                  {navItem.icon} {navItem.name}
                </Link>
              ))}

              {/* Magic Button Mobile */}
              <div className="mt-4">
                <MagicButton
                  title="Je réserve un appel"
                  icon={<FaLocationArrow />}
                  position="right"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
