import Search from "@/components/search";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  // if (!cookies().has("token")) {
  //   redirect("/sign_in")
  // }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Search />
    </main>
  )
}
