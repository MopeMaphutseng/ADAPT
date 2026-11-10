import "dotenv/config";
import { prisma } from "../src/lib/db";


const R2_VIDEO =
  "https://pub-5e36ee3324934ff880a239ac12e4564d.r2.dev/pula-maliboho.mp4";

const VIDEO_BY_SLUG: Record<string, string> = {
  "pula-maliboho": R2_VIDEO,
  campusos: "/media/uno1.mp4",
  gridmind: "/media/project2.mp4",
  "maliboho-security": "/media/project5.mp4",
  "rescuedrone-network": "/media/project3.mp4",
  agroeye: "/media/project4.mp4",
  "smart-energy-monitor": "/media/uno4.mp4",
};

async function main() {
  let total = 0;
  for (const [slug, videoUrl] of Object.entries(VIDEO_BY_SLUG)) {
    const r = await prisma.project.updateMany({
      where: { slug },
      data: { videoUrl },
    });
    console.log(`${slug}: ${r.count} updated -> ${videoUrl}`);
    total += r.count;
  }
  console.log(`Done. ${total} project row(s) updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
