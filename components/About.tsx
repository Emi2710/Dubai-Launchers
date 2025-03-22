import React from "react";
import { Check, X } from "lucide-react";
import { challenges } from "@/data";

const About = () => {
  return (
    <div id="about" className="relative py-16">
      <h2 className="font-bold text-3xl md:text-5xl text-center z-[5000] mb-16 text-white">
        Pourquoi nous ?
      </h2>

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
                <div className="text-gray-200 text-base">{challenge}</div>
              </div>

              {/* "For" column */}
              <div className="bg-green-950/30 border border-green-900/30 p-6 flex items-start gap-4">
                <div className="text-green-500 mt-1 flex-shrink-0">
                  <Check size={22} />
                </div>
                <div className="text-gray-200 text-base">
                  {challenges.for[index].split(", ").map((part, i) => {
                    if (i === 1) {
                      return (
                        <span key={i} className="text-gray-400">
                          , {part}
                        </span>
                      );
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
