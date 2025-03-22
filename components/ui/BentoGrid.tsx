import type React from "react";

interface BentoGridItemProps {
  id: number;
  title: string;
  img: string;
  description: React.ReactNode; // This ensures that description can accept an array of <li> elements
  delai: string;
  presence: string;
  isActive?: boolean; // Added for animation
}

const BentoGridItem = ({
  id,
  title,
  img,
  description,
  delai,
  presence,
  isActive = false,
}: BentoGridItemProps) => {
  return (
    <div
      className={`bento-grid-item transition-all duration-500 ease-out transform lg:flex justify-between items-center w-100 xl:max-w-[] 2xl:max-w-[70vw] ${
        isActive ? "opacity-100 translate-x-0" : "opacity-70 translate-x-4"
      } ${id % 2 === 0 ? "lg:flex-row-reverse" : ""}`} // Alternates image position based on even/odd id
    >
      <img
        src={img || "/placeholder.svg"}
        alt={title}
        className={`rounded-xl transition-all duration-500 max-h-[320px] lg:my-16 ${
          isActive ? "shadow-[0_0_20px_rgba(149,76,233,0.3)]" : ""
        }`}
      />

      <div
        className={`px-1 my-5 transition-all duration-500 ease-out max-w-[450px] ${
          isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-4"
        }`}
      >
        <h2 className="text-gray-300 text-sm font-medium md:text-[16px]">
          Étape {id}
        </h2>
        <h3 className="text-2xl md:text-3xl md:my-3 font-bold text-white mt-1">
          {title}
        </h3>
        <div className="mt-3 text-gray-200 md:text-lg">
          <ul className="list-disc pl-5 space-y-1 font-light">
            {Array.isArray(description)
              ? description.map((desc, i) => <li key={i}>{desc}</li>)
              : description}
          </ul>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-gray-200 font-light">
            <span className="font-medium">Délais:</span> {delai}
          </p>
          <p className="text-gray-200 font-light">
            <span className="font-medium">Présence:</span> {presence}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BentoGridItem;
