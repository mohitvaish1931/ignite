import { db } from "@project-organizer/sdk";

async function main() {
  const roles = await db.role.findMany({ include: { organization: true } });
  console.log("Roles in DB:", roles);
}

main().catch(console.error);
