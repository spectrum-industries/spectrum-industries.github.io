'use client'

import Link from 'next/link';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createPhoto, PhotoState } from '@/app/lib/actions';
import { useActionState } from 'react';
import { useState } from 'react';
import { startTransition } from 'react';

export default function Form({}: {}) {
  const initialState: PhotoState = { message: null, errors: {} };
  const [state, formAction] = useActionState(createPhoto, initialState);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          console.log(`Image Width: ${img.width}, Image Height: ${img.height}`);
        };
      };

      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Create a new FormData object
    const formData = new FormData(event.currentTarget);

    // Append image dimensions to FormData
    formData.append('width', imageDimensions.width.toString());
    formData.append('height', imageDimensions.height.toString());
    const orientation =  imageDimensions.width >= imageDimensions.height ? "Landscape" : "Portrait";
    formData.append('orientation', orientation);

    // Call the form action with updated FormData
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose a photo
          </label>
          <div className="relative">
            <input 
              type="file" 
              id="imageUpload" 
              name="photo" 
              accept="image/*" 
              required 
              onChange={handleFileChange} 
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            When did this happen?
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="created_date"
                name="created_date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                step="0.01"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
              />
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/album"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Add a Photo</Button>
      </div>
    </form>
  );
}
