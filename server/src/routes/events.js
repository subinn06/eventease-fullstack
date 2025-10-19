const express = require('express');
const prisma = require('../prismaClient');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middlewares/auth');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  }
});

// Helper to build absolute file URL
function buildFileUrl(req, filename) {
  if (!filename) return null;
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${encodeURIComponent(filename)}`;
}

// Create event - Organizer only
router.post('/', auth('ORGANIZER'), upload.single('image'), async (req, res) => {
  try {
    const { title, description, location, category, startDate, endDate, capacity } = req.body;
    if (!title || !startDate)
      return res.status(400).json({ error: 'Missing required fields: title and startDate' });

    const start = new Date(startDate);
    if (isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid startDate format' });

    let end = null;
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) return res.status(400).json({ error: 'Invalid endDate format' });
    }

    const imageUrl = req.file ? buildFileUrl(req, req.file.filename) : null;

    // sanitize description
    const safeDescription = description
      ? sanitizeHtml(description, {
          allowedTags: ['b', 'i', 'em', 'strong', 'p', 'ul', 'ol', 'li', 'br'],
          allowedAttributes: {}
        })
      : '';

    // create event first
    const event = await prisma.event.create({
      data: {
        title,
        description: safeDescription,
        location: location || '',
        category: category || '',
        startDate: start,
        endDate: end,
        imageUrl,
        capacity: capacity ? parseInt(capacity, 10) : null,
        organizerId: req.user.id
      }
    });

    let createdEvent = event;

    // Parse and create tickets (if provided)
    if (req.body && req.body.tickets) {
      try {
        const tickets = JSON.parse(req.body.tickets);
        const ticketData = tickets
          .map(t => ({
            eventId: event.id,
            tierName: String(t.tierName || ''),
            priceCents: Number(t.priceCents || 0),
            quantity: Number(t.quantity || 0),
            sold: 0
          }))
          .filter(t => t.tierName && t.quantity > 0 && t.priceCents >= 0);

        if (ticketData.length) {
          await prisma.ticket.createMany({ data: ticketData });
          createdEvent = await prisma.event.findUnique({
            where: { id: event.id },
            include: {
              organizer: { select: { id: true, name: true, email: true } },
              tickets: true
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse/create tickets payload', e);
      }
    } else {
      // no tickets sent - return event with empty tickets array
      createdEvent = await prisma.event.findUnique({
        where: { id: event.id },
        include: { organizer: { select: { id: true, name: true, email: true } }, tickets: true }
      });
    }

    return res.json(createdEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    if (err instanceof multer.MulterError || err.message === 'Only image uploads are allowed') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Server error while creating event' });
  }
});

// Delete event (Organizer or Admin)
router.delete('/:id', auth(), async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'ADMIN' && req.user.id !== event.organizerId) {
      return res.status(403).json({ error: 'Forbidden: not allowed to delete this event' });
    }

    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { eventId: id } }),
      prisma.ticket.deleteMany({ where: { eventId: id } }),
      prisma.event.delete({ where: { id } })
    ]);

    // remove uploaded image if exists
    if (event.imageUrl && event.imageUrl.includes('/uploads/')) {
      try {
        const prev = path.basename(event.imageUrl);
        const prevPath = path.join(uploadsDir, prev);
        if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
      } catch (e) {
        // ignore delete errors
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting event:', err);
    return res.status(500).json({ error: 'Server error while deleting event' });
  }
});

// Get all events (with tickets)
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(5, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {};

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
        include: { organizer: { select: { id: true, name: true } }, tickets: true }
      })
    ]);

    return res.json({ events, page, limit, total });
  } catch (err) {
    console.error('Error listing events:', err);
    return res.status(500).json({ error: 'Server error while listing events' });
  }
});

// Get single event (with tickets)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { organizer: { select: { id: true, name: true, email: true } }, tickets: true }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    return res.status(500).json({ error: 'Server error while fetching event' });
  }
});

module.exports = router;
