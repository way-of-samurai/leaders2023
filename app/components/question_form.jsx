'use client'

import { useTransition } from "react";
import { useFormik } from "formik"
import { answerQuestion } from "@/app/actions"
import { Button, Checkbox } from "@/components/primereact"
import Link from "next/link";

export default function QuestionForm({ questionId, options }) {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: { options: [] },
    onSubmit: (data) => {
      startTransition(() => answerQuestion({
        id: questionId,
        answer: data.options,
      }))
    }
  })

  return (
    <form
      className="flex flex-col justify-stretch gap-6"
      onSubmit={formik.handleSubmit}
    >
      {options.map((option, index) => (
        <div
          key={index}
          className="flex flex-row flex-nowrap justify-start items-center gap-3"
        >
          <Checkbox
            inputId={`option${index}`}
            name="options"
            value={index}
            checked={formik.values.options.includes(index)}
            onChange={(e) => {
              let opts = [...formik.values.options];

              if (e.checked)
                opts.push(e.value);
              else
                opts.splice(opts.indexOf(e.value), 1);

              formik.setFieldValue("options", opts);
            }}
          />
          <label htmlFor={`option${index}`}>{option}</label>
        </div>
      ))}

      <div className="flex flex-row flex-wrap justify-between mt-6">
        <Link
          href={`/questions/${questionId - 1}`}
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
        <Button
          type="submit"
          label="Продолжить"
          className="w-full sm:w-fit"
          loading={isPending}
          disabled={formik.values.options.length == 0}
        />
      </div>
    </form>
  )
}
