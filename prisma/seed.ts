import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultPermissions = [
  'organization.create', 'organization.read', 'organization.update', 'organization.delete',
  'user.create', 'user.read', 'user.update', 'user.delete',
  'role.create', 'role.read', 'role.update', 'role.delete',
  'event.create', 'event.read', 'event.update', 'event.delete', 'event.publish',
  'qr.scan', 'qr.generate', 'attendance.mark',
  'payment.manage', 'certificate.issue',
];

async function main() {
  console.log('Starting DB Seed with complete dynamic data...');

  // Optional: clear database first if you have overlapping unique constraints,
  // but usually users run `npx prisma db push --force-reset` or `npx prisma migrate reset`

  // 1. Seed Permissions
  console.log('Seeding Permissions...');
  const createdPermissions = [];
  for (const action of defaultPermissions) {
    const perm = await prisma.permission.upsert({
      where: { action },
      update: {},
      create: { action, description: `Allows ${action}` },
    });
    createdPermissions.push(perm);
  }

  // 2. Generate Organizations
  console.log('Seeding Organizations...');
  const organizations = [];
  for (let i = 0; i < 3; i++) {
    const name = faker.company.name();
    const org = await prisma.organization.create({
      data: {
        name,
        slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(6),
        plan: faker.helpers.arrayElement(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
        logoUrl: faker.image.urlLoremFlickr({ category: 'business' })
      }
    });
    organizations.push(org);
  }
  const systemOrg = organizations[0];

  // 3. Create Roles
  console.log('Seeding Roles...');
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'Super Admin',
      description: 'Has all permissions in the system',
      isSystem: true,
      organizationId: systemOrg.id,
    },
  });

  const memberRole = await prisma.role.create({
    data: {
      name: 'Member',
      description: 'Basic member access',
      isSystem: false,
      organizationId: systemOrg.id,
    },
  });

  for (const perm of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 4. Create Users
  console.log('Seeding Users...');
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const users = [];

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash,
      organizationId: systemOrg.id,
    },
  });
  users.push(adminUser);

  await prisma.userRole.create({
    data: { userId: adminUser.id, roleId: superAdminRole.id },
  });

  for (let i = 0; i < 30; i++) {
    const org = faker.helpers.arrayElement(organizations);
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase().replace('@', `+${i}@`),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        passwordHash,
        organizationId: org.id,
      }
    });
    users.push(user);
    
    await prisma.userRole.create({
      data: { userId: user.id, roleId: memberRole.id },
    });

    await prisma.userProfile.create({
      data: {
        userId: user.id,
        avatarUrl: faker.image.avatar(),
        bio: faker.person.bio(),
      }
    });
  }

  // 5. Generate Event Categories and Venues per Org
  console.log('Seeding Event Categories and Venues...');
  const categories = [];
  const venues = [];
  
  for (const org of organizations) {
    for (let i = 0; i < 3; i++) {
      const catName = faker.commerce.department() + ' Events';
      const cat = await prisma.eventCategory.create({
        data: {
          organizationId: org.id,
          name: catName,
          slug: faker.helpers.slugify(catName).toLowerCase() + '-' + faker.string.alphanumeric(6),
          description: faker.lorem.sentence()
        }
      });
      categories.push(cat);
    }

    for (let i = 0; i < 4; i++) {
      const venue = await prisma.venue.create({
        data: {
          organizationId: org.id,
          name: faker.location.buildingNumber() + ' ' + faker.location.street() + ' Hall',
          building: faker.location.secondaryAddress(),
          floor: String(faker.number.int({ min: 1, max: 10 })),
          capacity: faker.number.int({ min: 50, max: 1000 }),
        }
      });
      venues.push(venue);
    }
  }

  // 6. Create Events
  console.log('Seeding Events...');
  const events = [];
  for (let i = 0; i < 15; i++) {
    const org = faker.helpers.arrayElement(organizations);
    const category = faker.helpers.arrayElement(categories.filter(c => c.organizationId === org.id));
    if (!category) continue;

    const eventName = faker.company.catchPhrase();
    const startDate = faker.date.future();
    const endDate = new Date(startDate.getTime() + faker.number.int({min: 1, max: 72}) * 3600000); // 1-72 hours later

    const event = await prisma.event.create({
      data: {
        organizationId: org.id,
        categoryId: category.id,
        name: eventName,
        slug: faker.helpers.slugify(eventName).toLowerCase() + '-' + faker.string.alphanumeric(6),
        summary: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(3),
        state: faker.helpers.arrayElement(['DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'LIVE', 'COMPLETED']),
        visibility: 'PUBLIC',
        capacity: faker.number.int({ min: 50, max: 2000 }),
        startAt: startDate,
        endAt: endDate,
        registrationStartAt: faker.date.recent(),
        registrationEndAt: startDate,
      }
    });
    events.push(event);

    await prisma.eventSetting.create({
      data: {
        eventId: event.id,
        allowTeams: faker.datatype.boolean(),
        allowPayments: faker.datatype.boolean(),
        allowCertificates: faker.datatype.boolean(),
        allowQRCode: true,
      }
    });

    // Event Registrations
    const eventUsers = faker.helpers.arrayElements(users, faker.number.int({ min: 5, max: 15 }));
    for (const u of eventUsers) {
      if (u.organizationId !== org.id) continue;
      
      const isCheckedIn = faker.datatype.boolean();
      await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          userId: u.id,
          status: isCheckedIn ? 'CHECKED_IN' : faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED']),
          checkedIn: isCheckedIn,
          checkedInAt: isCheckedIn ? faker.date.between({from: startDate, to: endDate}) : null,
        }
      });
    }

    // Hackathon Tracks (50% chance)
    if (faker.datatype.boolean()) {
      for (let j = 0; j < faker.number.int({min: 1, max: 3}); j++) {
        const track = await prisma.hackathonTrack.create({
          data: {
            eventId: event.id,
            name: faker.commerce.productName() + ' Track',
            description: faker.lorem.sentence(),
            minTeamSize: 1,
            maxTeamSize: 4,
          }
        });

        // Teams per track
        for (let k = 0; k < faker.number.int({min: 1, max: 5}); k++) {
          const team = await prisma.team.create({
            data: {
              eventId: event.id,
              trackId: track.id,
              name: faker.science.chemicalElement().name + ' ' + faker.number.int(1000),
              status: faker.helpers.arrayElement(['DRAFT', 'RECRUITING', 'READY', 'SUBMITTED']),
            }
          });

          // Add members
          const members = faker.helpers.arrayElements(users.filter(u => u.organizationId === org.id), faker.number.int({min: 1, max: 4}));
          for (const m of members) {
             await prisma.teamMember.create({
                data: {
                   teamId: team.id,
                   userId: m.id,
                   role: faker.helpers.arrayElement(['LEADER', 'MEMBER'])
                }
             })
          }

          if (team.status === 'SUBMITTED') {
             await prisma.submission.create({
               data: {
                 teamId: team.id,
                 status: 'SUBMITTED',
               }
             });
          }
        }
      }
    }
  }

  console.log('✅ Dynamic Data Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
