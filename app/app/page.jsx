import { Suspense } from "react";
import { redirect } from "next/navigation";
import Search from "@/components/search";
import { isUnauthenticated } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Home() {
  if (await isUnauthenticated())
    redirect("/sign_in")

  const categories = await prisma.$queryRaw`
    SELECT
      "public"."Category"."id",
      "public"."Category"."type",
      "public"."Category"."name",
      "public"."Category"."description"
    FROM "public"."Category"
    WHERE "public"."Category"."level" = 1
    ORDER BY "public"."Category"."name"
  `

  const locs = await prisma.$queryRaw`
    SELECT
      "public"."Location"."id",
      "public"."Location"."type",
      "public"."Location"."name"
    FROM "public"."Location"
  `
  const locations = [
    {
      name: "",
      items: [{ id: 0, type: "ONLINE", name: "Онлайн" }]
    },
    {
      name: "Район",
      items: locs.filter((loc) => loc.type == "AREA")
    },
    {
      name: "Станция метро",
      items: locs.filter((loc) => loc.type = "METRO")
    }
  ]

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Suspense>
        <Search
          categories={categories}
          locations={locations}
        />
      </Suspense>
    </main>
  )
}
