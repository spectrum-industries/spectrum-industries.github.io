'use server';
 
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { S3Client } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

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

export type PhotoState = {
  errors?: {
    date?: string[];
    photo?: File | undefined;
    orientation?: string[];
    height?: string[];
    width?: string[];
  };
  message?: string | null;
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const PhotoFormSchema = z.object({
  id: z.string(),
  created_date: z.string().nonempty({ message: 'Created date is required.' }), // Make created_date compulsory
  photo: z.instanceof(File)
    .refine(file => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    })
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "File must be a JPEG, PNG, or WebP"
    }),
  height : z.string(),
  width : z.string(),
  orientation : z.string(),
});


const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdatePlace = PlaceFormSchema.omit({ id: true, place: true });
const CreatePlace = PlaceFormSchema.omit({ id: true});
const UpdatePhoto = PhotoFormSchema.omit({ id: true, photo: true, height: true, width: true, orientation:true });
const CreatePhoto = PhotoFormSchema.omit({ id: true });

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

export async function createPhoto(state: PhotoState, formData: FormData): Promise<PhotoState> {
  // Validate form using Zod
  const validatedFields = CreatePhoto.safeParse({
    created_date: formData.get('created_date'),
    photo: formData.get('photo') as File,
    height: formData.get('height')?.toString(),
    width: formData.get('width')?.toString(),
    orientation: formData.get('orientation'),
  });

  // Check if validation fails
  if (!validatedFields.success) {
    console.error(
      'Validation errors:',
      validatedFields.error.flatten().fieldErrors
    );
    return {
      errors: validatedFields.error.flatten().fieldErrors as PhotoState['errors'],
      message: 'Missing Fields. Failed to Create Photo.',
    };
  }
  let redirectPath: string | null = null
  const { created_date, photo, height, width, orientation } = validatedFields.data;

  try {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const s3BucketName = process.env.AWS_BUCKET_NAME || '';
    const region = process.env.AWS_REGION || '';

    if (!accessKeyId || !secretAccessKey || !s3BucketName || !region) {
      throw new Error(
        `AWS credentials or bucket configuration is missing. 
        accessKeyId: ${accessKeyId ? 'OK' : 'MISSING'}, 
        secretAccessKey: ${secretAccessKey ? 'OK' : 'MISSING'}, 
        s3BucketName: ${s3BucketName ? 'OK' : 'MISSING'}, 
        region: ${region ? 'OK' : 'MISSING'}`
      );
    }

    const client = new S3Client({ region });

    const { url, fields } = await createPresignedPost(client, {
      Bucket: s3BucketName ,
      Key: `${uuidv4()}_${photo.name}`,
      Conditions: [['content-length-range', 0, MAX_FILE_SIZE]],
      Fields: {
        acl: 'bucket-owner-full-control',
        'Content-Type': photo.type,
      },
      Expires: 600,
    });

    // Upload the file to S3 using fetch
    const formDataForUpload = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formDataForUpload.append(key, value as string);
    });
    formDataForUpload.append('file', photo);

    const response = await fetch(url, {
      method: 'POST',
      body: formDataForUpload,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Store the photo URL and metadata in the database
    const photoUrl = `${url}${fields.key}`;

    // Uncomment to save to the database
    await sql`
      INSERT INTO album (created_date, photo, orientation, height, width)
      VALUES (${created_date}, ${photoUrl}, ${orientation}, ${height}, ${width})
    `;

    // Revalidate and redirect on success
    redirectPath = `/dashboard/album`
  } catch (error) {
    console.error('Error in createPhoto:', error);
    redirectPath = `/`
    return { message: 'Error: Failed to Create Photo.', errors: {} };
  } finally {
    if(redirectPath){
      revalidatePath(redirectPath)
      redirect(redirectPath)
    }
    else{
      revalidatePath('/')
      redirect('/')
    }
  }
}
