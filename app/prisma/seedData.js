const { PrismaClient } = require("@prisma/client")
const Promise = require("promise")
const moment = require("moment")
const fs = require("fs")
const { parse } = require("csv-parse/sync")

const prisma = new PrismaClient()
// const prisma = new PrismaClient({log: ["query"]})

const areas = [
  "Академический",
  "Алексеевский",
  "Алтуфьевский",
  "Арбат",
  "Аэропорт",
  "Бабушкинский",
  "Басманный",
  "Беговой",
  "Бескудниковский",
  "Бибирево",
  "Бирюлево Восточное",
  "Бирюлево Западное",
  "Богородское",
  "Братеево",
  "Бутово Северное",
  "Бутово Южное",
  "Бутырский",
  "Вешняки",
  "Внуково",
  "Войковский",
  "Восточный",
  "Выхино-Жулебино",
  "Гагаринский",
  "Головинский",
  "Гольяново",
  "Даниловский",
  "Дегунино Восточное",
  "Дегунино Западное",
  "Дмитровский",
  "Донской",
  "Дорогомилово",
  "Замоскворечье",
  "Зюзино",
  "Зябликово",
  "Ивановское",
  "Измайлово Восточное",
  "Измайлово",
  "Измайлово Северное",
  "Капотня",
  "Коньково",
  "Коптево",
  "Косино-Ухтомский",
  "Котловка",
  "Красносельский",
  "Крылатское",
  "Крюково",
  "Кузьминки",
  "Кунцево",
  "Куркино",
  "Левобережный",
  "Лефортово",
  "Лианозово",
  "Ломоносовский",
  "Лосиноостровский",
  "Люблино",
  "Марфино",
  "Марьина роща",
  "Марьино",
  "Матушкино",
  "Медведково Северное",
  "Медведково Южное",
  "Метрогородок",
  "Мещанский",
  "Митино",
  "Можайский",
  "Молжаниновский",
  "Москворечье-Сабурово",
  "Нагатино-Садовники",
  "Нагатинский затон",
  "Нагорный",
  "Некрасовка",
  "Нижегородский",
  "Ново-Переделкино",
  "Новогиреево",
  "Новокосино",
  "Обручевский",
  "Орехово-Борисово Северное",
  "Орехово-Борисово Южное",
  "Останкинский",
  "Отрадное",
  "Очаково-Матвеевское",
  "Перово",
  "Печатники",
  "Покровское-Стрешнево",
  "Преображенское",
  "Пресненский",
  "Проспект Вернадского",
  "Раменки",
  "Ростокино",
  "Рязанский",
  "Савелки",
  "Савеловский",
  "Свиблово",
  "Северный",
  "Силино",
  "Сокол",
  "Соколиная гора",
  "Сокольники",
  "Солнцево",
  "Старое Крюково",
  "Строгино",
  "Таганский",
  "Тверской",
  "Текстильщики",
  "Теплый Стан",
  "Тимирязевский",
  "Тропарево-Никулино",
  "Тушино Северное",
  "Тушино Южное",
  "Филевский парк",
  "Фили-Давыдково",
  "Хамовники",
  "Ховрино",
  "Хорошево-Мневники",
  "Хорошевский",
  "Царицыно",
  "Черемушки",
  "Чертаново Северное",
  "Чертаново Центральное",
  "Чертаново Южное",
  "Щукино",
  "Южнопортовый",
  "Якиманка",
  "Ярославский",
  "Ясенево",
]

const questions = [
  {
    title: "Как вы предпочитаете проводить свободное время?",
    options: [
      "Читать книги или смотреть фильмы",
      "Заниматься физическими упражнениями или спортом",
      "Общаться с друзьями и близкими",
      "Заниматься рукоделием или другими хобби"
    ]
  },
  {
    title: "Какие типы путешествий вы предпочитаете?",
    options: [
      "Пляжный отдых",
      "Экскурсионные туры",
      "Круизы",
      "Путешествия на автомобиле/кемпере",
      "Путешествия не для меня"
    ]
  },
  {
    title: "Какие виды культурных мероприятий вы предпочитаете?",
    options: [
      "Театральные постановки",
      "Концерты классической музыки",
      "Выставки и музеи",
      "Кинофильмы и кинопремьеры",
      "Не люблю посещать культурные мероприятия"
    ]
  },
  {
    title: "Какие виды общения вы предпочитаете?",
    options: [
      "Общение с друзьями и близкими",
      "Участие в клубах и организациях по интересам",
      "Общение в социальных сетях и мессенджерах",
      "Участие в культурных мероприятиях и экскурсиях"
    ]
  },
  {
    title: "Владельцем каких домашних животных вы когда-либо являлись?",
    options: [
      "Кошка",
      "Собака",
      "Пернатые",
      "Не люблю домашних животных и не хочу иметь с ними дело"
    ]
  },
]

function getDow(str) {
  if (str.includes("Пн.")) return "MONDAY"
  if (str.includes("Вт.")) return "TUESDAY"
  if (str.includes("Ср.")) return "WENDSDAY"
  if (str.includes("Чт.")) return "THURSDAY"
  if (str.includes("Пт.")) return "FRIDAY"
  if (str.includes("Сб.")) return "SATURDAY"
  if (str.includes("Вс.")) return "SUNDAY"
  return null
}

function groupBy(arr, fn) {
  return arr.reduce((group, e) => {
    const attr = fn(e)
    group[attr] = group[attr] ?? []
    group[attr].push(e)
    return group
  }, {})
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function seedAreas() {
  const values = areas
    .map(area => `('AREA', '${area}')`)
    .join(',')

  await prisma.$executeRawUnsafe(`
    INSERT INTO "public"."Location"("type", "name")
    VALUES ${values}
  `)
}

async function seedMetro() {
  const rawdata = fs.readFileSync("./prisma/data/metro.json")
  const data = JSON.parse(rawdata)
  const exits = groupBy(data, (v) => v.NameOfStation)
  const stations = Object.keys(exits).sort()
  const values = stations.map((station) => {
    const exitsCount = exits[station].length
    const longs = exits[station].map((sd) => parseFloat(sd.Longitude_WGS84))
    const lats = exits[station].map((sd) => parseFloat(sd.Latitude_WGS84))
    const avgLong = longs.reduce((a, b) => a + b, 0) / exitsCount
    const avgLat = lats.reduce((a, b) => a + b, 0) / exitsCount

    return `(
      'METRO',
      '${station}',
      ST_SetSRID(ST_MakePoint(${avgLong}, ${avgLat}), 4326)
    )`
  }).join(',')

  await prisma.$executeRawUnsafe(`
    INSERT INTO "public"."Location"("type", "name", "point")
    VALUES ${values}
  `)
}

async function findAddr(addr) {
  const params = new URLSearchParams({ q: addr, format: "json" })
  const resp = await fetch(`http://localhost:8080/search.php?${params}`)
  if (resp.status != 200)
    throw `OSM response status: ${resp.status}`

  const data = await resp.json()
  if (!data.length) {
    return null
  }

  return data[0]
}

async function seedGroups() {
  const getCoords = async (address) => {
    let addr = address.split(",").map((s) => s.trim())

    let startIndexes = []
    addr.forEach((s, index) => {
      if (s.includes("город") ||
          s.includes("г.") ||
          s.includes("Москва")) {
        startIndexes.push(index)
      }
    })
    if (startIndexes.length > 1) {
      addr = addr.slice(0, startIndexes[1])
    }

    const city = (addr.find((s) =>
        s.includes("город") ||
        s.includes("г.") ||
        s.includes("Москва")
      ) ?? "")
      .replaceAll("город", "")
      .replaceAll("г.", "")
      .trim() || "Москва"

    const street = (addr.find((s) =>
        s.includes("улица") ||
        s.includes("ул.") ||
        s.includes("бульвар") ||
        s.includes("проспект") ||
        s.includes("просек")
      ) ?? "")
      .replaceAll("улица", "")
      .replaceAll("ул.", "")
      .replaceAll("бульвар", "")
      .replaceAll("проспект", "")
      .replaceAll("просек", "")
      .trim()

    const building = (addr.find((s) =>
        s.includes("дом") ||
        s.includes("д.")
      ) ?? "")
      .replaceAll("дом", "")
      .replaceAll("д.", "")
      .trim()

    const number1 = (addr.find((s) =>
        s.includes("корпус") ||
        s.includes("к.")
      ) ?? "")
      .replaceAll("корпус", "")
      .replaceAll("к.", "")
      .trim()

    const number2 = (addr.find((s) =>
        s.includes("строение") ||
        s.includes("стр.")
      ) ?? "")
      .replaceAll("строение", "")
      .replaceAll("стр.", "")
      .trim()

    let q = [
      city,
      street,
      building
    ].filter((x) => x).join(", ")
    if (number1) q += `/${number1}`
    if (number2) q += ` с${number2}`

    let obj = await findAddr(q)
    if (!obj) {
      q = [
        city,
        street,
        building
      ].filter((x) => x).join(", ")

      obj = await findAddr(q)
      if (!obj) {
        q = [
          city,
          street
        ].filter((x) => x).join(", ")

        obj = await findAddr(q)
        if (!obj) {
          q = city
          obj = await findAddr(q)
          if (!obj)
            console.warn(`Coords ${q} not found: ${address}`)
            return {
              long: 37.6063916,
              lat: 55.625578
            }
        }
      }
    }

    return {
      long: parseFloat(obj.lon),
      lat: parseFloat(obj.lat),
    }
  }

  const getCategoryId = async (names) => {
    // const catNames = names.map((n) => n.replace("ОНЛАЙН", "").trim())
    const catNames = names.map((n) => n.trim())
    const cats = await prisma.$queryRaw`
      SELECT cats3."id"
      FROM "public"."Category" cats3
      JOIN "public"."Category" cats2
        ON cats2."id" = cats3."parentId"
      JOIN "public"."Category" cats1
        ON cats1."id" = cats2."parentId"
      WHERE cats3."level" = 3
        AND cats3."name" ILIKE ${`%${catNames[2]}%`}
        AND cats2."name" ILIKE ${`%${catNames[1]}%`}
        AND cats1."name" ILIKE ${`%${catNames[0]}%`}
    `
    if (!cats.length) {
      console.warn(`Failed to get category for: ${names}`)
      return null
    }

    return cats[0].id
  }

  const getAreaId = async (areaName) => {
    const names = areaName
      .split(",")
      .filter((n) => n.includes("муниципальный округ"))
      .map((n) => n.replace("муниципальный округ", "").trim())
    if (!names.length) return null

    let name = names[0]
    if (name.includes("Восточное"))
      name = name.replace("Восточное", "").trim() + " Восточное"
    if (name.includes("Западное"))
      name = name.replace("Западное", "").trim() + " Западное"
    if (name.includes("Северное"))
      name = name.replace("Северное", "").trim() + " Северное"
    if (name.includes("Южное"))
      name = name.replace("Южное", "").trim() + " Южное"

    const locs = await prisma.$queryRaw`
      SELECT locs."id"
      FROM "public"."Location" locs
      WHERE locs."type" = 'AREA'
        AND locs."name" ILIKE ${`%${name}%`}
    `
    if (!locs.length) {
      console.warn(`Area ${name} not found: ${areaName}`)
      return null
    }

    return locs[0].id
  }

  const getMetroId = async (long, lat) => {
    const locs = await prisma.$queryRaw`
      SELECT locs."id"
      FROM (
        SELECT
        "public"."Location"."id",
          ST_DistanceSphere(
            ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326),
            "public"."Location"."point"
          ) AS distance
        FROM "public"."Location"
        WHERE "public"."Location"."type" = 'METRO'
      ) locs
      WHERE locs."distance" IS NOT NULL
        AND locs."distance" < 2000
      ORDER BY locs."distance" ASC
      LIMIT 1
    `
    if (!locs.length) {
      console.warn(`Metro not found for: (${long}, ${lat})`)
      return null
    }

    return locs[0].id
  }

  const getTimetable = async (str) => {
    if (!str.trim()) return []

    let periods = []

    str.trim().split(";").map((x) => x.trim()).forEach((pStr) => {
      const data = pStr.split(",").map((x) => x.trim())
      const [dateStart, dateEnd] = data[0]
        .replaceAll("с", "")
        .replaceAll("c", "")
        .replaceAll("по ", "")
        .trim()
        .split(" ")
        .map((x) => moment.utc(x.trim(), "DD.MM.YYYY"))

      let dows = []
      for (let i = 1; i < data.length; i++) {
        const dow = getDow(data[i])
        if (dow) dows.push(dow)
      }

      let timeStart = null
      let timeEnd = null
      for (let i = 1; i < data.length; i++) {
        if(data[i].includes("без перерыва")) continue

        const timeStr = data[i]
          .replaceAll("Пн.", "")
          .replaceAll("Вт.", "")
          .replaceAll("Ср.", "")
          .replaceAll("Чт.", "")
          .replaceAll("Пт.", "")
          .replaceAll("Сб.", "")
          .replaceAll("Вс.", "")
          .trim()
        if (timeStr) {
          [timeStart, timeEnd] = timeStr.split("-").map((x) => moment(x.trim(), "HH:mm"))
        }
      }

      if (dateStart && dateEnd && dows.length && timeStart && timeEnd) {
        dows.forEach((dow) => {
          periods.push({
            dateStart: dateStart,
            dateEnd: dateEnd,
            dow: dow,
            timeStart: timeStart,
            timeEnd: timeEnd,
          })
        })
      }
    })

    if (!periods.length)
      throw `Failed to parse Timetable: ${str}`

    return periods
  }

  const data = fs.readFileSync("./prisma/data/groups.csv")
  const rows = parse(data, { delimeter: ",", from_line: 2 })
  for (const row of rows) {
    const categoryId = await getCategoryId([row[1], row[2], row[3]])
    if (!categoryId) continue
    const { long, lat } = await getCoords(row[4])
    const areaId = await getAreaId(row[6])
    const metroId = await getMetroId(long, lat)

    await prisma.$executeRawUnsafe(`
      INSERT INTO "public"."Group"(
        "externalId", "categoryId", "address",
        "district", "areaId", "metroId", "addressPoint"
      )
      VALUES
        (
          ${row[0]},
          ${categoryId},
          '${row[4]}',
          '${row[5] ? row[5].split(",")[0].trim() : "NULL"}',
          ${areaId ?? "NULL"},
          ${metroId ?? "NULL"},
          ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
        )
    `)

    const group = await prisma.group.findUnique({
      where: { externalId: parseInt(row[0]) }
    })
    const timetable = await getTimetable(row[7])
    if (timetable.length) {
      const values = timetable.map((period) => {
        return `(
          ${group.id},
          'ACTIVE',
          '${moment(period.dateStart).format("YYYY-MM-DD")}',
          '${moment(period.dateEnd).format("YYYY-MM-DD")}',
          '${period.dow}',
          '${moment(period.timeStart).format("HH:mm:ss")}',
          '${moment(period.timeEnd).format("HH:mm:ss")}'
        )`
      }).join(',')

      await prisma.$executeRawUnsafe(`
        INSERT INTO "public"."Timetable"(
          "groupId", "type", "dateStart", "dateEnd",
          "dow", "timeStart", "timeEnd")
        VALUES ${values}
      `)
    }
    await delay(50)
  }
}

async function seedUsers() {
  const getGender = (str) => {
    if (str.includes("Мужчина")) return "MALE"
    return "FEMALE"
  }

  const getCoords = async (address) => {
    let addr = address
    if (address.startsWith('"')) addr = addr.slice(1, -1)

    addr = addr.split(",").map((s) => s.trim())

    const city = (addr.find((s) =>
        s.includes("город") ||
        s.includes("г.") ||
        s.includes("Москва")
      ) ?? addr[0])
      .replaceAll("город", "")
      .replaceAll("г.", "")
      .trim() || "Москва"

    const street = (addr.find((s) =>
        s.includes("улица") ||
        s.includes("ул.") ||
        s.includes("бульвар") ||
        s.includes("проспект") ||
        s.includes("просек")
      ) ?? addr[1])
      .replaceAll("улица", "")
      .replaceAll("ул.", "")
      .replaceAll("бульвар", "")
      .replaceAll("проспект", "")
      .replaceAll("просек", "")
      .trim()

    const building = (addr.find((s) =>
        s.includes("дом") ||
        s.includes("д.")
      ) ?? "")
      .replaceAll("дом", "")
      .replaceAll("д.", "")
      .trim()

    const number1 = (addr.find((s) =>
        s.includes("корпус") ||
        s.includes("к.")
      ) ?? "")
      .replaceAll("корпус", "")
      .replaceAll("к.", "")
      .trim()

    const number2 = (addr.find((s) =>
        s.includes("строение") ||
        s.includes("стр.")
      ) ?? "")
      .replaceAll("строение", "")
      .replaceAll("стр.", "")
      .trim()

    let q = [
      city,
      street,
      building
    ].filter((x) => x).join(", ")
    if (number1) q += `/${number1}`
    if (number2) q += ` с${number2}`

    let obj = await findAddr(q)
    if (!obj) {
      q = [
        city,
        street,
        building
      ].filter((x) => x).join(", ")

      obj = await findAddr(q)
      if (!obj) {
        q = [
          city,
          street
        ].filter((x) => x).join(", ")

        obj = await findAddr(q)
        if (!obj) {
          q = city
          obj = await findAddr(q)
          if (!obj)
            console.warn(`Coords ${q} not found: ${address}`)
            return {
              long: 37.6063916,
              lat: 55.625578
            }
        }
      }
    }

    return {
      long: parseFloat(obj.lon),
      lat: parseFloat(obj.lat),
    }
  }

  const data = fs.readFileSync("./prisma/data/users.csv")
  const rows = parse(data, { delimeter: ",", from_line: 2 })
  for (const row of rows) {
    const { long, lat } = await getCoords(row[4])
    const gender = getGender(row[2])

    await prisma.$executeRawUnsafe(`
      INSERT INTO "public"."User"(
        "externalId", "firstName", "lastName", "middleName",
        "gender", "birthdate", "address", "addressPoint"
      )
      VALUES
        (
          ${row[0]},
          '${row[0]}',
          '${row[0]}',
          '${row[0]}',
          '${gender}',
          '${row[3]}',
          '${row[4]}',
          ST_SetSRID(ST_MakePoint(${long}, ${lat}), 4326)
        )
    `)
    await delay(50)
  }
}

async function seedQuestions() {
  questions.forEach(async (q, i) => {
    const res = await prisma.question.upsert({
      where: { index: i+1 },
      update: {
        title: q.title,
      },
      create: {
        index: i+1,
        title: q.title,
      }
    })

    q.options.forEach(async (opt, idx) => {
      await prisma.questionOption.upsert({
        where: {
          questionId_index: { questionId: res.id, index: idx+1 },
        },
        update: {
          name: opt,
        },
        create: {
          index: idx+1,
          questionId: res.id,
          name: opt,
        }
      })
    })
  })
}

async function main() {
  // await seedAreas()
  // await seedMetro()
  // await seedQuestions()
  // await seedGroups()
  await seedUsers()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
