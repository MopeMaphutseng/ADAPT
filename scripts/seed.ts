import { PrismaClient, RoleName, ProjectStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/password";
import { getDefaultContent } from "../src/lib/settings";
import { SEED_PROJECTS } from "../src/lib/constants";

const prisma = new PrismaClient();

const ROLES: { name: RoleName; description: string; permissions: string[] }[] = [
  {
    name: "SUPER_ADMIN",
    description: "Full access to every area of the ADAPT management platform.",
    permissions: ["*"],
  },
  {
    name: "CONTENT_ADMIN",
    description: "Manages achievements, projects, announcements and media.",
    permissions: ["dashboard.view", "content.manage", "media.manage"],
  },
  {
    name: "COMMS_ADMIN",
    description: "Manages messages and investor inquiries.",
    permissions: ["dashboard.view", "comms.manage"],
  },
];

async function main() {
  console.log("Seeding ADAPT Technologies database…");

  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: role,
      update: { description: role.description, permissions: role.permissions },
    });
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase() ?? "pulamaliboho@gmail.com";
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass || pass.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be set in the environment (min 12 characters). " +
        "Set it in .env before running db:seed — see .env.example.",
    );
  }
  const name = process.env.ADMIN_NAME ?? "Mope Samuel Maphutseng";
  const superRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash: await hashPassword(pass),
      roleId: superRole.id,
    },
    update: {
      name,
      active: true,
    },
  });
  console.log(`Admin ready: ${email}`);

  const content = getDefaultContent();
  for (const [key, value] of Object.entries(content)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: value as object },
      update: { value: value as object },
    });
  }
  console.log("Site content defaults installed.");

  for (const p of SEED_PROJECTS) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        status: p.status as ProjectStatus,
        published: true,
        publishedAt: new Date(),
      },
      update: {
        title: p.title,
        summary: p.summary,
        description: p.description,
        status: p.status as ProjectStatus,
        category: p.category,
        technologies: p.technologies,
        externalUrl: p.externalUrl,
        featured: p.featured,
      },
    });
  }
  console.log(`Seed projects ready (${SEED_PROJECTS.length}).`);

  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    achievements: await prisma.achievement.count(),
    messages: await prisma.contactMessage.count(),
    investors: await prisma.investorInquiry.count(),
    settings: await prisma.siteSetting.count(),
  };
  console.log("Done.", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });