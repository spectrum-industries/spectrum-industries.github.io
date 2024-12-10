import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/places/table';
import { CreatePlace } from '@/app/ui/places/buttons';
import { lusitana } from '@/app/ui/fonts';
import { PlacesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchPlacesPages } from '@/app/lib/data';
import {
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ClearFilterButton } from '@/app/ui/places/clear-field-button';
import { revalidatePath } from 'next/cache';
import { Filters } from '@/app/ui/filter';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPlacesPages(query);
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Places Visited</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">

        <Search placeholder="Search places visited..." />
        <Filters />
        <CreatePlace />
      </div>
       <Suspense key={query + currentPage} fallback={<PlacesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}