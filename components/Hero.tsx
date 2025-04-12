import { FaLocationArrow } from "react-icons/fa6";

import MagicButton from "./MagicButton";
import { Spotlight } from "./ui/Spotlight";
import TypingEffect from "./ui/TypingEffect";

const Hero = () => {
  return (
    <div className="pb-20 pt-3">
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
        className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
      >
        {/* Radial gradient for the container to give a faded look */}
        <div
          // chnage the bg to bg-black-100, so it matches the bg color and will blend in
          className="absolute pointer-events-none inset-0 flex flex-col items-center justify-center dark:bg-black-100
         bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>

      <div className="flex flex-col justify-center items-center relative mt-20 z-10">
        <div className="w-[100vw] md:max-w-2xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          {/**
           *  Link: https://ui.aceternity.com/components/text-generate-effect
           *
           *  change md:text-6xl, add more responsive code
           */}

          <TypingEffect />

          <p className="text-center my-6 text-[#ffffffd9] text-[22px] lg:text-2xl font-light leading-[180%] lg:leading-[182%] px-[2px]">
            On s&apos;occupe de{" "}
            <strong className="">
              <span className="">tout:</span> licence de votre société, visa,
              comptes bancaires et plus encore.
            </strong>{" "}
            Lancez votre société
            <strong className="font-bold text-white">
              {" "}
              sans effort, sans paperasse
            </strong>{" "}
            et en{" "}
            <strong className="font-bold text-white"> un temps record.</strong>
          </p>

          <a href="#" target="_blank">
            <MagicButton
              title="Consultation gratuite"
              icon={<FaLocationArrow />}
              position="right"
            />
          </a>
        </div>
        <div className="text-center mt-10 ">
          <p className="text-sm md:text-md">
            Plus de
            <span className="text-[#af94fff5] font-bold uppercase">
              {" "}
              50+ entrepreneurs
            </span>{" "}
            <span className="font-bold"></span> nous ont déjà fait confiance et
            ont économisé des millions d&apos;euros d&apos;impôts...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
