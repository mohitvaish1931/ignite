import { HACKATHON_GUIDE } from "../hackathon-rules";
import { EXPERT_TALK_GUIDE } from "./expert-talk";
import { PANEL_DISCUSSION_GUIDE } from "./panel-discussion";
import { ROUND_TABLE_GUIDE } from "./round-table";
import { SYMPOSIUM_GUIDE } from "./symposium";
import type { EventGuide } from "./types";

export type { EventGuide } from "./types";

/** Every event with an official rulebook or programme, keyed by the event's slug (in date order). */
export const GUIDES: EventGuide[] = [SYMPOSIUM_GUIDE, ROUND_TABLE_GUIDE, PANEL_DISCUSSION_GUIDE, HACKATHON_GUIDE, EXPERT_TALK_GUIDE];

/** Whether the event has a rulebook / programme page of its own. */
export const hasDocument = (g: EventGuide) => g.sections.length > 0;

export const guidePath = (slug: string) => `/rulebooks/${slug}`;

export function getGuide(slug: string | null | undefined) {
  return GUIDES.find((g) => g.slug === slug);
}
