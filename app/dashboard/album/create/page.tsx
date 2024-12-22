import Form from '@/app/ui/album/create-form';
import Breadcrumbs from '@/app/ui/album/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Album', href: '/dashboard/album' },
          {
            label: 'Add a Photo',
            href: '/dashboard/album/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}