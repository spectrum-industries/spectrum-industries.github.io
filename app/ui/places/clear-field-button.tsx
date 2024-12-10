import { revalidatePath } from "next/cache";

export function ClearFilterButton({}: {}) {
  return (
    <form action={() => revalidatePath("dashboard/places")}>
      <button type="submit" className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-blue-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
      Clear Fields
      </button>
    </form>
  );
}
