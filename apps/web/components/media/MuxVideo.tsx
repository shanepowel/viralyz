"use client";

import { useEffect, useState } from "react";
import MuxPlayer from "@mux/mux-player-react/lazy";

export function MuxVideo({
  playbackId,
  title,
  autoplayLoop = false,
  className,
}: {
  playbackId: string;
  title: string;
  autoplayLoop?: boolean;
  className?: string;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const loop = autoplayLoop && !reduced;

  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      title={title}
      className={className}
      poster={`https://image.mux.com/${playbackId}/thumbnail.webp?time=1`}
      loading="viewport"
      accentColor="var(--accent)"
      {...(loop
        ? {
            autoPlay: "muted" as const,
            loop: true,
            muted: true,
            playsInline: true,
            style: { ["--controls" as string]: "none" },
          }
        : {})}
    />
  );
}
