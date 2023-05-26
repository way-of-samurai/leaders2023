import { notFound, redirect } from "next/navigation";
import QuestionsConfirmDialog from "@/components/questions_confirm_dialog";
import { prisma } from "@/lib/db";
import QuestionCard from "@/components/question_card";
import { currentUser, isUnauthenticated } from "@/lib/auth";

export default async function Question({ params, searchParams }) {
  if (await isUnauthenticated())
    redirect("/sign_in")

  const questionIndex = parseInt(params.id)
  if (!questionIndex) notFound()

  const question = await prisma.question.findUnique({
    where: { index: questionIndex },
    include: {
      options: {
        orderBy: { index: "asc" },
      }
    }
  })
  if (!question) notFound()

  const totalQuestions = await prisma.question.count()

  const answer = await prisma.questionAnswer.findUnique({
    where: {
      questionId_userId: {
        questionId: question.id,
        userId: (await currentUser()).id,
      }
    }
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      { (searchParams.dialog && question.index == 1) &&
        <QuestionsConfirmDialog />
      }
      <QuestionCard
        question={question}
        totalQuestions={totalQuestions}
        answer={answer}
      />
    </main>
  )
}
