import { config } from "dotenv";
import {hash,} from "bcryptjs";



import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";
import { CourtType, UserRole } from "../generated/prisma/enums";

config({path: ".env.local",});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está configurada en .env.local",
  );
}

const adapter = new PrismaPg({connectionString,});

const prisma = new PrismaClient({adapter,});

function requireSeedEnv(name: string,): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`La variable ${name} es obligatoria para ejecutar el seed.`,);
  }

  return value;
}

const courts = [
  {
    name: "Cancha Fútbol 7 A",
    slug: "futbol-7-a",
    type: CourtType.FOOTBALL,
    capacity: 14,
    pricePerHour: 90,
    description: "Cancha de fútbol 7 con césped sintético e iluminación.",
    imageUrl: null,
    active: true,
  },

  {
    name: "Cancha Fútbol 7 B",
    slug: "futbol-7-b",
    type: CourtType.FOOTBALL,
    capacity: 14,
    pricePerHour: 90,
    description: "Cancha de fútbol 7 para partidos y entrenamientos.",
    imageUrl: null,
    active: true,
  },

  {
    name: "Cancha Pádel 1",
    slug: "padel-1",
    type: CourtType.PADEL,
    capacity: 4,
    pricePerHour: 60,
    description: "Cancha de pádel con iluminación para reservas diurnas y nocturnas.",
    imageUrl: null,
    active: true,
  },

  {
    name: "Cancha Pádel 2",
    slug: "padel-2",
    type: CourtType.PADEL,
    capacity: 4,
    pricePerHour: 60,
    description: "Cancha de pádel para partidos recreativos y entrenamientos.",
    imageUrl: null,
    active: true,
  },

  {
    name: "Cancha Tenis 1",
    slug: "tenis-1",
    type: CourtType.TENNIS,
    capacity: 4,
    pricePerHour: 45,
    description: "Cancha de tenis disponible para partidos individuales y dobles.",
    imageUrl: null,
    active: true,
  },

  {
    name: "Cancha Básquet 1",
    slug: "basquet-1",
    type: CourtType.BASKETBALL,
    capacity: 10,
    pricePerHour: 70,
    description: "Cancha de básquet para partidos, prácticas y entrenamientos.",
    imageUrl: null,
    active: true,
  },
];

async function main() {
  console.log("Iniciando seed de CanchaGo...");

  const adminName = requireSeedEnv("SEED_ADMIN_NAME",);
  const adminEmail = requireSeedEnv("SEED_ADMIN_EMAIL",).toLowerCase();
  const adminPassword = requireSeedEnv("SEED_ADMIN_PASSWORD",);
  const userName = requireSeedEnv("SEED_USER_NAME",);
  const userEmail = requireSeedEnv("SEED_USER_EMAIL",).toLowerCase();
  const userPassword = requireSeedEnv("SEED_USER_PASSWORD",);
  const adminPasswordHash = await hash(adminPassword,12,);
  const userPasswordHash = await hash(userPassword,12,);

  await prisma.user.upsert({
    where: {email: adminEmail,},

    update: {
      name: adminName,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },

    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {email: userEmail,},

    update: {
      name:userName,
      passwordHash:userPasswordHash,
      role:UserRole.USER,
    },

    create: {name:userName,
      email:userEmail,
      passwordHash:userPasswordHash,
      role:UserRole.USER,
    },
  });

  console.log("Usuarios iniciales creados o actualizados.",);

  for (const court of courts) {
    await prisma.court.upsert({
      where: {slug: court.slug,},
      update: court,
      create: court,
    });
  }

  console.log(`${courts.length} canchas creadas o actualizadas.`);
  console.log("Seed completado correctamente.");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });