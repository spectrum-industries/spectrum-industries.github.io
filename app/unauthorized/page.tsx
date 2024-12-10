import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { redirect } from 'next/navigation';
import { auth } from '../auth';
 
export default async function Unauthorized() {

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-0">
        <div className="flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36">
          <div className="w-32 text-white md:w-36">
            <AcmeLogo />
          </div>
        </div>
        <p>Oops, looks like you're not authorized to be in this page. If you need access to this page, you should contact the team and let them know so you can be approved</p>
      </div>
    </main>
  );
}