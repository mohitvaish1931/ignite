import Image from "next/image";

/** The SKIT Jaipur crest, linking to the institute's website. */
export function SkitLogo({ className = "h-9 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <a
      href="https://www.skit.ac.in/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="SKIT Jaipur (opens in a new tab)"
      className="shrink-0 transition-opacity hover:opacity-80"
    >
      <Image src="/skit-logo.png" alt="SKIT Jaipur" width={42} height={44} priority={priority} className={className} />
    </a>
  );
}
