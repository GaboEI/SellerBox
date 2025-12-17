const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(c => console.log('users:', c)).finally(() => p.$disconnect());