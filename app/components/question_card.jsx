'use client'

import { Fragment, useTransition } from "react";
import Link from "next/link"
import { useFormik } from "formik"
import { Button, Card, Checkbox, ProgressBar } from "@/components/primereact"
import { answerQuestion } from "@/app/actions"

export default function QuestionCard({ question, totalQuestions, answer }) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: {
      options: answer?.result ?? question.options.map(() => false)
    },
    onSubmit: (data) => {
      startTransition(() => answerQuestion({
        index: question.index,
        result: data.options,
      }))
    }
  })

  const hasPrev = question.index > 1

  return (
    <Card
      title={question.title}
      subTitle={question.description}
      className="max-w-full w-[550px] p-2"
      header={(
        <div>
          <div className="flex sm:hidden flex-row justify-start p-2 h-16">
            { hasPrev &&
              <Link href={`/questions/${question.index - 1}`} passHref>
                <Button
                  aria-label="Назад"
                  icon="pi pi-arrow-left !text-2xl"
                  link
                />
              </Link>
            }
          </div>
          <div className="p-5">
            <ProgressBar
              value={question.index/totalQuestions*100}
              displayValueTemplate={() => (
                <Fragment>
                  {question.index}&nbsp;/&nbsp;{totalQuestions}
                </Fragment>
              )}
            />
          </div>
        </div>
      )}
    >
      <form
        className="flex flex-col justify-stretch gap-6"
        onSubmit={formik.handleSubmit}
      >
        {question.options.map((option) => (
          <div
            key={option.index}
            className="flex flex-row flex-nowrap justify-start items-center gap-3"
          >
            <Checkbox
              inputId={`option${option.index}`}
              name="options"
              value={option.index}
              checked={formik.values.options[option.index - 1]}
              onChange={(e) => {
                let opts = [...formik.values.options];
                opts[option.index - 1] = e.checked
                formik.setFieldValue("options", opts);
              }}
            />
            <label htmlFor={`option${option.index}`}>{option.name}</label>
          </div>
        ))}

        <div className="flex flex-row flex-wrap justify-between mt-6">
          { hasPrev ?
            <Link
              href={`/questions/${question.index - 1}`}
              className="hidden sm:block"
              passHref
            >
              <Button
                label="Назад"
                className="!pl-0"
                icon="pi pi-angle-left"
                link
              />
            </Link>
            :
            <div></div>
          }
          <Button
            type="submit"
            label="Продолжить"
            className="w-full sm:w-fit self-end"
            loading={isPending}
            disabled={formik.values.options.every((opt) => !opt)}
          />
        </div>
      </form>
    </Card>
  )
}
