import { signIn } from "@/app/auth"
import { Button } from '@/app/ui/button';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { redirect } from "next/navigation";

export default function SignIn() {
  return (
      <form
        action={async () => {
          "use server";
          redirect(await signIn("google", { redirectTo : '/dashboard' }));
        }}
        className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full"
      >
        <Button className="mt-4 w-full" type={"submit"}>
          Sign in with Google
          <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
      </form>
  )
} 