const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.registration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123', 10);

  // Create users - PLAYERS
  const players = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alexis.dupont@example.com',
        username: 'AlexisPro',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'marie.martin@example.com',
        username: 'MarieMartian',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lucas.bernard@example.com',
        username: 'LucasBlaze',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sophie.rouge@example.com',
        username: 'SophieRed',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'thomas.noir@example.com',
        username: 'ThomasNoir',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma.gold@example.com',
        username: 'EmmaGold',
        password: hashedPassword,
        role: 'PLAYER',
      },
    }),
  ]);

  // Create users - ORGANIZERS
  const organizers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin.cs@example.com',
        username: 'CSMaster',
        password: hashedPassword,
        role: 'ORGANIZER',
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin.valorant@example.com',
        username: 'ValorantPro',
        password: hashedPassword,
        role: 'ORGANIZER',
      },
    }),
  ]);

  // Create ADMIN
  const admin = await prisma.user.create({
    data: {
      email: 'admin@esport.com',
      username: 'AdminSupreme',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Phoenix Gaming',
        tag: 'PHXG',
        captainId: players[0].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Dragon Squad',
        tag: 'DRAG',
        captainId: players[1].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Titan Force',
        tag: 'TITAN',
        captainId: players[2].id,
      },
    }),
    prisma.team.create({
      data: {
        name: 'Shadow Legends',
        tag: 'SHDW',
        captainId: players[3].id,
      },
    }),
  ]);

  // Create tournaments
  const tournaments = await Promise.all([
    // OPEN tournament
    prisma.tournament.create({
      data: {
        name: 'CS:GO Grand Championship 2026',
        game: 'Counter-Strike 2',
        format: 'SOLO',
        maxParticipants: 64,
        prizePool: 50000,
        startDate: new Date('2026-02-15T10:00:00Z'),
        endDate: new Date('2026-02-28T18:00:00Z'),
        status: 'OPEN',
        organizerId: organizers[0].id,
      },
    }),
    // DRAFT tournament
    prisma.tournament.create({
      data: {
        name: 'Valorant Champions League',
        game: 'Valorant',
        format: 'TEAM',
        maxParticipants: 32,
        prizePool: 100000,
        startDate: new Date('2026-03-15T10:00:00Z'),
        endDate: new Date('2026-03-31T18:00:00Z'),
        status: 'DRAFT',
        organizerId: organizers[1].id,
      },
    }),
    // ONGOING tournament
    prisma.tournament.create({
      data: {
        name: 'Dota 2 International Qualifiers',
        game: 'Dota 2',
        format: 'TEAM',
        maxParticipants: 16,
        prizePool: 150000,
        startDate: new Date('2026-01-10T10:00:00Z'),
        endDate: new Date('2026-02-10T18:00:00Z'),
        status: 'ONGOING',
        organizerId: organizers[0].id,
      },
    }),
    // COMPLETED tournament
    prisma.tournament.create({
      data: {
        name: 'League of Legends Spring Split',
        game: 'League of Legends',
        format: 'TEAM',
        maxParticipants: 10,
        prizePool: 75000,
        startDate: new Date('2025-12-01T10:00:00Z'),
        endDate: new Date('2025-12-20T18:00:00Z'),
        status: 'COMPLETED',
        organizerId: organizers[1].id,
      },
    }),
  ]);

  // Create registrations
  await Promise.all([
    // Solo tournament registrations
    prisma.registration.create({
      data: {
        tournamentId: tournaments[0].id,
        playerId: players[0].id,
        status: 'CONFIRMED',
      },
    }),
    prisma.registration.create({
      data: {
        tournamentId: tournaments[0].id,
        playerId: players[1].id,
        status: 'CONFIRMED',
      },
    }),
    prisma.registration.create({
      data: {
        tournamentId: tournaments[0].id,
        playerId: players[2].id,
        status: 'PENDING',
      },
    }),
    prisma.registration.create({
      data: {
        tournamentId: tournaments[0].id,
        playerId: players[3].id,
        status: 'REJECTED',
      },
    }),
    // Team tournament registrations
    prisma.registration.create({
      data: {
        tournamentId: tournaments[1].id,
        teamId: teams[0].id,
        status: 'PENDING',
      },
    }),
    prisma.registration.create({
      data: {
        tournamentId: tournaments[1].id,
        teamId: teams[1].id,
        status: 'PENDING',
      },
    }),
    // Dota tournament registrations
    prisma.registration.create({
      data: {
        tournamentId: tournaments[2].id,
        teamId: teams[2].id,
        status: 'CONFIRMED',
      },
    }),
    prisma.registration.create({
      data: {
        tournamentId: tournaments[2].id,
        teamId: teams[3].id,
        status: 'CONFIRMED',
      },
    }),
    // Completed tournament registrations
    prisma.registration.create({
      data: {
        tournamentId: tournaments[3].id,
        teamId: teams[0].id,
        status: 'CONFIRMED',
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log(`   Players: ${players.length}`);
  console.log(`   Organizers: ${organizers.length}`);
  console.log(`   Admin: 1`);
  console.log(`   Teams: ${teams.length}`);
  console.log(`   Tournaments: ${tournaments.length}`);
  console.log(`   Registrations: 9\n`);
  console.log('🔑 Test Credentials:');
  console.log('   Email: alexis.dupont@example.com | Password: Password123');
  console.log('   Email: admin.cs@example.com | Password: Password123');
  console.log('   Email: admin@esport.com | Password: Password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
