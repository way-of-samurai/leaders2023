'use client'
import Link from "next/link"
import { Button, Card, ProgressBar } from "@/components/primereact"
import QuestionsConfirmDialog from "@/components/questions_confirm_dialog";
import QuestionForm from "@/components/question_form"
import { Fragment } from "react";

export default function Question({ params }) {
  const totalQuestions = 5
  const question = {
    id: parseInt(params.id),
    question: "Что вам больше нравится?",
    description: "Выберите наиболее близкое вам по духу занятие",
    options: [
      "Вкусно и точка",
      "Спорт",
      "Ничего из перечисленного"
    ]
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      { question.id == 1 &&
        <QuestionsConfirmDialog />
      }
      <Card
        title={question.question}
        subTitle={question.description}
        className="max-w-full w-[550px] p-2"
        header={(
          <div>
            <div className="flex sm:hidden flex-row justify-start p-2">
              <Link href={`/questions/${question.id - 1}`} passHref>
                <Button
                  aria-label="Назад"
                  icon="pi pi-arrow-left !text-2xl"
                  link
                />
              </Link>
            </div>
            <div className="p-5">
              <ProgressBar
                value={question.id/totalQuestions*100}
                displayValueTemplate={() => (
                  <Fragment>
                    {question.id}&nbsp;/&nbsp;{totalQuestions}
                  </Fragment>
                )}
              />
            </div>
          </div>
        )}
      >
        <QuestionForm
          questionId={question.id}
          options={question.options}
        />
      </Card>
    </main>
  )
}
