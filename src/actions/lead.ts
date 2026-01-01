'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function submitLead(formData: FormData, pgId: string) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (!name || !phone || !pgId) {
    return { success: false, message: 'Missing required fields' };
  }

  try {
    await prisma.lead.create({
      data: {
        id: uuidv4(),
        name,
        phone,
        pg_id: pgId,
        status: 'NEW', // Default status
        source: 'WEBSITE', // Tracking source
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/pg/[slug]`); // Revalidate listing page (optional)
    return { success: true, message: 'Interest registered successfully!' };
  } catch (error) {
    console.error('Error submitting lead:', error);
    return { success: false, message: 'Failed to submit. Please try again.' };
  }
}
