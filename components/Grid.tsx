import { gridItems } from "@/data"; // Import the gridItems data
import BentoGridTimeline from "./ui/BentoGridTimeline";

const Grid = () => {
  return (
    <section>
      <h2 className="font-bold text-3xl md:text-5xl text-center z-[5000] mt-20">
        Comment ça marche ?
      </h2>
      <div className="w-full pb-20 mt-10">
        {/* Correctly passing gridItems as an array */}
        <BentoGridTimeline items={gridItems} />
      </div>
    </section>
  );
};

export default Grid;
