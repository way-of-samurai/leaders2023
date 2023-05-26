import { redirect } from "next/navigation";
import { Card } from "@/components/primereact";
import SignInForm from "@/components/sign_in_form";
import { currentUser, isAuthenticated } from "@/lib/auth";

export default async function SignIn() {
  if (await isAuthenticated()) {
    const user = await currentUser()
    if (user.quizPassed) {
      redirect("/")
    } else {
      redirect("/questions/1?dialog=1")
    }
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
