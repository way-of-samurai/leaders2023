'use client'
import * as Yup from "yup";
import { useFormik } from "formik";
import { useTransition } from "react";
import { Button, Calendar, InputText } from "@/components/primereact";
import { signIn } from "@/app/actions";

const SignInSchema = Yup.object().shape({
  lastName: Yup.string()
    .required("Пожалуйста, укажите Вашу фамилию"),
  firstName: Yup.string()
    .required("Пожалуйста, укажите Ваше имя"),
  birthdate: Yup.date()
    .typeError("Введенная дата рождения не является верной")
    .min(new Date(1900, 1, 1), "Введенная дата рождения не является верной")
    .max(new Date(), "Введенная дата рождения не является верной")
    .required("Пожалуйста, укажите Вашу дату рождения"),
})

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const formik = useFormik({
    initialValues: {
      lastName: "",
      firstName: "",
      middleName: "",
      birthdate: "",
    },
    validationSchema: SignInSchema,
    onSubmit: (data) => {
      startTransition(() => signIn({
        ...data,
        birthdate: new Date(data.birthdate)
      }))
    }
  })

  const isInvalid = (name) => !!(formik.touched[name] && formik.errors[name])
  const errorMessage = (name) =>
    isInvalid(name) ?
      <small className="p-error">{formik.errors[name]}</small> : null

  return (
    <form
      className="flex flex-col items-stretch gap-6"
      onSubmit={formik.handleSubmit}
    >
      <div>
        <span className="p-float-label w-full">
          <InputText
            id="lastName"
            name="lastName"
            className={[
              "w-full",
              isInvalid("lastName") ? "p-invalid" : null
            ].join(" ")}
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            tooltip="Введите Вашу фамилию"
          />
          <label htmlFor="lastName">Фамилия</label>
        </span>
        {errorMessage("lastName")}
      </div>

      <div>
        <span className="p-float-label w-full">
          <InputText
            id="firstName"
            name="firstName"
            className={[
              "w-full",
              isInvalid("firstName") ? "p-invalid" : null
            ].join(" ")}
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            tooltip="Введите Ваше имя"
          />
          <label htmlFor="firstName">Имя</label>
        </span>
        {errorMessage("firstName")}
      </div>

      <div>
        <span className="p-float-label w-full">
          <InputText
            id="middleName"
            name="middleName"
            className={[
              "w-full",
              isInvalid("middleName") ? "p-invalid" : null
            ].join(" ")}
            value={formik.values.middleName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            tooltip="Введите Ваше отчество"
          />
          <label htmlFor="middleName">Отчество</label>
        </span>
        {errorMessage("middleName")}
      </div>

      <div>
        <span className="p-float-label w-full">
          <Calendar
            inputId="birthdate"
            name="birthdate"
            className={[
              "w-full",
              isInvalid("birthdate") ? "p-invalid" : null
            ].join(" ")}
            maxDate={new Date()}
            keepInvalid={true}
            placeholder="04.05.1960"
            value={formik.values.birthdate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            tooltip="Укажите Вашу дату рождения"
          />
          <label htmlFor="birthdate">Дата рождения</label>
        </span>
        {errorMessage("birthdate")}
      </div>

      <div className="mt-3">
        <Button
          className="w-full"
          type="submit"
          label="Продолжить"
          loading={isPending}
          disabled={!formik.isValid || !formik.dirty}
        />
      </div>
    </form>
  )
}
