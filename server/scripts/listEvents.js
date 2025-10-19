const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({ include: { tickets: true }});
  console.log(JSON.stringify(events, null, 2));
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
