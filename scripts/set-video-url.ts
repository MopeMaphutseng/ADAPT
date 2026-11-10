import "dotenv/config";
import { prisma } from "../src/lib/db";


const VIDEO_URL =
  process.env.VIDEO_URL ??
  "https://pub-5e36ee3324934ff880a239ac12e4564d.r2.dev/pula-maliboho.mp4";

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
