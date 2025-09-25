const prisma = require('../prismaClient');
const cache = require('../utils/cache');

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 10, 
      type, 
      categoryId, 
      startDate, 
      endDate,
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      }),
      ...(search && {
        note: {
          contains: search,
          mode: 'insensitive'
        }
      })
    };

    // Check cache
    const cacheKey = `transactions:${userId}:${JSON.stringify({ page, limit, type, categoryId, startDate, endDate, search })}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      prisma.transaction.count({ where })
    ]);

    const result = {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, result, 300);

    res.json(result);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: { id: id, userId },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, note, type, date, categoryId } = req.body;
    const userId = req.user.id;

    // Verify category exists (categories are global now)
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        note,
        type,
        date: new Date(date),
        userId,
        categoryId: categoryId || null,
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    // Clear cache
    await cache.del(`transactions:${userId}:*`);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, type, date, categoryId } = req.body;
    const userId = req.user.id;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // If categoryId is provided, verify it belongs to user
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    // Clear cache
    await cache.del(`transactions:${userId}:*`);

    res.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    // Clear cache
    await cache.del(`transactions:${userId}:*`);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
