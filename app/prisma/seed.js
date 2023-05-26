const { Gender, PrismaClient } = require("@prisma/client")
const faker = require("@faker-js/faker").fakerRU;

const prisma = new PrismaClient()

async function users() {
  await prisma.user.upsert({
    where: {
      firstName_lastName_middleName_birthdate: {
        firstName: "ЛЦТ",
        lastName: "2023",
        middleName: "",
        birthdate: new Date("1967-01-12"),
      },
    },
    update: {},
    create: {
      firstName: "ЛЦТ",
      lastName: "2023",
      middleName: "",
      gender: Gender.FEMALE,
      birthdate: new Date("1967-01-12"),
    }
  })
}

async function questionOptions(questionId) {
  for (let i = 1; i <= 5; i++)
  await prisma.questionOption.upsert({
    where: {
      questionId_index: { questionId: questionId, index: i },
    },
    update: {},
    create: {
      index: i,
      questionId: questionId,
      name: faker.commerce.productAdjective(),
    }
  })
}

async function questions() {
  for (let i = 1; i <= 5; i++) {
    const res = await prisma.question.upsert({
      where: { index: i },
      update: {},
      create: {
        index: i,
        title: faker.commerce.productName() + '?',
        description: faker.commerce.productDescription(),
      }
    })
    await questionOptions(res.id)
  }
}

async function main() {
  await users()
  await questions()
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
