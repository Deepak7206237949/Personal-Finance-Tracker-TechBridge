const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middlewares/auth');
const { getOrSet } = require('../utils/cache');

// Monthly spending overview, income vs expense trend
router.get('/monthly', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `analytics:user:${userId}:monthly`;
    const data = await getOrSet(cacheKey, 15*60, async () => {
      // last 12 months
      const now = new Date();
      const yearAgo = new Date(now.getFullYear(), now.getMonth()-11, 1);
      const txs = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: yearAgo }
        },
        orderBy: { date: 'asc' }
      });

      // group by month
      const months = {};
      for (let i=0;i<12;i++) {
        const d = new Date(now.getFullYear(), now.getMonth()-11 + i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()+1}`;
        months[key] = { income: 0, expense: 0 };
      }

      txs.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()+1}`;
        if (!months[key]) months[key] = { income: 0, expense: 0 };
        if (t.type === 'INCOME') months[key].income += t.amount;
        else months[key].expense += t.amount;
      });

      // convert to arrays
      const labels = Object.keys(months);
      const incomes = labels.map(l => months[l].income);
      const expenses = labels.map(l => months[l].expense);
      return { labels, incomes, expenses };
    });

    res.json(data);
  } catch (err) { next(err); }
});

router.get('/category', auth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cacheKey = `analytics:user:${userId}:category`;
    const data = await getOrSet(cacheKey, 15*60, async () => {
      const txs = await prisma.transaction.findMany({
        where: { userId },
        include: { category: true }
      });
      const map = {};
      txs.forEach(t => {
        const name = (t.category && t.category.name) ? t.category.name : 'Uncategorized';
        map[name] = (map[name] || 0) + (t.type === 'EXPENSE' ? t.amount : 0);
      });
      return { labels: Object.keys(map), values: Object.values(map) };
    });
    res.json(data);
  } catch (err) { next(err); }
});

module.exports = router;
