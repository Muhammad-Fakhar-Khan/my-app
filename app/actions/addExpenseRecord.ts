'use server';
import { auth } from '@clerk/nextjs/server';
// import { getUser } from '@clerk/clerk-sdk-node';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface RecordData {
  text: string;
  amount: number;
  category: string;
  date: string;
}

interface RecordResult {
  data?: RecordData;
  error?: string;
}

async function addExpenseRecord(formData: FormData): Promise<RecordResult> {
  const textValue = formData.get('text');
  const amountValue = formData.get('amount');
  const categoryValue = formData.get('category');
  const dateValue = formData.get('date');

  if (!textValue || !amountValue || !categoryValue || !dateValue) {
    return { error: 'Text, amount, category, or date is missing' };
  }

  const text = textValue.toString();
  const amount = parseFloat(amountValue.toString());
  const category = categoryValue.toString();

  let date: string;
  try {
    const [year, month, day] = dateValue.toString().split('-');
    const dateObj = new Date(
      Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0)
    );
    date = dateObj.toISOString();
  } catch (error) {
    console.error('Invalid date format:', error);
    return { error: 'Invalid date format' };
  }

  const { userId } = await auth();
  if (!userId) return { error: 'User not found' };
  const user = await clerkClient.users.getUser(userId);
  const email = user?.emailAddresses?.[0]?.emailAddress || '';
  const name = user?.firstName || undefined;

  try {
    // Ensure the user exists in the database
    await db.user.upsert({
      where: { clerkUserId: userId },
      update: {}, // nothing to update
      create: {
        clerkUserId: userId,
        email,
        name,
      },
    });

    // Now create the expense record
    const createdRecord = await db.record.create({
      data: {
        text,
        amount,
        category,
        date,
        userId, // this now correctly references an existing user
      },
    });

    const recordData: RecordData = {
      text: createdRecord.text,
      amount: createdRecord.amount,
      category: createdRecord.category,
      date: createdRecord.date?.toISOString() || date,
    };

    revalidatePath('/');

    return { data: recordData };
  } catch (error) {
    console.error('Error adding expense record:', error);
    return {
      error: 'An unexpected error occurred while adding the expense record.',
    };
  }
}

export default addExpenseRecord;
