import Form from '@/app/ui/places/edit-form';
import Breadcrumbs from '@/app/ui/places/breadcrumbs';
import { fetchPlaceById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const place = await fetchPlaceById(id);
  if (!place) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Places', href: '/dashboard/places' },
          {
            label: 'Edit Place',
            href: `/dashboard/places/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form place={place}/>
    </main>
  );
}