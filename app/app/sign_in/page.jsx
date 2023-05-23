import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@/components/primereact";
import SignInForm from "@/components/sign_in_form";

export default function SignIn() {
  if (cookies().has("token")) {
    redirect("/")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card
        title="Добро пожаловать"
        subTitle="Пожалуйста, введите Ваши ФИО и дату рождения"
        className="max-w-full w-[450px]"
      >
        <SignInForm />
      </Card>
    </main>
  )
}
