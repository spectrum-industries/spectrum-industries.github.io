import Image from 'next/image';
import { UpdatePlace, DeletePlace } from '@/app/ui/places/buttons';
import PlacesStatus from '@/app/ui/places/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredPlaces } from '@/app/lib/data';

export default async function PlacesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const places = await fetchFilteredPlaces(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {places?.map((place) => (
              <div
                key={place.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{place?.place}</p>
                    </div>
                  </div>
                  <PlacesStatus status={place.visited} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="flex justify-end gap-2">
                    <UpdatePlace id={String(place.id)} />
                    <DeletePlace id={String(place.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Place
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Visited
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {places?.map((place) => (
                <tr
                  key={place.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p>{place.place}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <PlacesStatus status={place.visited} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdatePlace id={String(place.id)} />
                      <DeletePlace id={String(place.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
