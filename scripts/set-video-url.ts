import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const VIDEO_URL =
  process.env.VIDEO_URL ??
  "https://tkdedxeelmepeftp.public.blob.vercel-storage.com/PULA%20MALIBOHO-KM1lkGBd9fqp4hPm6zi0PvTbdJYjwY.mp4";

async function main() {
  const updated = await prisma.project.updateMany({
    where: { slug: "pula-maliboho" },
    data: { videoUrl: VIDEO_URL },
  });
  console.log(`Updated ${updated.count} project(s) with video URL: ${VIDEO_URL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
