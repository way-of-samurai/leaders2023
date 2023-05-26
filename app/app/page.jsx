import { redirect } from "next/navigation";
import Search from "@/components/search";
import { isUnauthenticated } from "@/lib/auth";

export default async function Home() {
  if (await isUnauthenticated())
    redirect("/sign_in")

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Search />
    </main>
  )
}
