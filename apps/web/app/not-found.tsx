import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="ignite-pixel-dates mb-6 text-orange-400">ERROR // 404</p>
      <h1 className="ignite-title mb-4 text-4xl md:text-6xl">
        Lost in <span className="text-orange-500">Orbit</span>
      </h1>
      <p className="mb-10 max-w-md text-slate-400">
        The page you&apos;re looking for drifted out of range. It may have moved or never existed.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black">
          RETURN HOME
        </Link>
        <Link href="/events" className="ignite-btn-secondary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-neutral-200">
          BROWSE EVENTS
        </Link>
      </div>
    </div>
  );
}
