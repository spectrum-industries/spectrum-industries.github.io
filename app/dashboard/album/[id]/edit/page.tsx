import Form from '@/app/ui/album/edit-form';
import Breadcrumbs from '@/app/ui/album/breadcrumbs';
import { fetchPhotoByID } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { CustomerField, PhotoForm } from '@/app/lib/definitions';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const photo = await fetchPhotoByID(Number(id));
  if (!photo) {
    notFound();
  }
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Album', href: '/dashboard/album' },
          {
            label: 'Edit Image',
            href: `/dashboard/album/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form photo={ photo } />
    </main>
  );
}