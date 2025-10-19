const express = require('express');
const prisma = require('../prismaClient');
const auth = require('../middlewares/auth');

const router = express.Router();

// create a booking (user must be logged in)
router.post('/', auth(), async (req, res) => {
  const { eventId, ticketId, quantity } = req.body;
  const qty = Number(quantity || 1);
  if (!ticketId || qty < 1) return res.status(400).json({ error: 'Invalid request' });

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw { status: 400, message: 'Ticket not found' };
      if (ticket.quantity - ticket.sold < qty) throw { status: 400, message: 'Not enough tickets available' };

      const total = ticket.priceCents * qty;
      const newBooking = await tx.booking.create({
        data: {
          userId: req.user.id,
          eventId,
          ticketId,
          quantity: qty,
          totalCents: total,
          status: 'CONFIRMED'
        }
      });

      await tx.ticket.update({
        where: { id: ticketId },
        data: { sold: { increment: qty } }
      });

      return newBooking;
    });

    return res.json(booking);
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error('Booking error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// user bookings
router.get('/', auth(), async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user.id },
    include: { event: true, ticket: true }
  });
  res.json(bookings);
});

module.exports = router;
