'use server';

import { db } from '@/lib/db';

interface MonthlyExpense {
  month: string;
  total: number;
}

export async function getMonthlyExpenses(): Promise<MonthlyExpense[]> {
  const records = await db.record.findMany({
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
    const amount = Number(record.amount); // ensures numeric
    monthlyMap.set(monthKey, prev + amount);
  }

  return Array.from(monthlyMap.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}
