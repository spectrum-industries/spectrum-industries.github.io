import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';
import { fetchFilteredPlacesCount, fetchPhotosCount } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  days: CalendarIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const {
    numberOfInvoices,
    numberOfCustomers,
    totalPaidInvoices,
    totalPendingInvoices,
  } = await fetchCardData();
  const places = await fetchFilteredPlacesCount()
  const photos = await fetchPhotosCount()
  let date1 = new Date("06/12/2023");
  let date2 = new Date();

  let Difference_In_Time =
    date2.getTime() - date1.getTime();

  let Difference_In_Days =
    Math.round
        (Difference_In_Time / (1000 * 3600 * 24));

  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Pictures" value={photos} type="collected" />
      <Card title="Dates" value={totalPendingInvoices} type="pending" />
      <Card title="Places we've been" value={places} type="invoices" />
      <Card
        title="Days since we started dating"
        value={Difference_In_Days}
        type="days"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'invoices' | 'days' | 'pending' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
