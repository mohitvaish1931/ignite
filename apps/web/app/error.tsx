"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="ignite-pixel-dates mb-6 text-orange-400">SYSTEM // FAULT</p>
      <h1 className="ignite-title mb-4 text-3xl md:text-5xl">
        Something <span className="text-orange-500">Misfired</span>
      </h1>
      <p className="mb-10 max-w-md text-slate-400">
        An unexpected error interrupted this page. Try again, and if it keeps happening, head back home.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={() => unstable_retry()} className="ignite-btn-primary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-black">
          TRY AGAIN
        </button>
        <Link href="/" className="ignite-btn-secondary rounded-sm px-8 py-3 font-orbitron text-sm font-bold tracking-wider text-neutral-200">
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
