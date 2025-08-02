"use client";

import { navItems } from "@/data";
import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Clients from "@/components/Clients";
import About from "@/components/About";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import WhatsappButton from "@/components/ui/WhatsappButton";
import { useInitialScroll } from "@/hooks/use-initial-scroll";

const Home = () => {
  // Utiliser le hook pour gérer le scroll initial
  useInitialScroll();

  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto px-[5px]">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />={" "}
        <div id="hero">
          <Hero />
        </div>
        <div id="guide">
          <Grid />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="testimonials">
          <Clients />
        </div>
        <div id="contact">
          <Footer />
        </div>
        <WhatsappButton />
      </div>
    </main>
  );
};

export default Home;
