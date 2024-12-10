import Form from '@/app/ui/places/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

export default async function Page() {
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Places', href: '/dashboard/places' },
          {
            label: 'Create Place',
            href: '/dashboard/invoices/places',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}