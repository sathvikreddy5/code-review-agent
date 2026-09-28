import prisma from "./prisma.js";

async function testDatabase() {
  try {
    const reviews = await prisma.review.findMany();

    console.log("✅ PostgreSQL connected!");
    console.log("📦 Reviews stored:", reviews.length);
  } catch (error) {
    console.error("❌ Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();