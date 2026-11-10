import "dotenv/config";
import { AchievementCategory } from "@prisma/client";
import { prisma } from "../src/lib/db";


const ACHIEVEMENTS = [
  {
    slug: "electronics-showcase",
    title: "Electronics Showcase",
    description: "Demonstration of electronics prototyping work.",
    content: "Demonstration of electronics prototyping work.",
    category: AchievementCategory.MILESTONE,
    occurredOn: new Date("2024-01-15T00:00:00.000Z"),
    videoUrl: "/media/electronics0.mp4",
  },
  {
    slug: "projects-overview",
    title: "Projects Overview",
    description: "Compilation of projects built over the years.",
    content: "Compilation of projects built over the years.",
    category: AchievementCategory.MILESTONE,
    occurredOn: new Date("2024-06-01T00:00:00.000Z"),
    videoUrl: "/media/projects-over-the-years.mp4",
  },
  {
    slug: "uno-development",
    title: "UNO Development",
    description: "Development showcase featuring UNO-based builds.",
    content: "Development showcase featuring UNO-based builds.",
    category: AchievementCategory.MILESTONE,
    occurredOn: new Date("2024-09-01T00:00:00.000Z"),
    videoUrl: "/media/uno2.mp4",
  },
];

async function main() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      create: {
        slug: a.slug,
        title: a.title,
        description: a.description,
        content: a.content,
        category: a.category,
        occurredOn: a.occurredOn,
        videoUrl: a.videoUrl,
        featured: false,
        published: true,
        publishedAt: null,
        order: 0,
      },
      update: {
        title: a.title,
        description: a.description,
        content: a.content,
        category: a.category,
        occurredOn: a.occurredOn,
        videoUrl: a.videoUrl,
        published: true,
      },
    });
    console.log(`Achievement ready: ${a.slug} -> ${a.videoUrl}`);
  }
  const count = await prisma.achievement.count();
  console.log(`Done. Total achievements: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
