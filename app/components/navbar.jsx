'use client'

import { Button } from "@/components/primereact";

export default function Navbar({ user }) {
  return (
    <nav className="p-card flex flex-row justify-between items-center p-4 mx-4">
      <h2 className="text-xl text-center align-middle">
        <i className="pi pi-user !text-2xl mr-3"></i>
        {[user.lastName, user.firstName, user.middleName].join(" ")}
      </h2>
      <Button
        label="Выйти"
        onClick={() => {
          document.cookie = "token="
          window.location.replace("/sign_in")
        }}
      />
    </nav>
  )
}
