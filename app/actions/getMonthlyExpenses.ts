"use server";

import prisma from "@/lib/PrismaClient"; // or your DB connector

export default async function getMonthlyExpenses() {
  try {
    const expenses = await prisma.record.findMany({
      where: { /* add user filter if applicable */ },
      select: { amount: true, date: true },
    });

    const monthlyTotals = expenses.reduce((acc: { [x: string]: any; }, exp: { date: string | number | Date; amount: any; }) => {
      const month = new Date(exp.date).toLocaleString("default", { month: "long", year: "numeric" });
      acc[month] = (acc[month] || 0) + exp.amount;
      return acc;
    }, {});

    return monthlyTotals;
  } catch (error) {
    console.error("Error in getMonthlyExpenses:", error);
    return {};
  }
}
