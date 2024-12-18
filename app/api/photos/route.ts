import { db } from '@vercel/postgres'; 

const client = await db.connect();

async function fetchPhotos() {
  try {
    const photos = await client.sql`
      SELECT 
        * 
      FROM album
      LIMIT 10;
    `;
    if(photos){
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

export async function GET() {
  try {
    const photos = await fetchPhotos()

    return Response.json({ message: 'Fetched photos', photos: photos });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

