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

  async getActivationSteps(userId) {
    return await prisma.activationStep.findMany({
      where: { userId },
    });
  },

  async completeActivationStep(userId, step) {
    return await prisma.activationStep.upsert({
      where: { userId_step: { userId, step } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, step, completed: true, completedAt: new Date() },
    });
  },

  async saveContribution(data) {
    return await prisma.contribution.create({
      data: {
        userId: data.userId,
        type: data.type,
        company: data.company,
        role: data.role,
        city: data.city,
        salary: data.salary,
        rating: data.rating,
        content: data.content,
        approved: false,
        points: data.type === 'salary' ? 10 : 15,
      },
    });
  },

  async getUserContributions(userId) {
    return await prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async logActivity(userId, action, metadata) {
    return await prisma.userActivity.create({
      data: { userId, action, metadata: metadata ? JSON.stringify(metadata) : null },
    });
  },

  async getUserActivities(userId, limit = 20) {
    return await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async getOrCreateStreak(userId) {
    const existing = await prisma.streak.findUnique({ where: { userId } });
    if (existing) return existing;

    return await prisma.streak.create({
      data: { userId },
    });
  },

  async recordVisit(userId) {
    const streak = await prisma.streak.findUnique({ where: { userId } });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!streak) {
      return await prisma.streak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastVisitDate: today },
      });
    }

    const last = streak.lastVisitDate ? new Date(streak.lastVisitDate) : null;
    if (last) {
      const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
      const diffDays = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return streak;
      if (diffDays === 1) {
        const newStreak = streak.currentStreak + 1;
        return await prisma.streak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastVisitDate: today,
          },
        });
      }
    }

    return await prisma.streak.update({
      where: { userId },
      data: { currentStreak: 1, lastVisitDate: today },
    });
  },

  async getUserStats(userId) {
    const [activities, contributions, salaries, resumes, offers] = await Promise.all([
      prisma.userActivity.count({ where: { userId } }),
      prisma.contribution.count({ where: { userId } }),
      prisma.salaryPoint.count({ where: { userId } }),
      prisma.resumeScore.count({ where: { userId } }),
      prisma.offerAnalysis.count({ where: { userId } }),
    ]);

    return { activities, contributions, salaries, resumes, offers, total: activities + contributions + salaries + resumes + offers };
  },
};
