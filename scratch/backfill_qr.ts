import { db } from "@project-organizer/sdk";

async function main() {
  const registrations = await db.eventRegistration.findMany();

  for (const reg of registrations) {
    const existingQr = await db.qRCode.findFirst({
      where: { referenceId: reg.id, type: "REGISTRATION" }
    });
    
    if (!existingQr) {
      console.log(`Adding QR code for registration ${reg.id}`);
      await db.qRCode.create({
        data: {
          type: "REGISTRATION",
          referenceId: reg.id,
          token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          usagePolicy: "MULTIPLE",
          usageLimit: 10
        }
      });
    }
  }
  console.log("Done");
}

main().catch(console.error);
