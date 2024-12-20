'use client';

import { PlacesForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updatePlace } from '@/app/lib/actions';

export default function EditPlaceForm({
  place
}: { 
  place: PlacesForm;
}) {
  const updatePlaceWithId = updatePlace.bind(null, String(place.id));
  return (
    <form action={updatePlaceWithId}>
      <strong className="text-2xl">{place.place}</strong>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Invoice Status */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Have we gone here?
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="visited"
                  type="radio"
                  value="pending"
                  defaultChecked={place.visited}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="visited"
                  name="visited"
                  type="radio"
                  value="visited"
                  defaultChecked={place.visited}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="visited"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Visited <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/places"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Edit this place</Button>
      </div>
    </form>
  );
}
