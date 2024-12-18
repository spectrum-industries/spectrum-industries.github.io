'use client'
import { use } from 'react'

export default function InfiniteScroller({ photos }) {
  const photos = use(photos)
 
  return (
    <ul>
      {photos.map((photo) => (
        <li key={photo.id}>{photo.id}</li>
      ))}
    </ul>
  )
}