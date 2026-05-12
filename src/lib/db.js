import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const db = {
  async saveSalary(data) {
    return await prisma.salaryPoint.create({
      data: {
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
