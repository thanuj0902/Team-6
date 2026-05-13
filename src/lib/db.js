import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

export const db = {
  async saveUser(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
      },
    });
  },

  async saveSalary(data) {
    return await prisma.salaryPoint.create({
      data: {
        userId: data.userId,
        role: data.role,
        experience: data.experience,
        city: data.city,
        company: data.company,
        companyTier: data.companyTier,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        equity: data.equity,
        totalCTC: data.totalCTC,
      },
    });
  },

  async getSalaryBenchmarks(role, city) {
    const points = await prisma.salaryPoint.findMany({
      where: {
        role: role,
        city: city,
      },
    });

    if (points.length === 0) return null;

    const total = points.reduce((acc, p) => acc + p.totalCTC, 0);
    return {
      average: total / points.length,
      count: points.length,
    };
  },

  async saveResume(data) {
    return await prisma.resumeScore.create({
      data: {
        userId: data.userId,
        overallScore: data.overallScore,
        atsScore: data.atsScore,
        role: data.role,
        level: data.level,
        missingKeywords: data.missingKeywords,
        strengths: data.strengths,
        improvements: data.improvements,
      },
    });
  },

  async saveOffer(data) {
    return await prisma.offerAnalysis.create({
      data: {
        userId: data.userId,
        company: data.company,
        role: data.role,
        city: data.city,
        expLevel: data.expLevel,
        totalCTC: data.totalCTC,
        verdict: data.verdict,
      },
    });
  },
};
