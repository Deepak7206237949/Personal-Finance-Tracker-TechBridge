const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
// const { getOrSet, delKeys } = require('../utils/cache'); // Disabled due to Redis connection issues
const { body, validationResult } = require('express-validator');

router.get('/', auth, async (req, res, next) => {
  try {
    // Get categories with transaction amounts
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        transactions: {
          where: {
            type: 'EXPENSE' // Only count expense transactions
          },
          select: {
            amount: true
          }
        }
      }
    });

    // Calculate total amount for each category
    const categoriesWithAmounts = categories.map(category => ({
      id: category.id,
      name: category.name,
      amount: category.amount, // Category's initial/budget amount
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      totalAmount: category.transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      transactionCount: category.transactions.length
    }));

    res.json(categoriesWithAmounts);
  } catch (err) { next(err); }
});

router.post('/', auth, permit('ADMIN'),
  body('name').notEmpty().isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  async (req, res, next) => {
  try {
    const { name, amount } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Check if category already exists (case-insensitive)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    const c = await prisma.category.create({
      data: {
        name: name.trim(),
        amount: parseFloat(amount) || 0
      }
    });
    // Cache invalidation disabled due to Redis connection issues
    // await delKeys('categories:*');
    res.json(c);
  } catch (err) {
    // Handle Prisma unique constraint errors
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    next(err);
  }
});

router.put('/:id', auth, permit('ADMIN'),
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, amount } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check for name conflicts if name is being updated
    if (name && name.trim() !== category.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
    }

    // Update category
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (amount !== undefined) updateData.amount = parseFloat(amount);

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData
    });

    res.json(updatedCategory);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    next(err);
  }
});

router.delete('/:id', auth, permit('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category is being used by any transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. It is being used by ${transactionCount} transaction(s).`
      });
    }

    await prisma.category.delete({ where: { id } });
    // Cache invalidation disabled due to Redis connection issues
    // await delKeys('categories:*');
    res.json({ message: 'Category deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;
