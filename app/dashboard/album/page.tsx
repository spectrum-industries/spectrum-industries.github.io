'use client'
 
import { AlbumTable } from '@/app/lib/definitions'
import { useState, useEffect } from 'react'
 
export default function Album() {
  const [photos, setPhotos] = useState<AlbumTable[]>([])
 
  useEffect(() => {
    async function fetchPhotos() {
      const res = await fetch('/api/photos')
      const data = await res.json();
      setPhotos(data.photos)
    }
    fetchPhotos()
  }, [])
 
  if (!photos) return <div>Loading...</div>
 
  return (
    <ul>
      {photos.map((photo) => (
        <li key={photo.id}>
          <img src={photo.photo} alt={String(photo.id)}></img>
        </li>
      ))}
    </ul>
  )
}