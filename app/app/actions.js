'use server'
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import * as auth from "@/lib/auth"

export async function signIn(data) {
  const user = await prisma.user.upsert({
    where: {
      firstName_lastName_middleName_birthdate: {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        birthdate: new Date(data.birthdate),
      }
    },
    update: {},
    create: {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      birthdate: new Date(data.birthdate),
    }
  })

  await auth.signIn(user.id)

  if (user.quizPassed) {
    redirect("/")
  } else {
    redirect("/questions/1?dialog=1")
  }
}

export async function answerQuestion(data) {
  const user = await auth.currentUser()

  const question = await prisma.question.findUnique({
    where: { index: data.index }
  })

  await prisma.questionAnswer.upsert({
    where: {
      questionId_userId: {
        questionId: question.id,
        userId: user.id,
      }
    },
    update: { result: data.result },
    create: {
      questionId: question.id,
      userId: user.id,
      result: data.result,
    }
  })

  const nextQuestion = await prisma.question.findUnique({
    where: { index: question.index + 1 }
  })

  if (!nextQuestion) {
    await prisma.user.update({
      where: { id: user.id },
      data: { quizPassed: true }
    })
    redirect("/")
  } else {
    redirect(`/questions/${nextQuestion.index}`)
  }
}
