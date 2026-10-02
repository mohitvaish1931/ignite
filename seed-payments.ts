import { db } from '@project-organizer/sdk';
const prisma = db;

async function main() {
  console.log('Seeding mock payments...');

  // Find an organization and user
  const org = await prisma.organization.findFirst();
  const user = await prisma.user.findFirst();
  const event = await prisma.event.findFirst();

  if (!org || !user) {
    console.error('Cannot seed payments: Missing organization or user.');
    return;
  }

  const payments = [
    {
      organizationId: org.id,
      userId: user.id,
      eventId: event?.id,
      amount: 150.0,
      currency: "USD",
      status: "COMPLETED",
      provider: "STRIPE",
      providerTransactionId: "pi_3M" + Math.random().toString(36).substring(7),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      organizationId: org.id,
      userId: user.id,
      eventId: event?.id,
      amount: 299.99,
      currency: "USD",
      status: "COMPLETED",
      provider: "STRIPE",
      providerTransactionId: "pi_3M" + Math.random().toString(36).substring(7),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
      organizationId: org.id,
      userId: user.id,
      eventId: event?.id,
      amount: 50.0,
      currency: "USD",
      status: "REFUNDED",
      provider: "STRIPE",
      providerTransactionId: "pi_3M" + Math.random().toString(36).substring(7),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
    },
    {
      organizationId: org.id,
      userId: user.id,
      eventId: event?.id,
      amount: 450.0,
      currency: "USD",
      status: "FAILED",
      provider: "STRIPE",
      providerTransactionId: "pi_3M" + Math.random().toString(36).substring(7),
      createdAt: new Date()
    }
  ];

  for (const p of payments) {
    // @ts-ignore
    await prisma.payment.create({ data: p });
  }

  console.log('Successfully seeded mock payments!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
