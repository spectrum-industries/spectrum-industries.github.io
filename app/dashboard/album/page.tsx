'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlbumTable } from '@/app/lib/definitions';

export default function Album() {
  const [photos, setPhotos] = useState<AlbumTable[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch(`/api/photos?offset=${offset}`);
      const data = await res.json();

      if (data.photos.length === 0) {
        setReachedEnd(true); // No more photos to load
      } else {
        setPhotos((prev) => [...prev, ...data.photos]);
      }
    }

    fetchPhotos();
  }, [offset]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reachedEnd) {
          setOffset((prev) => prev + 1); // Adjust offset increment based on your pagination logic
        }
      },
      { threshold: 1 } // Trigger when 100% of the element is visible
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [reachedEnd]);

  return (
    <>
      <ul>
        {photos.map((photo) => (
          <li key={photo.id}>
            <img src={photo.photo} alt={String(photo.id)} />
          </li>
        ))}
      </ul>
      <div ref={loaderRef} style={{ height: 1 }}></div>
      {reachedEnd && <p>No more photos to load!</p>}
    </>
  );
}
