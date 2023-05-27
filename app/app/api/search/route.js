import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { linearConversion } from "@/lib/utils";

const groupsCount = 10

async function buildFilters(params) {
  let filters = []

  if (params.get("query"))
    filters.push(`cats.name ILIKE '${params.get("query")}%'`)

  if (params.get("category")) {
    const cat1Ids = params.get("category").map((cat) => cat.id)
    const cats = await prisma.$queryRaw`
      WITH RECURSIVE cats AS (
        SELECT "public"."Category".*
        FROM "public"."Category"
        WHERE "public"."Category"."id" IN ${Prisma.join(cat1Ids)}

        UNION

        SELECT child.*
        FROM "public"."Category" child
        INNER JOIN "public"."Category" parent
          ON child."parentId" = parent."id"
        WHERE child.level = 3
      )
      SELECT cats.id
      FROM cats
    `

    const ids = cats.map((cat) => cat.id)
    filters.push(`cats.id IN (${Prisma.join(ids)})`)
  }

  if (params.get("location")) {
    let subfilters = []
    const locs = params.get("location").group((loc) => loc.type)

    if (locs.ONLINE)
      subfilters.push(`cats.type = 'ONLINE'`)

    if (locs.AREA) {
      const ids = locs.AREA.map((loc) => loc.id)
      subfilters.push(`"public"."Group"."areaId" IN (${Prisma.join(ids)})`)
    }

    if (locs.METRO) {
      const ids = locs.METRO.map((loc) => loc.id)
      subfilters.push(`"public"."Group"."metroId" IN (${Prisma.join(ids)})`)
    }

    if (filters.length)
      filters.push(`(${subfilters.join(" OR ")})`)
  }

  if (params.get("dow"))
    filters.push(`public"."Timetable"."dow" IN (${Prisma.join(params.get("dow"))})`)

  if (!filters.length)
    return Prisma.empty

  return Prisma.sql`AND ${filters.join(" AND ")}`
}

async function getImportantGroups(user) {
  const groups = await prisma.$queryRaw`
    SELECT "public"."Group"."id"
    FROM "public"."Group"
    LEFT JOIN "public"."Attend"
      ON "public"."Attend"."groupId" = "public"."Group"."id"
      AND "public"."Attend"."userId" = ${user.id}
    WHERE "public"."Attend"."id" IS NULL
      AND "public"."Group"."important" > 0
    ORDER BY "public"."Group"."important" DESC
  `

  return groups.map((group) => group.id)
}

async function getRecommendedGroups(user, params) {
  let groups = []

  const cats0 = await prisma.$queryRaw`
    SELECT "public"."Category".*, "public"."Recommendation"."rank"
    FROM "public"."Category"
    JOIN "public"."Recommendation"
      ON "public"."Recommendation"."categoryId" = "public"."Category"."id"
      AND "public"."Recommendation"."userId" = ${user.id}
    WHERE "public"."Category"."level" = 0
    ORDER BY "public"."Recommendation"."rank"
  `

  const totalRank = cats0.reduce((a, b) => a + b, 0)

  for (const cat0 of cats0) {
    const limit = linearConversion([0, totalRank], [0, groupsCount], cat0.rank)
    groups = groups + await prisma.$queryRaw`
      WITH RECURSIVE cats AS (
        SELECT "public"."Category".*
        FROM "public"."Category"
        WHERE "public"."Category"."id" = ${cat0.id}

        UNION ALL

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
        END) AS "daysOrder",
        (CASE
          WHEN groups."distance" IS NULL THEN 3
          WHEN groups."distance" < 2000 THEN 0
          WHEN groups."distance" < 5000 THEN 1
          ELSE 2
        END) AS "distanceOrder",
        groups.rank AS rank
      FROM (
        SELECT
          "public"."Group"."id",
          ST_DistanceSphere(
            ST_SetSRID(ST_MakePoint(${user.addressLong}, ${user.addressLat}), 4326),
            "public"."Group"."addressPoint"
          ) AS distance,
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
          AND "public"."Group"."important" = 0
          ${await buildFilters(params)}
      ) groups
      ORDER BY
        "daysOrder" ASC,
        "distanceOrder" ASC,
        "rank" DESC
      LIMIT ${limit}
    `
  }

  return groups.map((group) => group.id)
}

async function getOtherGroups(user, params, limit) {
  const groups = prisma.$queryRaw`
    SELECT
      DISTINCT(groups.id),
      (CASE
        WHEN groups."daysToStart" < 0 THEN 3
        WHEN groups."daysToStart" < 7 THEN 0
        WHEN groups."daysToStart" < 30 THEN 1
        ELSE 2
      END) AS "daysOrder",
      (CASE
        WHEN groups."distance" IS NULL THEN 3
        WHEN groups."distance" < 2000 THEN 0
        WHEN groups."distance" < 5000 THEN 1
        ELSE 2
      END) AS "distanceOrder"
    FROM (
      SELECT
        "public"."Group"."id",
        ST_DistanceSphere(
          ST_SetSRID(ST_MakePoint(${user.addressLong}, ${user.addressLat}), 4326),
          "public"."Group"."addressPoint"
        ) AS distance,
        ("public"."Timetable"."dateStart" - CURRENT_DATE) AS "daysToStart"
      FROM "public"."Group"
      JOIN "public"."Category" cats
        ON cats."id" = "public"."Group"."categoryId"
      JOIN "public"."Timetable"
        ON "public"."Timetable"."groupId" = "public"."Group"."id"
        AND "public"."Timetable"."type" = 'ACTIVE'
        AND "public"."Timetable"."dateEnd" >= CURRENT_DATE
      LEFT JOIN "public"."Attend"
        ON "public"."Attend"."groupId" = "public"."Group"."id"
        AND "public"."Attend"."userId" = ${user.id}
      WHERE "public"."Attend"."id" IS NULL
        AND "public"."Group"."important" = 0
        ${await buildFilters(params)}
    ) groups
    ORDER BY
      "daysOrder" ASC,
      "distanceOrder" ASC
    LIMIT ${limit}
  `

  return groups.map((group) => group.id)
}

async function getCategories(categoryId) {
  return await prisma.$queryRaw`
    WITH RECURSIVE cats AS (
      SELECT "public"."Category".*
      FROM "public"."Category"
      WHERE "public"."Category"."id" = ${categoryId}

      UNION ALL

      SELECT "public"."Category".*
      FROM "public"."Category"
      INNER JOIN cats
        ON "public"."Category"."id" = cats."parentId"
    )
    SELECT
      cats."id",
      cats."level",
      cats."type",
      cats."name",
      cats."description",
    FROM cats
    ORDER BY cats.level DESC
  `
}

async function getTimetable(groupId) {
  const timetable = await prisma.$queryRaw`
    SELECT
      "public"."Timetable"."id",
      "public"."Timetable"."dateStart",
      "public"."Timetable"."dateEnd",
      "public"."Timetable"."dow",
      "public"."Timetable"."timeStart",
      "public"."Timetable"."timeEnd"
    FROM "public"."Timetable"
    WHERE "public"."Timetable"."groupId" = ${groupId}
      AND "public"."Timetable"."type" = 'ACTIVE'
      AND "public"."Timetable"."dateEnd" >= CURRENT_DATE
    ORDER BY
      "public"."Timetable"."dateStart" ASC,
      "public"."Timetable"."dow" ASC,
      "public"."Timetable"."timeStart" ASC
  `

  if (!timetable.length) return []

  const startDate = timetable[0].dateStart
  const endDate = timetable[0].dateEnd
  const periods = timetable.filter((period) =>
    period.dateStart == startDate &&
    period.dateEnd == endDate
  )

  return {
    startDate: startDate,
    endDate: endDate,
    periods: periods.map((period) => ({
      id: period.id,
      dow: period.dow,
      timeStart: period.timeStart,
      timeEnd: period.timeEnd
    }))
  }
}

export async function GET(request) {
  const params = request.nextUrl.searchParams

  const userId = await currentUserId()
  const user = (await prisma.$queryRaw`
    SELECT
      "public"."User"."id",
      ST_X("public"."User"."addressPoint") AS "addressLong",
      ST_Y("public"."User"."addressPoint") AS "addressLat"
    FROM "public"."User"
    WHERE "public"."User"."id" = ${userId}
    LIMIT 1
  `)[0]

  const importantGroupIds = await getImportantGroups(user)
  const recommendedGroupIds = await getRecommendedGroups(user, params)
  let otherGroupIds = []
  if (recommendedGroupIds.length < groupsCount) {
    const limit = groupsCount - recommendedGroupIds.length
    otherGroupIds = await getOtherGroups(user, params, limit)
  }

  const groupIds = importantGroupIds + recommendedGroupIds + otherGroupIds

  const groups = await prisma.$queryRaw`
    SELECT
      "public"."Group"."id",
      "public"."Group"."address",
      "public"."Group"."categoryId",
    FROM "public"."Group"
    JOIN unnest('{${Prisma.join(groupIds)}}'::int[]) WITH ORDINALITY t(id, ord) USING (id)
    ORDER BY t.ord
  `

  return NextResponse.json(
    {
      groups: groups.map((group) => ({
        id: group.id,
        categories: getCategories(group.categoryId),
        address: group.address,
        timetable: getTimetable(group.id)
      })),
    },
    {
      status: 200
    }
  )
}
