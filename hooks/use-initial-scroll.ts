"use client";

import { useEffect } from "react";

export function useInitialScroll() {
  useEffect(() => {
    // Gérer le scroll initial si il y a un hash dans l'URL
    const handleInitialScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const sectionId = hash.substring(1);
          const element = document.getElementById(sectionId);

          if (element) {
            const navbarHeight = 100; // Même valeur que dans FloatingNavbar
            const elementPosition = element.offsetTop - navbarHeight;

            window.scrollTo({
              top: elementPosition,
              behavior: "smooth",
            });
          }
        }, 500); // Délai plus long pour s'assurer que tout est chargé
      }
    };

    // Gérer le bouton retour/avancer
    const handlePopState = () => {
      handleInitialScroll();
    };

    // Exécuter au chargement
    handleInitialScroll();

    // Écouter les changements d'historique
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
