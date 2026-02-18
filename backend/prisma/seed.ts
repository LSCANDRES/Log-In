import { PrismaClient, Role, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@authbase.com' },
    update: {},
    create: {
      email: 'admin@authbase.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      provider: AuthProvider.LOCAL,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create regular User
  const userPassword = await bcrypt.hash('User123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@authbase.com' },
    update: {},
    create: {
      email: 'user@authbase.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      provider: AuthProvider.LOCAL,
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log(`✅ User created: ${user.email}`);

  console.log('🌱 Seeding completed!');
  console.log('');
  console.log('📋 Test credentials:');
  console.log('   Admin: admin@authbase.com / Admin123!');
  console.log('   User:  user@authbase.com / User123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
