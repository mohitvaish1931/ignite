import { redirect } from "next/navigation";

// Everyone signs in on the main site; staff are handed back here by /api/auth/handoff
const WEB_URL = (process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { signedout } = await searchParams;
  redirect(`${WEB_URL}/login${signedout ? "?error=signedout" : ""}`);
}
