'use client'

import { useState } from "react"
import { Button, Dialog } from "@/components/primereact"
import Link from "next/link";

export default function QuestionsConfirmDialog() {
  const [visible, setVisible] = useState(true);

  return (
    <Dialog
      header="Добро пожаловать!"
      className="max-w-full w-[700px] m-4"
      visible={visible}
      onHide={() => setVisible(false)}
      footer={(
        <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2">
          <Link
            href="/"
            className="flex flex-col"
            passHref
          >
            <Button
              label="Перейти к активностям"
              outlined
            />
          </Link>
          <Button
            label="Ответить на вопросы"
            onClick={() => setVisible(false)}
            autoFocus
          />
        </div>
      )}
    >
      <p className="m-0">
        Мы рады приветсвовать Вас в нашей системе подбора активностей.
        <br />
        Вы можете помочь нам подобрать для Вас наиболее подходящие активности,
        ответив всего на несколько вопросов.
        <br />
        Если вы хотите сразу перейти к рекомендациям,
        нажмите &quot;Перейти к активностям&quot;.
      </p>
    </Dialog>
  )
}
