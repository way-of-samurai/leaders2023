import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
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

  return NextResponse.json(
    {
      categories: categories,
    },
    {
      status: 200
    }
  )
}
