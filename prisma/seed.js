import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.registration.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('Password123', 10);

  const player1 = await prisma.user.create({
    data: {
      email: 'player1@example.com',
      username: 'player_one',
      password: hashedPassword,
      role: 'PLAYER',
    },
  });

  const player2 = await prisma.user.create({
    data: {
      email: 'player2@example.com',
      username: 'player_two',
      password: hashedPassword,
      role: 'PLAYER',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@example.com',
      username: 'org_master',
      password: hashedPassword,
      role: 'ORGANIZER',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin_user',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create team
  const team = await prisma.team.create({
    data: {
      name: 'Phoenix Gaming',
      tag: 'PHXGM',
      captainId: player1.id,
    },
  });

  // Add member to team
  await prisma.user.update({
    where: { id: player2.id },
    data: { teamId: team.id },
  });

  // Create tournaments
  const soloTournament = await prisma.tournament.create({
    data: {
      name: 'CS:GO Solo Championship 2026',
      game: 'Counter-Strike 2',
      format: 'SOLO',
      maxParticipants: 64,
      prizePool: 50000,
      startDate: new Date('2026-02-01T10:00:00Z'),
      endDate: new Date('2026-02-15T18:00:00Z'),
      status: 'DRAFT',
      organizerId: organizer.id,
    },
  });

  const teamTournament = await prisma.tournament.create({
    data: {
      name: 'Valorant Team League',
      game: 'Valorant',
      format: 'TEAM',
      maxParticipants: 32,
      prizePool: 100000,
      startDate: new Date('2026-03-01T10:00:00Z'),
      endDate: new Date('2026-03-30T18:00:00Z'),
      status: 'DRAFT',
      organizerId: organizer.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('Users:', { player1: player1.username, player2: player2.username, organizer: organizer.username, admin: admin.username });
  console.log('Team:', team.name);
  console.log('Tournaments:', { soloTournament: soloTournament.name, teamTournament: teamTournament.name });
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
