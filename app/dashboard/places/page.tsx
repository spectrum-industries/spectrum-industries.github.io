import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/places/table';
import { CreatePlace } from '@/app/ui/places/buttons';
import { lusitana } from '@/app/ui/fonts';
import { PlacesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchPlacesPages } from '@/app/lib/data';
import { ClearFilterButton } from '@/app/ui/places/clear-field-button';
import { Filters } from '@/app/ui/filter';

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    visited?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const visited = searchParams?.visited || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchPlacesPages(query, visited);
  
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Places Visited</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <ClearFilterButton />
        <Search placeholder="Search places visited..." />
        <Filters />
        <CreatePlace />
      </div>
       <Suspense key={query + currentPage} fallback={<PlacesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} visited={visited}/>
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}