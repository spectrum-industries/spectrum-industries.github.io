'use server';
 
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const PlaceFormSchema = z.object({
  id: z.string(),
  place: z.string(),
  visited: z.boolean()
});

export type PlaceState = {
  errors?: {
    place?: string[];
    visited?: string[];
  };
  message?: string | null;
};

const PhotoFormSchema = z.object({
  id: z.string(),
  created_date: z.string()
});

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdatePlace = PlaceFormSchema.omit({ id: true, place: true });
const CreatePlace = PlaceFormSchema.omit({ id: true});
const UpdatePhoto = PhotoFormSchema.omit({ id: true });

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
  
  try{
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;
  } catch(error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  try{
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
  return { message: 'Deleted Invoice.' };
} catch(error) {
  return {
    message: 'Database Error: Failed to Delete Invoice.',
  };
}
}

export async function createPlace(prevState: PlaceState, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreatePlace.safeParse({
    place: formData.get('place'),
    visited: formData.get('visited') == "visited",
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Place.',
    };
  }
 
  // Prepare data for insertion into the database
  const { place, visited } = validatedFields.data;
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO places (place, visited)
      VALUES (${place}, ${visited})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath('/dashboard/places');
  redirect('/dashboard/places');
}

export async function updatePlace(id: string, formData: FormData) {
  const { visited } = UpdatePlace.parse({
    visited: formData.get('visited') == "visited",
  });
  
  try{
  await sql`
    UPDATE places
    SET visited = ${visited}
    WHERE id = ${id}
  `;
  } catch(error) {
    return {
      message: 'Database Error: Failed to Update Places.',
    };
  }
  revalidatePath('/dashboard/places');
  redirect('/dashboard/places');
}

export async function deletePlace(id: string) {
  try{
  await sql`DELETE FROM places WHERE id = ${id}`;
  revalidatePath('/dashboard/places');
  return { message: 'Deleted Place.' };
} catch(error) {
  return {
    message: 'Database Error: Failed to Delete Place.',
  };
}
}


export async function updatePhoto(id: string, formData: FormData) {
  const { created_date } = UpdatePhoto.parse({
    created_date: formData.get('created_date')
  });
 
  
  try{
  await sql`
    UPDATE album
    SET created_date = ${created_date}
    WHERE id = ${id}
  `;
  } catch(error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }
  revalidatePath('/dashboard/album');
  redirect('/dashboard/album');
}
