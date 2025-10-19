const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password', 10);

  // upsert organizer
  const organizer = await prisma.user.upsert({
    where: { email: 'org@example.com' },
    update: { name: 'Organizer', password: hashed, role: 'ORGANIZER' },
    create: { name: 'Organizer', email: 'org@example.com', password: hashed, role: 'ORGANIZER' }
  });

  // upsert regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { name: 'Regular User', password: hashed },
    create: { name: 'Regular User', email: 'user@example.com', password: hashed, role: 'USER' }
  });

  // upsert event (if missing) and ensure ticket tiers exist
  const eventTitle = 'Community Music Night';
  let event = await prisma.event.findFirst({ where: { title: eventTitle } });

  if (!event) {
    event = await prisma.event.create({
      data: {
        title: eventTitle,
        description: 'Local bands perform live.',
        location: 'Community Hall',
        category: 'Music',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
        organizerId: organizer.id,
        tickets: {
          create: [
            { tierName: 'General', priceCents: 5000, quantity: 100 },
            { tierName: 'VIP', priceCents: 15000, quantity: 20 }
          ]
        }
      },
      include: { tickets: true }
    });
    console.log('Created event and tickets:', event.id);
  } else {
    // ensure tickets exist for the event (create missing tiers)
    const existing = await prisma.ticket.findMany({ where: { eventId: event.id }});
    const existingTiers = existing.map(t => t.tierName);
    const toCreate = [];
    if (!existingTiers.includes('General')) toCreate.push({ tierName: 'General', priceCents: 5000, quantity: 100 });
    if (!existingTiers.includes('VIP')) toCreate.push({ tierName: 'VIP', priceCents: 15000, quantity: 20 });
    if (toCreate.length) {
      await prisma.ticket.createMany({
        data: toCreate.map(t => ({ ...t, eventId: event.id }))
      });
      console.log('Added missing ticket tiers for event:', event.id);
    } else {
      console.log('Event already has ticket tiers.');
    }
  }

  console.log('Seed complete');
}

main()
  .catch(e => { console.error('Seed error', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
