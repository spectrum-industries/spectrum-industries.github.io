import { db } from '@vercel/postgres'; 
import { type NextRequest } from 'next/server'

const client = await db.connect();

const ITEMS_PER_PAGE = 15

async function fetchPhotosinBatch(offset : number) {
  try {
    const photos = await client.sql`
      SELECT 
        * 
      FROM album
      ORDER BY created_date DESC, id ASC
      OFFSET ${offset * ITEMS_PER_PAGE}
      LIMIT ${ITEMS_PER_PAGE}
    `;
    if(photos.rows){
      return photos.rows;
    }
    else{
      return []
    }
  } catch (err){
    console.error('Database Error:', err);
    throw new Error('Failed to fetch pages.');
  }
}

export async function GET(request : NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const offset = searchParams.get('offset');
    let photos;
    if(offset === null){
      photos = await fetchPhotosinBatch(0)
    }
    else{
      photos = await fetchPhotosinBatch(Number(offset))
    }

    return Response.json({ message: 'Fetched photos', photos: photos });
  } catch (error) {
    console.log(error)
    return Response.json({ error }, { status: 500 });
  }
}

