import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Create Roles ---
  const roles = ['personal','merchant','admin', 'user'];
  const roleRecords: { id: number; name: string; description: string | null }[] = [];

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    });
    roleRecords.push(role);
  }

  console.log('Roles created:', roleRecords.map(r => r.name));

  // --- Create Permission ---
  const permission = await prisma.permission.upsert({
    where: { action_resource: { action: 'read', resource: 'dashboard' } }, // composite unique
    update: {},
    create: {
      action: 'read',
      resource: 'dashboard',
      description: 'Allows reading dashboard',
    },
  });

  console.log('Permission created:', permission.action, permission.resource);

  // --- Link Roles to Permission ---
  for (const role of roleRecords) {
    const existing = await prisma.rolePermission.findUnique({
      where: {
        id: -1, // placeholder because Prisma can't use composite in upsert
      },
      // we will handle manually
    }).catch(() => null);

    const linkExists = await prisma.rolePermission.findFirst({
      where: { roleId: role.id, permissionId: permission.id },
    });

    if (!linkExists) {
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log('Roles linked to permission successfully ✅');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
