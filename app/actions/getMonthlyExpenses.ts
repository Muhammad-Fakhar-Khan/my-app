'use server';

import prisma from '@/lib/PrismaClient';

interface MonthlyExpense {
  month: string;
  total: number;
}

export async function getMonthlyExpenses(): Promise<MonthlyExpense[]> {
  const records: { amount: number | string | { toString(): string }, date: string | Date }[] = await prisma.record.findMany({
    select: {
      amount: true,
      date: true,
    },
    orderBy: { date: 'asc' },
  });

  const monthlyMap = new Map<string, number>();

  for (const record of records) {
    const dateObj = new Date(record.date);
    const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    const prev = monthlyMap.get(monthKey) ?? 0;

    // ✅ force numeric conversion (handles Prisma.Decimal or string)
    const amount = typeof record.amount === 'object'
      ? Number(record.amount.toString())
      : Number(record.amount);

    monthlyMap.set(monthKey, prev + amount);
  }

  return Array.from(monthlyMap.entries()).map(([month, total]) => ({
    month,
    total: Number(total),
  }));
}
