"use client";

import { FaLocationArrow } from "react-icons/fa6";
import { motion } from "framer-motion";

import MagicButton from "@/components/MagicButton";
import { Spotlight } from "@/components/ui/Spotlight";
import TypingEffect from "@/components/ui/TypingEffect";
import VturbPlayer from "@/components/VturbPlayer";
import WhatsappButton from "@/components/ui/WhatsappButton";
import Clients from "@/components/Clients";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Hero = () => {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <div className="pb-20">
        {/**
         *  UI: Spotlights
         *  Link: https://ui.aceternity.com/components/spotlight
         */}
        <div>
          <Spotlight
            className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
            fill="white"
          />
          <Spotlight
            className="h-[80vh] w-[50vw] top-10 left-full"
            fill="#AD49E1"
          />
          <Spotlight
            className="left-80 top-28 h-[80vh] w-[50vw]"
            fill="#AD49E1"
          />
        </div>

        {/**
         *  UI: grid
         *  change bg color to bg-black-100 and reduce grid color from
         *  0.2 to 0.03
         */}
        <div
          className="h-[1500px] w-full max-w-[100vw] dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
        >
          {/* Radial gradient for the container to give a faded look */}
          <div
            // chnage the bg to bg-black-100, so it matches the bg color and will blend in
            className="absolute pointer-events-none inset-0 flex flex-col items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          />
        </div>

        <motion.div
          className="flex flex-col justify-center items-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-[100vw] md:max-w-2xl lg:max-w-[85vw] flex flex-col items-center justify-center">
            {/**
             *  Link: https://ui.aceternity.com/components/text-generate-effect
             *
             *  change md:text-6xl, add more responsive code
             */}

            <motion.h2
              variants={fadeUp}
              className="font-bold text-2xl px-2 md:text-4xl text-center z-[5000] mt-[60px] md:mt-20 leading-[170%] md:leading-[160%] lg:leading-[180%]"
            >
              Découvrez comment{" "}
              <span className="uppercase text-[#af94fff5]">économiser</span> des
              centaines d&apos;heures et des{" "}
              <span className="uppercase text-[#af94fff5]">
                milliers d&apos;euros
              </span>{" "}
              sur votre expatriation à Dubaï
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-center my-6 text-[#ffffffd9] text-[15px] lg:text-xl font-light text-white/70 leading-[200%] lg:leading-[150%] px-[2px] lg:max-w-[60vw] mx-2"
            >
              Cette vidéo vous apprendra gratuitement les pièges qui ruinent les
              projets d&apos;expatriations de milliers d&apos;entrepreneurs - et
              comment les éviter.
            </motion.p>

            <div className="mx-auto w-full max-w-4xl px-4 mb-5">
              <VturbPlayer
                videoId="6989ee51aa8949c7cb31ff0c"
                playerSrc="https://scripts.converteai.net/00710b14-4a11-4585-ada8-40c6ac67fe1a/players/6989ee51aa8949c7cb31ff0c/v4/player.js"
              />
            </div>

            <motion.div variants={fadeUp}>
              <a
                data-iclosed-link="https://app.iclosed.io/e/dubailaunchers/contact"
                data-embed-type="popup"
              >
                <MagicButton
                  title="Obtenir mon audit gratuit"
                  icon={<FaLocationArrow />}
                  position="right"
                />
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <Clients />
        <motion.div variants={fadeUp} className="flex justify-center mb-20">
          <a
            data-iclosed-link="https://app.iclosed.io/e/dubailaunchers/contact"
            data-embed-type="popup"
          >
            <MagicButton
              title="Obtenir mon audit gratuit"
              icon={<FaLocationArrow />}
              position="right"
            />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
