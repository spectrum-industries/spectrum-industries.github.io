'use client';

import { CustomerField, PhotoForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateInvoice, updatePhoto } from '@/app/lib/actions';
import { QueryResultRow } from '@vercel/postgres';
import Image from 'next/image';
export default function EditInvoiceForm({
  photo,
}: {
  photo: QueryResultRow;
}) {


  const classifyImage = (width: number, height: number) => {
    const aspectRatio = width / height;
    if (aspectRatio > 1.2) return 'landscape';
    if (aspectRatio < 0.8) return 'portrait';
    return 'square';
  };
  const imageClass = classifyImage(photo?.width, photo?.height);

  const updatePhotoWithId = updatePhoto.bind(null, photo.id);
  return (
    <form action={updatePhotoWithId}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Customer Name */} 
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Look at the pretty picture
          </label>
          <div
          className={`rounded-xl bg-gray-50 p-5 flex justify-center items-center ${imageClass}`}
          style={{ width: '100%', margin: '0 auto' }}
        >
              <img 
                src={photo?.photo}
                alt={photo?.id}
                width={photo?.width}
                height={photo?.height}
                className="rounded"
                style={{ 
                  objectFit: 'contain', 
                 }}
              />
          </div>
        </div>

        {/* Invoice Amount */}
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
                step="0.01"
                defaultValue={photo.created_date === null ? "" : photo.created_date.toISOString().split('T')[0]}
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit Date</Button>
      </div>
    </form>
  );
}
