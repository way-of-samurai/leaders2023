import { redirect } from "next/navigation";
import { isUnauthenticated } from "@/lib/auth";

export default async function Questions() {
  if (await isUnauthenticated())
    redirect("/sign_in")

  redirect("/questions/1?dialog=1")
}
