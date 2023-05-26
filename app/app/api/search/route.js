import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { linearConversion } from "@/lib/utils";

const groupsCount = 10

export async function GET(request) {
  // const params = request.query
  // const user = currentUser()
  //
  // const cats0 = await prisma.$queryRaw(Prisma.sql`
  //   SELECT "public"."Category".*, "public"."Recommendation"."rank"
  //   FROM "public"."Category"
  //   JOIN "public"."Recommendation" ON
  //     "public"."Recommendation"."categoryId" = "public"."Category"."id" AND
  //     "public"."Recommendation"."userId" = ${user.id}
  //   WHERE "public"."Category"."level" = 0
  //   ORDER BY "public"."Recommendation"."rank"
  // `)
  //
  // const totalRank = cats0.reduce((a, b) => a + b, 0)
  // for (const cat of cats0) {
  //   cats0.limit = linearConversion([0, totalRank], [0, groupsCount], cat.rank)
  // }
  //
  // console.log(cats0)
  //
  // for (const cat0 of cats0) {
  //   const groups =
  // }

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
