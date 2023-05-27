import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const locations = await prisma.$queryRaw`
    SELECT
      "public"."Location"."id",
      "public"."Location"."type",
      "public"."Location"."name"
    FROM "public"."Location"
  `

  return NextResponse.json(
    {
      locations: locations,
    },
    {
      status: 200
    }
  )
}
