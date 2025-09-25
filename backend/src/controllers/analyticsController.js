const prisma = require('../prismaClient');
const cache = require('../utils/cache');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    const cacheKey = `dashboard:${userId}:${period}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const [
      totalIncome,
      totalExpenses,
      transactionCount,
      categoryStats,
      recentTransactions,
      monthlyTrends
    ] = await Promise.all([
      // Total income
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      // Total expenses
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate }
        },
        _sum: { amount: true }
      }),
      // Transaction count
      prisma.transaction.count({
        where: {
          userId,
          date: { gte: startDate }
        }
      }),
      // Category breakdown
      prisma.transaction.groupBy({
        by: ['categoryId', 'type'],
        where: {
          userId,
          date: { gte: startDate }
        },
        _sum: { amount: true },
        _count: true
      }),
      // Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        include: {
          category: {
            select: { id: true, name: true, color: true }
          }
        },
        orderBy: { date: 'desc' },
        take: 5
      }),
      // Monthly trends (last 6 months)
      getMonthlyTrends(userId)
    ]);

    // Get category details for stats
    const categoryIds = [...new Set(categoryStats.map(stat => stat.categoryId))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    const enrichedCategoryStats = categoryStats.map(stat => ({
      ...stat,
      category: categoryMap[stat.categoryId]
    }));

    const stats = {
      summary: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        transactionCount
      },
      categoryBreakdown: enrichedCategoryStats,
      recentTransactions,
      monthlyTrends,
      period: parseInt(period)
    };

    // Cache for 10 minutes
    await cache.set(cacheKey, stats, 600);

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMonthlyTrends = async (userId) => {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const [income, expenses] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: {
            gte: date,
            lt: nextMonth
          }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: {
            gte: date,
            lt: nextMonth
          }
        },
        _sum: { amount: true }
      })
    ]);

    months.push({
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      income: income._sum.amount || 0,
      expenses: expenses._sum.amount || 0,
      net: (income._sum.amount || 0) - (expenses._sum.amount || 0)
    });
  }

  return months;
};

const getCategoryAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type } = req.query;

    const where = {
      userId,
      ...(type && { type }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const categoryStats = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true }
    });

    // Get category details
    const categoryIds = categoryStats.map(stat => stat.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, color: true }
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});

    const enrichedStats = categoryStats.map(stat => ({
      category: categoryMap[stat.categoryId],
      totalAmount: stat._sum.amount,
      transactionCount: stat._count,
      averageAmount: stat._avg.amount
    }));

    res.json({ categoryAnalytics: enrichedStats });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSpendingTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'monthly', categoryId } = req.query;

    let groupBy, dateFormat;
    switch (period) {
      case 'daily':
        groupBy = 'DATE(date)';
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        groupBy = 'YEARWEEK(date)';
        dateFormat = '%Y-%u';
        break;
      case 'monthly':
      default:
        groupBy = 'DATE_FORMAT(date, "%Y-%m")';
        dateFormat = '%Y-%m';
        break;
    }

    const where = {
      userId,
      ...(categoryId && { categoryId })
    };

    // This would need raw SQL for proper date grouping in production
    // For now, we'll use a simplified approach
    const trends = await getSimplifiedTrends(userId, categoryId, period);

    res.json({ trends });
  } catch (error) {
    console.error('Spending trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSimplifiedTrends = async (userId, categoryId, period) => {
  // Simplified implementation - in production, use raw SQL for better performance
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(categoryId && { categoryId })
    },
    orderBy: { date: 'asc' }
  });

  // Group by period
  const grouped = {};
  transactions.forEach(transaction => {
    let key;
    const date = new Date(transaction.date);
    
    switch (period) {
      case 'daily':
        key = date.toISOString().slice(0, 10);
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'monthly':
      default:
        key = date.toISOString().slice(0, 7);
        break;
    }

    if (!grouped[key]) {
      grouped[key] = { income: 0, expenses: 0, net: 0 };
    }

    if (transaction.type === 'INCOME') {
      grouped[key].income += transaction.amount;
    } else {
      grouped[key].expenses += transaction.amount;
    }
    grouped[key].net = grouped[key].income - grouped[key].expenses;
  });

  return Object.entries(grouped).map(([period, data]) => ({
    period,
    ...data
  }));
};

module.exports = {
  getDashboardStats,
  getCategoryAnalytics,
  getSpendingTrends,
};
