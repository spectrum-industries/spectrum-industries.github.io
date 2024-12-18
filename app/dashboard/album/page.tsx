'use client';

import { useState, useEffect } from 'react';
import { AlbumTable } from '@/app/lib/definitions';

export default function Album() {
  const [photos, setPhotos] = useState<AlbumTable[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [reachedEnd, setReachedEnd] = useState(false);

  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch(`/api/photos?offset=${offset}`);
        if (!res.ok) {
          console.error('Failed to fetch photos');
          return;
        }
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setPhotos((prev) => [...prev, ...data.photos]);
        } else {
          setReachedEnd(true);
        }
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    }

    fetchPhotos();
  }, [offset]);

  return (
    <div style={{backgroundColor: "red"}}>
      <ul>
        {photos.map((photo) => (
          <li key={photo.id}>
            <img src={photo.photo} alt={`Photo ID: ${photo.id}`} />
          </li>
        ))}
      </ul>
      <div style={{ height: '1px' }} />
      {reachedEnd && <p>No more photos to load!</p>}
    </div>
  );
}
