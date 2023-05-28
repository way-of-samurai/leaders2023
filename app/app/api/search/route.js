import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { groupBy, linearConversion } from "@/lib/utils";

const groupsCount = 10

async function buildFilters(params) {
  let filters = []

  if (params.query)
    filters.push(`cats.name ILIKE '${params.query}%'`)

  if (params.category && params.category.length) {
    const cats = await prisma.$queryRawUnsafe(`
      SELECT cats.id
      FROM "public"."Category" cats
      JOIN "public"."Category" cats2
        ON cats2.id = cats."parentId"
      JOIN "public"."Category" cats1
        ON cats1.id = cats2."parentId"
      WHERE cats.level = 3
        AND cats1.id IN (${params.category.join(",")})
    `)

    const ids = cats.map((cat) => cat.id)
    filters.push(`cats.id IN (${ids.join(",")})`)
  }

  if (params.location && params.location.length) {
    let subfilters = []
    const locs = groupBy(params.location, (loc) => loc.type)

    if (locs.ONLINE && locs.ONLINE.length)
      subfilters.push(`cats.type = 'ONLINE'`)

    if (locs.AREA && locs.AREA.length) {
      const ids = locs.AREA.map((loc) => loc.id)
      subfilters.push(`"public"."Group"."areaId" IN (${ids.join(",")})`)
    }

    if (locs.METRO && locs.METRO.length) {
      const ids = locs.METRO.map((loc) => loc.id)
      subfilters.push(`"public"."Group"."metroId" IN (${ids.join(",")})`)
    }

    if (subfilters.length)
      filters.push(`(${subfilters.join(" OR ")})`)
  }

  if (params.dow && params.dow.length)
    filters.push(`"public"."Timetable"."dow" IN (${params.dow.map((x) => `'${x}'`).join(",")})`)

  if (!filters.length) return ""

  return `AND ${filters.join(" AND ")}`
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

  const totalRank = cats0.map((cat) => cat.rank).reduce((a, b) => a + b, 0)

  for (const cat0 of cats0) {
    const limit = linearConversion([0, totalRank], [0, groupsCount], cat0.rank)
    groups = groups + await prisma.$queryRawUnsafe(`
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
    `)
  }

  return groups.map((group) => group.id)
}

async function getOtherGroups(user, params, limit) {
  const groups = await prisma.$queryRawUnsafe(`
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
  `)

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
      cats."description"
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

  const dateStart = timetable[0].dateStart
  const dateEnd = timetable[0].dateEnd
  const periods = timetable.filter((period) => (
    period.dateStart.getTime() === dateStart.getTime()
  ))

  return {
    dateStart: dateStart,
    dateEnd: dateEnd,
    periods: periods.map((period) => ({
      id: period.id,
      dow: period.dow,
      timeStart: period.timeStart,
      timeEnd: period.timeEnd
    }))
  }
}

export async function POST(request) {
  const params = await request.json()

  const userId = params.userId ? params.userId : await currentUserId()
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

  const groupIds = []
    .concat(importantGroupIds)
    .concat(recommendedGroupIds)
    .concat(otherGroupIds)

  let data = []
  if (groupIds.length) {
    const groups = await prisma.$queryRawUnsafe(`
      SELECT
        "public"."Group"."id",
        "public"."Group"."externalId",
        "public"."Group"."address",
        "public"."Group"."categoryId"
      FROM "public"."Group"
      JOIN unnest('{${groupIds.join(",")}}'::int[]) WITH ORDINALITY t(id, ord) USING (id)
      ORDER BY t.ord
    `)

    for (let i = 0; i < groups.length; i++) {
      groups[i].categories = await getCategories(groups[i].categoryId)
      groups[i].timetable = await getTimetable(groups[i].id)
    }

    data = groups.map((group) => ({
      id: group.id,
      externalId: group.externalId,
      categories: group.categories,
      address: group.address,
      timetable: group.timetable
    }))
  }

  return NextResponse.json(
    {
      groups: data,
    },
    {
      status: 200
    }
  )
}
