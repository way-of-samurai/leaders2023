'use server'
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signIn(data) {
  await require('util').promisify(setTimeout)(1000)
  console.log(data)
  // cookies().set("token", "qwerty12345")
  redirect("/questions/1")
}

export async function answerQuestion(data) {
  await require('util').promisify(setTimeout)(1000)
  console.log(data)
  redirect(`/questions/${data.id + 1}`)
}
