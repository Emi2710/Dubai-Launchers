"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import BentoGridItem from "./BentoGrid";

interface TimelineItem {
  id: number;
  title: string;
  img: string;
  description: React.ReactNode;
  delai: string;
  presence: string;
}

interface BentoGridTimelineProps {
  items: TimelineItem[];
}

export default function BentoGridTimeline({ items }: BentoGridTimelineProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate scroll progress through the timeline
    const handleScroll = () => {
      if (!containerRef.current || !timelineRef.current) return;

      const container = containerRef.current;
      const timeline = timelineRef.current;

      // Get container position
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerHeight = containerRect.height;

      // Get timeline position
      const timelineRect = timeline.getBoundingClientRect();
      const timelineHeight = timelineRect.height;

      // Calculate viewport position
      const viewportHeight = window.innerHeight;
      const viewportMid = viewportHeight / 2;

      // Calculate how far we've scrolled through the timeline
      const scrollStart = -containerTop + viewportMid - timelineHeight * 0.1;
      const scrollEnd = containerHeight - timelineHeight * 0.1;

      // Calculate progress percentage (0-100)
      const progress = Math.max(
        0,
        Math.min(100, (scrollStart / scrollEnd) * 100)
      );
      setScrollProgress(progress);

      // Update active index based on progress
      const newActiveIndex = Math.floor((progress / 100) * items.length);
      if (newActiveIndex !== activeIndex && newActiveIndex < items.length) {
        setActiveIndex(newActiveIndex);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [items.length, activeIndex]);

  return (
    <div className="mx-auto p-6" ref={containerRef}>
      <div className="relative" ref={timelineRef}>
        {/* Timeline line that grows as you scroll */}
        <div className="absolute left-[15px] top-[15px] w-0.5 h-[calc(100%-30px)] bg-gray-800 z-0 lg:left-1/2 lg:translate-x-[-50%]">
          <div
            className="absolute top-0 left-0 w-full bg-[#af94fff5]/30 transition-all duration-700 ease-out"
            style={{
              height: `${scrollProgress}%`,
              boxShadow: "0 0 8px rgba(147, 51, 234, 0.5)",
            }}
          />
        </div>

        {/* Timeline items */}
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="relative"
          >
            <div className="flex">
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center pl-[8px] lg:pl-0 mr-6 z-10 lg:left-1/2 lg:translate-x-[-50%]">
                <div
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    scrollProgress >= (index / items.length) * 100
                      ? "bg-[#af94fff5] ring-4 ring-[#af94fff5]/30 scale-110"
                      : "bg-gray-800"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-grow">
                <BentoGridItem
                  {...item}
                  isActive={scrollProgress >= (index / items.length) * 100}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
