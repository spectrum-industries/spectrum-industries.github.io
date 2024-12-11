'use client'

import {
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function Filters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleToggle = async function visitedParam(visited : string | null) {
    const params = new URLSearchParams(searchParams);
    if (visited) {
      params.set('visited', visited);
    } else {
      params.delete('visited');
    }
    replace(`${pathname}?${params.toString()}`);
    }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value === 'visited' ? 'visited' : 'pending';
      handleToggle(value);
  };
  
  return(
    <fieldset>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  onChange={handleChange}
                  checked={searchParams.get('visited')?.toString() == "pending"}
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
                  name="status"
                  type="radio"
                  value="visited"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  onChange={handleChange}
                  checked={searchParams.get('visited')?.toString() == "visited"}
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
  )
}