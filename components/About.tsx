import React from "react";
import { Check, X } from "lucide-react";
import { challenges } from "@/data";

const About = () => {
  function formatText(text: string): React.ReactNode[] {
    const regex = /(\*-.*?-\*|\*.*?\*|-.*?-)/g;
    const result: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const index = match.index;

      // Ajouter le texte entre les balises trouvées
      if (index > lastIndex) {
        result.push(
          <span key={lastIndex}>{text.slice(lastIndex, index)}</span>
        );
      }

      const raw = match[0];
      let content = raw;
      let isBold = raw.startsWith("*") || raw.endsWith("*");
      let isUnderline = raw.startsWith("-") || raw.endsWith("-");

      // Nettoyage des balises * et -
      content = content
        .replace(/^\*?-/, "")
        .replace(/-\*?$/, "")
        .replace(/^\*/, "")
        .replace(/\*$/, "");

      let node: React.ReactNode = content;
      if (isUnderline) node = <u key={index}>{node}</u>;
      if (isBold) node = <strong key={index}>{node}</strong>;
      if (isBold && isUnderline)
        node = (
          <strong key={index}>
            <u>{content}</u>
          </strong>
        );

      result.push(node);
      lastIndex = index + raw.length;
    }

    // Ajouter le reste du texte s’il en reste
    if (lastIndex < text.length) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
    }

    return result;
  }

  return (
    <div className="relative py-16">
      <h2 className="font-bold text-3xl md:text-5xl text-center z-[5000] mb-10 text-white">
        Pourquoi nous ?
      </h2>

      <div>
        <p className="text-center mb-16 text-sm md:text-lg font-bold leading-[150%] text-gray-300">
          Basée sur une comparaison réelle des offres du marché : <br />{" "}
          Comparez par vous-même ce que nous proposons en plus par rapport aux
          autres agences.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.against.map((challenge, index) => (
            <React.Fragment key={index}>
              {/* "Against" column */}
              <div className="bg-black border border-purple-900/30 p-6 flex items-start gap-4">
                <div className="text-red-500 mt-1 flex-shrink-0">
                  <X size={22} />
                </div>
                <div className="text-gray-200 text-base">
                  {formatText(challenge)}
                </div>
              </div>

              {/* "For" column */}
              <div className="bg-green-950/30 border border-green-900/30 p-6 flex items-start gap-4">
                <div className="text-green-500 mt-1 flex-shrink-0">
                  <Check size={22} />
                </div>
                <div className="text-gray-200 text-base">
                  {formatText(challenges.for[index])}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        <p className="text-center mt-16 mb-5 text-sm md:text-lg font-bold leading-[150%] max-w-[850px] mx-auto">
          Chez Dubai Launchers, vous bénéficiez de l’offre la plus rapide, la
          plus complète et la mieux accompagnée du marché – à un tarif que
          personne ne peut égaler.
        </p>
        <p className="text-center mb-10 text-sm md:text-lg font-bold leading-[150%]">
          Le meilleur service. Au meilleur prix. Par les meilleurs.
        </p>
      </div>
    </div>
  );
};

export default About;
