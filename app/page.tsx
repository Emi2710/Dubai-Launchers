"use client";

import { navItems } from "@/data";

import Hero from "@/components/Hero";
import Grid from "@/components/Grid";
import Footer from "@/components/Footer";
import Clients from "@/components/Clients";
import About from "@/components/About";
import { FloatingNav } from "@/components/ui/FloatingNavbar";
import Faq from "@/components/Faq";
import WhatsappButton from "@/components/ui/WhatsappButton";
import { useEffect } from "react";

const Home = () => {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto px-[5px]">
      <div className="max-w-7xl w-full">
        <FloatingNav navItems={navItems} />
        <Hero />
        <Grid />
        <About />
        <Clients />
        {/*<Faq />*/}
        <Footer />
        <WhatsappButton />
      </div>
    </main>
  );
};

export default Home;
