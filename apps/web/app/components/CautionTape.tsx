import React from "react";

type TapeSize = "sm" | "md" | "lg";

/**
 * Police-style "do not cross" tape for registration-closed spots: a yellow band with
 * hazard-striped edges and a line of text that scrolls along it (styles: .ignite-tape in
 * globals.css). Decorative only, so every page also says the same thing in plain text.
 */
export function CautionTape({
  text = "REGISTRATION CLOSED",
  size = "md",
  tilt = 0,
  reverse = false,
  className = "",
}: {
  text?: string;
  size?: TapeSize;
  /** Rotation in degrees, so crossed tapes can overlap. */
  tilt?: number;
  /** Scroll the text the other way (for the second of two crossed tapes). */
  reverse?: boolean;
  className?: string;
}) {
  // One run of repeats is wider than any tape; two identical runs loop seamlessly
  const run = Array.from({ length: 10 }, (_, i) => (
    <React.Fragment key={i}>
      <span>{text}</span>
      <span className="ignite-tape-sep">✕</span>
    </React.Fragment>
  ));
  return (
    <div className={`ignite-tape ignite-tape-${size} ${className}`} style={tilt ? { rotate: `${tilt}deg` } : undefined} aria-hidden="true">
      <div className={`ignite-tape-track ${reverse ? "ignite-tape-reverse" : ""}`}>
        <div className="ignite-tape-run">{run}</div>
        <div className="ignite-tape-run">{run}</div>
      </div>
    </div>
  );
}
