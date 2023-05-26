'use client'

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import moment from "moment";
import { Button, Card, Chip, InputText, MultiSelect } from "@/components/primereact"

const directions = [
  { code: "sport", label: "Спорт" },
  { code: "language", label: "Язык" },
  { code: "physical", label: "Физическая активность"},
]

const locations = [
  {
    id: 1,
    label: "",
    items: [{ label: "Онлайн" }]
  },
  {
    label: "Район",
    items: [
      { id: 1, label: "Академический" },
      { id: 2, label: "Алексеевский" },
      { id: 3, label: "Алтуфьевский" },
      { id: 4, label: "Арбат" },
      { id: 5, label: "Аэропорт" },
      { id: 6, label: "Бабушкинский" },
      { id: 7, label: "Басманный" },
    ]
  },
  {
    label: "Станция метро",
    items: [
      { id: 11, label: "м. Домодедовская" },
      { id: 12, label: "м. Кантемировская" },
      { id: 13, label: "м. Каширская" },
      { id: 14, label: "м. Коломенская" },
      { id: 15, label: "м. Технопарк" },
      { id: 16, label: "м. Автозаводская" },
      { id: 17, label: "м. Павелецкая" },
    ]
  }
]

const dows = [
  { code: "MONDAY", label: "Понедельник" },
  { code: "TUESAY", label: "Вторник" },
  { code: "WENDSDAY", label: "Среда" },
  { code: "THURSDAY", label: "Четверг" },
  { code: "FRIDAY", label: "Пятница" },
  { code: "SATURDAY", label: "Суббота" },
  { code: "SUNDAY", label: "Воскресенье" },
]

const initialValues = {
  search: "",
  category: [],
  location: [],
  dow: [],
}

function formatDow(code) {
  switch (code) {
    case "MONDAY": return "Пн"
    case "TUESDAY": return "Вт"
    case "WENDSDAY": return "Ср"
    case "THURSDAY": return "Чт"
    case "FRIDAY": return "Пт"
    case "SATURDAY": return "Сб"
    case "SUNDAY": return "Вс"
  }
}

export default function Search() {
  const [groups, setGroups] = useState([])

  const getGroups = async (query) => {
    return fetch(`/api/search?${new URLSearchParams(query)}`)
      .then((response) => response.json())
      .then((data) => setGroups(data.groups))
  }

  useEffect(() => { getGroups(initialValues) }, [])

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: async (data) => {
      await getGroups(data)
      console.log(groups)
    }
  })

  return (
    <div className="max-w-full w-[850px] flex flex-col gap-4">
      <Card>
        <form
          className="flex flex-row flex-wrap justify-stretch gap-2 gap-y-8"
          onSubmit={formik.handleSubmit}
        >
          <div className="flex flex-col items-stretch flex-grow gap-8">
            <InputText
              id="search"
              name="search"
              className="flex-grow"
              placeholder="Поиск"
              value={formik.values.search}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <div className="flex flex-row flex-wrap justify-stretch w-full gap-2 gap-y-8">
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  id="direction"
                  name="direction"
                  className="w-full"
                  options={directions}
                  optionLabel="label"
                  showSelectAll={false}
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.direction}
                  onChange={formik.handleChange}
                  filter
                />
                <label htmlFor="direction">Направление</label>
              </span>
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  inputId="type"
                  name="type"
                  className="w-full"
                  options={locations}
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  optionLabel="label"
                  showSelectAll={false}
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  filter
                />
                <label htmlFor="type">Место проведения</label>
              </span>
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  id="dow"
                  name="dow"
                  className="w-full"
                  options={dows}
                  optionLabel="label"
                  showSelectAll={false}
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.dow}
                  onChange={formik.handleChange}
                />
                <label htmlFor="dow">Время проведения</label>
              </span>
            </div>
          </div>
          <div className="flex flex-col flex-grow items-stretch gap-8">
            <Button
              type="submit"
              label="Найти"
              loading={formik.isSubmitting}
            />
            <Button
              type="reset"
              label="Сбросить"
              onClick={() => formik.setValues(initialValues)}
              text
            />
          </div>
        </form>
      </Card>
      <div className="flex flex-row flex-wrap justify-between gap-4">
        {groups.map((group, index) => (
          <Card
            key={index}
            className="p-card-stretch flex-grow md:max-w-[50%]"
            title={
              <div className="flex flex-col">
                <h5 className="text-base font-semibold">{group.categories.at(-2)}</h5>
                <h2>{group.categories.at(-1)}</h2>
              </div>
            }
            subTitle={
              <div className="flex flex-row flex-wrap gap-2">
                { group.type == "OFFLINE" ?
                  <Chip label="Очное занятие" className="!text-sm !font-semibold" /> :
                  <Chip label="Онлайн занятие" className="!text-sm" />
                }
                { new Date(group.startDate) <= new Date() &&
                  <Chip label="Группа занимается" className="!text-sm" />
                }
              </div>
            }
            footer={
              <div className="flex flex-col gap-2">
                <Link
                  href="https://www.mos.ru/city/projects/dolgoletie/search/#class21083"
                  passHref
                >
                  <Button
                    label="Записаться"
                    className="w-full"
                  />
                </Link>
                <Link
                  href="https://www.mos.ru/city/projects/dolgoletie/search/#class21083"
                  passHref
                >
                  <Button
                    label="Узнать больше"
                    className="w-full"
                    outlined
                  />
                </Link>
              </div>
            }
          >
            <div className="flex flex-col justify-between gap-4 h-full">
              <div>
                <p>{group.address}</p>
              </div>
              <div>
                <p>
                  Занятия проводятся с
                  <span className="font-semibold ml-2">
                    {moment(group.startDate).format("DD.MM.YYYY")}
                  </span>
                </p>
                { group.timetable.map((time, index) => (
                  <p key={index}>
                    <span className="font-semibold mr-2">
                      {formatDow(time.dow)}
                    </span>
                    {`${time.timeStart} - ${time.timeEnd}`}
                  </p>
                )) }
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
