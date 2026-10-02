import type { Metadata } from "next";
import { db } from "@project-organizer/sdk";

// Gives each event page its own title and share preview
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    // Pages open by id or by slug (rulebooks link to /events/<slug>)
    const event = await db.event.findFirst({
      where: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? { id } : { slug: id, isDeleted: false },
      select: { name: true, summary: true, description: true, imageUrl: true, isDeleted: true },
    });
    if (!event || event.isDeleted) return { title: { absolute: "Event not found | IEEE IGNITE '26" } };

    const description = (event.summary || event.description || `Register for ${event.name} at IEEE IGNITE '26.`).slice(0, 160);
    return {
      title: { absolute: `${event.name} | IEEE IGNITE '26` },
      description,
      openGraph: { title: event.name, description, ...(event.imageUrl ? { images: [event.imageUrl] } : {}) },
    };
  } catch {
    // Invalid id or database hiccup: fall back to the section title
    return { title: { absolute: "Event | IEEE IGNITE '26" } };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
