import type { Metadata } from "next";
import { EVENTS, findEvent, photoUrl } from "../../../lib/events";

// Events come from lib/events.ts while the database is switched off (the database version of
// this layout is in _backend/app/events/[id]/layout.tsx). Every event page is built ahead of time;
// old /events/<uuid> links still render on demand.
export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.slug }));
}

// Gives each event page its own title and share preview
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const event = findEvent(decodeURIComponent((await params).id));
  if (!event) return { title: { absolute: "Event not found | IEEE IGNITE '26" } };

  const description = (event.summary || event.description || `${event.name} at IEEE IGNITE '26.`).slice(0, 160);
  return {
    title: { absolute: `${event.name} | IEEE IGNITE '26` },
    description,
    // Share previews (WhatsApp, LinkedIn...) use the event's banner photo at the standard 1200x630
    openGraph: { title: event.name, description, images: [{ url: photoUrl(event.images.banner, 1200, 630), width: 1200, height: 630 }] },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
