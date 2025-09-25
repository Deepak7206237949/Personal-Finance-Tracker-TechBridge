const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const { delKeys } = require('../utils/cache');
const { body, query, validationResult } = require('express-validator');

// GET /api/transactions?page=1&limit=20&search=&type=EXPENSE&categoryId=1
router.get('/', auth, async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;
    const where = {};

    if (req.query.type) where.type = req.query.type;
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else if (req.query.userId) {
      where.userId = req.query.userId;
    }

    // basic search on note
    if (req.query.search) {
      where.OR = [
        { note: { contains: req.query.search, mode: 'insensitive' } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: { category: true, user: { select: { id: true, email: true, name: true } } }
      })
    ]);

    res.json({ total, page, limit, items });
  } catch (err) { next(err); }
});

// Create
router.post('/', auth, permit('ADMIN', 'USER'), body('amount').isNumeric(), body('type').isIn(['INCOME','EXPENSE']), async (req, res, next) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { amount, type, categoryId, note, date } = req.body;
    const userId = req.user.id;
    const tx = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        note,
        date: date ? new Date(date) : undefined,
        userId
      }
    });

    // invalidate caches for analytics and transactions
    await delKeys(`analytics:user:${userId}:*`);
    await delKeys(`transactions:user:${userId}:*`);

    res.json(tx);
  } catch (err) { next(err); }
});

// Update
router.put('/:id', auth, permit('ADMIN', 'USER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.transaction.findUnique({ where: { id }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // only owner or admin
    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const data = {};
    if (req.body.amount) data.amount = parseFloat(req.body.amount);
    if (req.body.type) data.type = req.body.type;
    if (req.body.categoryId) data.categoryId = parseInt(req.body.categoryId, 10);
    if (req.body.note) data.note = req.body.note;
    if (req.body.date) data.date = new Date(req.body.date);

    const tx = await prisma.transaction.update({ where: { id }, data });

    await delKeys(`analytics:user:${existing.userId}:*`);
    await delKeys(`transactions:user:${existing.userId}:*`);

    res.json(tx);
  } catch (err) { next(err); }
});

// Delete
router.delete('/:id', auth, permit('ADMIN', 'USER'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.transaction.findUnique({ where: { id }});
    if (!existing) return res.status(404).json({ error: 'Not found' });

    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.transaction.delete({ where: { id }});
    await delKeys(`analytics:user:${existing.userId}:*`);
    await delKeys(`transactions:user:${existing.userId}:*`);

    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
