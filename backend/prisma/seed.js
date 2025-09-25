require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // Updated admin credentials and additional demo users
  const passwordAdmin = await bcrypt.hash('SecureAdmin2024!', 10);
  const passwordUser = await bcrypt.hash('UserPass123!', 10);
  const passwordRead = await bcrypt.hash('ReadOnly123', 10);
  const passwordDemo1 = await bcrypt.hash('JohnDemo123!', 10);
  const passwordDemo2 = await bcrypt.hash('ViewerDemo123!', 10);

  // delete previous
  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users with updated admin credentials
  const admin = await prisma.user.create({ data: { email: 'admin@finance.com', password: passwordAdmin, name: 'System Administrator', role: 'ADMIN' }});
  const user = await prisma.user.create({ data: { email: 'user@demo.com', password: passwordUser, name: 'Regular User', role: 'USER' }});
  const readOnly = await prisma.user.create({ data: { email: 'readonly@demo.com', password: passwordRead, name: 'Read Only User', role: 'READ_ONLY' }});

  // Additional demo users for testing signup functionality
  const demoUser1 = await prisma.user.create({ data: { email: 'john@example.com', password: passwordDemo1, name: 'John Doe', role: 'USER' }});
  const demoUser2 = await prisma.user.create({ data: { email: 'viewer@example.com', password: passwordDemo2, name: 'Jane Viewer', role: 'READ_ONLY' }});

  const categories = [
    { name: 'Food', amount: 800 },
    { name: 'Transport', amount: 500 },
    { name: 'Entertainment', amount: 400 },
    { name: 'Salary', amount: 0 }, // Income category, no budget needed
    { name: 'Utilities', amount: 300 },
    { name: 'Shopping', amount: 600 },
    { name: 'Healthcare', amount: 200 }
  ];
  const catRecords = [];
  for (const categoryData of categories) {
    const c = await prisma.category.create({ data: categoryData });
    catRecords.push(c);
  }

  // sample transactions for user (past 6 months)
  const now = new Date();
  for (let i=0;i<50;i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (i % 6), 1 + (i % 20));
    const type = (i % 5 === 0) ? 'INCOME' : 'EXPENSE';
    const amount = type === 'INCOME' ? 2000 + Math.random()*1000 : 10 + Math.random()*200;
    const categoryId = (type === 'INCOME') ? null : catRecords[(i % catRecords.length)].id;
    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount.toFixed(2)),
        type,
        categoryId,
        note: type === 'INCOME' ? 'Salary' : 'Expense item',
        date,
        userId: user.id
      }
    });
  }

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
