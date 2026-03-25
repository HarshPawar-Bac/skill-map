import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black ">
      <main className="space-y-4">
        <h1 className="text-9xl">Skill Map</h1>
        <div className="flex gap-x-3">
          <Link
            href={"/login"}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                               rounded-lg bg-gray-900 text-white text-2xl font-medium
                               hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
          >
            login
          </Link>

          <Link
            href={"/register"}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4
                               rounded-lg border border-gray-200 text-2xl font-medium text-gray-700
                               hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-colors"
          >
            register
          </Link>
        </div>
      </main>
    </div>
  );
}
