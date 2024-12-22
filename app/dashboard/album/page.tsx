'use client';

import { useState, useEffect, useRef } from 'react';
import { AlbumTable } from '@/app/lib/definitions';
import { CreatePhoto } from '@/app/ui/album/buttons';

export default function Album() {
  const [photos, setPhotos] = useState<AlbumTable[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setPhotos([]);
    setOffset(0);
    setReachedEnd(false);
    setInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!initialLoad || reachedEnd || loading) return;

    async function fetchPhotos() {
      setLoading(true);
      try {
        const res = await fetch(`/api/photos?offset=${offset}`);
        if (!res.ok) {
          console.error('Failed to fetch photos');
          setLoading(false);
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
      setLoading(false);
    }

    fetchPhotos();
  }, [offset, initialLoad]);

  useEffect(() => {
    if (photos.length === 0 && offset === 0 && !reachedEnd) {
      setInitialLoad(true);
    }
  }, [photos, offset, reachedEnd]);

  useEffect(() => {
    const onScroll = () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(() => {
        if (containerRef.current) {
          const container = containerRef.current;
          const isReachBottom =
            container.scrollHeight <= container.scrollTop + container.clientHeight + 10;
          if (isReachBottom && !loading && !reachedEnd) {
            setOffset((prev) => prev + 1);
          }
        }
      }, 200); // Adjust debounce delay as needed
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', onScroll);
    return () => {
      container?.removeEventListener('scroll', onScroll);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [loading, reachedEnd]);

  // Helper to group photos by month
  const groupPhotosByMonth = (photos: AlbumTable[]) => {
    const grouped: { [key: string]: AlbumTable[] } = {};
    photos.forEach((photo) => {
      const date = new Date(photo.created_date);
      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(photo);
    });
    return grouped;
  };

  const groupedPhotos = groupPhotosByMonth(photos);

  return (
    <div
      ref={containerRef}
      style={{
        maxHeight: '90vh',
        overflowY: 'scroll',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <div className="flex justify-end w-full pb-5">
        <CreatePhoto />
      </div>
      {Object.entries(groupedPhotos).map(([month, monthPhotos]) => (
        <div key={month}>
          <h2 style={monthHeaderStyle}>{month}</h2>
          <div style={gridStyle}>
            {monthPhotos.map((photo) => (
              <div key={photo.id} style={getPhotoStyle(photo)}>
                <a href={`/dashboard/album/${photo.id}/edit`}>
                  <div style={imageContainerStyle}>
                    <img
                      src={photo.photo}
                      alt={`Photo ID: ${photo.id}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: photo.orientation === 'Portrait' ? 'contain' : 'cover',
                        transition: 'transform 0.3s ease',
                        border: '10px solid #ECECEE',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
      {loading && <p>Loading more photos...</p>}
      {reachedEnd && <p>No more photos to load!</p>}
    </div>
  );
}

// Define grid styles
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '10px',
};

// Style for month header
const monthHeaderStyle = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  margin: '20px 0',
};

// Function to determine the style based on photo orientation
const getPhotoStyle = (photo: AlbumTable) => ({
  gridColumn: photo.orientation === 'Portrait' ? 'span 1' : 'span 2',
  gridRow: photo.orientation === 'Portrait' ? 'span 2' : 'span 1',
});

// Style for the image container with background color
const imageContainerStyle = {
  backgroundColor: '#ECECEE',
  padding: '5px',
  borderRadius: '5px',
};
