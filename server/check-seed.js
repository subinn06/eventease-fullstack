// server/check-seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.event.count();       // change model name if not `event`
    const items = await prisma.event.findMany({ take: 5 });
    console.log('OK — DB connected. count:', count);
    console.log('sample:', items);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
