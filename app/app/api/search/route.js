import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { linearConversion } from "@/lib/utils";

const groupsCount = 10

function buildFilters(params) {
  let filters = []

  if (params.get("search"))
    filters.push(`cats.name ILIKE '${params.get("search")}%'`)

  if (params.get("dow"))
    filters.push(`public"."Timetable"."dow" IN (${Prisma.join(params.get("dow"))})`)

  if (!filters.length)
    return ''

  return Prisma.sql`AND ${filters.join(' AND ')}`
}

export async function GET(request) {
  const params = request.nextUrl.searchParams

  const userId = await currentUserId()
  const user = (await prisma.$queryRaw(Prisma.sql`
    SELECT
      "public"."User"."id",
      ST_X("public"."User"."addressPoint") AS "addressLong",
      ST_Y("public"."User"."addressPoint") AS "addressLat"
    FROM "public"."User"
    WHERE "public"."User"."id" = ${userId}
    LIMIT 1
  `))[0]

  // const cats0 = await prisma.$queryRaw(Prisma.sql`
  //   SELECT "public"."Category".*, "public"."Recommendation"."rank"
  //   FROM "public"."Category"
  //   JOIN "public"."Recommendation"
  //     ON "public"."Recommendation"."categoryId" = "public"."Category"."id"
  //     AND "public"."Recommendation"."userId" = ${user.id}
  //   WHERE "public"."Category"."level" = 0
  //   ORDER BY "public"."Recommendation"."rank"
  // `)

  const cats0 = [{id: 1}]

  console.log(cats0)

  const totalRank = cats0.reduce((a, b) => a + b, 0)

  for (const cat0 of cats0) {
    const limit = linearConversion([0, totalRank], [0, groupsCount], cat0.rank)
    await prisma.$queryRaw(Prisma.sql`
      WITH RECURSIVE cats AS (
        SELECT "public"."Category".*
        FROM "public"."Category"
        WHERE "public"."Category"."id" = ${cat0.id}

        UNION

        SELECT child.*
        FROM "public"."Category" child
        INNER JOIN "public"."Category" parent
          ON child."parentId" = parent."id"
        WHERE child.level = 3
      )
      SELECT
        DISTINCT(groups.id),
        (CASE
          WHEN groups."daysToStart" < 0 THEN 3
          WHEN groups."daysToStart" < 7 THEN 0
          WHEN groups."daysToStart" < 30 THEN 1
          ELSE 2
        END) AS "dateOrder",
        (CASE
          WHEN groups.distance IS NULL THEN 3
          WHEN groups.distance < 2000 THEN 0
          WHEN groups.distance < 5000 THEN 1
          ELSE 2
        END) AS "distanceOrder",
        groups.rank AS rank
      FROM (
        SELECT
          "public"."Group"."id",
          (CASE
            WHEN "public"."Group"."addressPoint" IS NULL
            ELSE ST_DistanceSphere(
              ST_SetSRID(ST_MakePoint(${user.addressLong}, ${user.addressLat}), 4326),
              "public"."Group"."addressPoint"
            )
          END) AS distance,
          ("public"."Timetable"."dateStart" - CURRENT_DATE) AS "daysToStart",
          "public"."Recommendation"."rank" AS rank
        FROM "public"."Group"
        JOIN cats
          ON cats."id" = "public"."Group"."categoryId"
        JOIN "public"."Recommendation"
          ON "public"."Recommendation"."categoryId" = cats."id"
          AND "public"."Recommendation"."userId" = ${user.id}
        JOIN "public"."Timetable"
          ON "public"."Timetable"."groupId" = "public"."Group"."id"
          AND "public"."Timetable"."type" = 'ACTIVE'
          AND "public"."Timetable"."dateEnd" >= CURRENT_DATE
        LEFT JOIN "public"."Attend"
          ON "public"."Attend"."groupId" = "public"."Group"."id"
          AND "public"."Attend"."userId" = ${user.id}
        WHERE "public"."Attend"."id" IS NULL
          AND "public"."Group"."important" = FALSE
          ${buildFilters(params)}
      ) groups
      ORDER BY
        daysOrder ASC,
        distanceOrder ASC,
        groups.rank DESC
      LIMIT ${limit}
    `)
  }

  // if (user.address) {
  //
  // }
  //
  // Prisma.sql`
  // SELECT * FROM Group
  // JOIN Recommendation ON Recommendation.groupId = Group.id
  // LEFT JOIN Timetable ON
  // WHERE (
  //   important = false AND
  //   Recommendation.userId = ${user.id}
  // )
  // ORDER BY
  //   type DESC
  //   Recommendation.factor DESC
  // `
  // const recommened = prisma.group.findMany({
  //   where: {
  //     recomendations: {
  //       every: { userId: { eq: user.id } },
  //       orderBy: { userId: {  } }
  //     },
  //   },
  //   include: {
  //     recommendations: true
  //   }
  // })
  // const recommendations = prisma.recomendations.findMany({
  //   where: { userId: user.id },
  //   orderBy: { rating: "desc" },
  // })
  const groups = [
    {
      type: "offline",
      categories: ["Образование", "Английский язык"],
      address: "город Москва, улица Мусы Джалиля, улица Мусы Джалиля, дом 25А",
      startDate: "2023-06-01",
      timetable: [
        {
          dow: "TUESDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        },
        {
          dow: "THURSDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        }
      ],
    },
    {
      type: "offline",
      categories: ["Образование", "Китайский язык"],
      address: "город Москва, дом 25А",
      startDate: "2023-06-01",
      timetable: [
        {
          dow: "TUESDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        },
        {
          dow: "THURSDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        }
      ],
    },
    {
      type: "online",
      categories: ["Образование", "Испанский язык"],
      address: "город Москва, улица Мусы Джалиля, дом 25А",
      startDate: "2023-02-01",
      timetable: [
        {
          dow: "TUESDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        },
        {
          dow: "THURSDAY",
          timeStart: "11:15",
          timeEnd: "13:15",
        }
      ],
    }
  ]

  return NextResponse.json(
    {
      groups: groups,
    },
    {
      status: 200
    }
  )
}
