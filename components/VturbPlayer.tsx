"use client";

import Script from "next/script";

type VturbPlayerProps = {
  videoId?: string; // ex: "6989c9f8d023abad66c626df"
  playerSrc?: string; // url player.js
};

export default function VturbPlayer({
  videoId = "6989c9f8d023abad66c626df",
  playerSrc = "https://scripts.converteai.net/00710b14-4a11-4585-ada8-40c6ac67fe1a/players/6989c9f8d023abad66c626df/v4/player.js",
}: VturbPlayerProps) {
  return (
    <div className="w-full">
      {/* Web Component */}

      {/* @ts-ignore */}
      <vturb-smartplayer
        id={`vid-${videoId}`}
        style={{ display: "block", margin: "0 auto", width: "100%" }}
      />

      {/* Optimization snippet (_plt) */}
      <Script id="vturb-plt" strategy="beforeInteractive">
        {`!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);`}
      </Script>

      {/* Player script */}
      <Script
        id="vturb-player"
        src={playerSrc}
        strategy="afterInteractive"
        async
      />
    </div>
  );
}
