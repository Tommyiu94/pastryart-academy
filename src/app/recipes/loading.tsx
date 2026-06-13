import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-6 py-10">
      <Spinner className="h-8 w-8 text-amber-700" />
    </main>
  );
}
