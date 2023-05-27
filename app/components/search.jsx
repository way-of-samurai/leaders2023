'use client'

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import Link from "next/link";
import moment from "moment";
import { Button, Card, Chip, InputText, MultiSelect } from "@/components/primereact"

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
  query: "",
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
  const [categories, setCategories] = useState([])
  const [locations, setLocations] = useState([])

  const getGroups = async (query) => {
    return fetch(`/api/search?${new URLSearchParams(query)}`)
      .then((response) => response.json())
      .then((data) => setGroups(data.groups))
  }

  const getCategories = async () => {
    return fetch(`/api/categories`)
      .then((response) => response.json())
      .then((data) => setCategories(data.categories))
  }

  const getLocations = async () => {
    return fetch(`/api/locations`)
      .then((response) => response.json())
      .then((data) => setLocations([
        {
          name: "",
          items: [{ id: 0, type: "ONLINE", name: "Онлайн" }]
        },
        {
          name: "Район",
          items: data.locations.filter((loc) => loc.type == "AREA")
        },
        {
          name: "Станция метро",
          items: data.locations.filter((loc) => loc.type = "METRO")
        }
      ]))
  }

  useEffect(() => { getGroups(initialValues) }, [])
  useEffect(() => { getCategories(initialValues) }, [])
  useEffect(() => { getLocations(initialValues) }, [])

  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: async (data) => {
      await getGroups(data)
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
              id="query"
              name="query"
              className="flex-grow"
              placeholder="Поиск"
              value={formik.values.query}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <div className="flex flex-row flex-wrap justify-stretch w-full gap-2 gap-y-8">
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  id="category"
                  name="category"
                  className="w-full"
                  options={categories}
                  optionLabel="name"
                  optionValue="id"
                  showSelectAll={false}
                  maxSelectedLabels={1}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  filter
                />
                <label htmlFor="direction">Направление</label>
              </span>
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  inputId="location"
                  name="location"
                  className="w-full"
                  options={locations}
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  optionLabel="name"
                  showSelectAll={false}
                  maxSelectedLabels={1}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.location}
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
                  optionValue="code"
                  showSelectAll={false}
                  maxSelectedLabels={1}
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
        {groups.map((group) => (
          <Card
            key={group.id}
            className="p-card-stretch flex-grow md:max-w-[50%]"
            title={
              <div className="flex flex-col">
                <h5 className="text-base font-semibold">{group.categories.at(-2).name}</h5>
                <h2>{group.categories.at(-1).name}</h2>
              </div>
            }
            subTitle={
              <div className="flex flex-row flex-wrap gap-2">
                { group.categories.at(-1).type == "OFFLINE" ?
                  <Chip label="Очное занятие" className="!text-sm !font-semibold" /> :
                  <Chip label="Онлайн занятие" className="!text-sm" />
                }
                { new Date(group.timetable.dateStart) <= new Date() &&
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
                    {moment(group.timetable.dateStart).format("DD.MM.YYYY")}
                  </span>
                </p>
                { group.timetable.periods.map((period) => (
                  <p key={period.id}>
                    <span className="font-semibold mr-2">
                      {formatDow(period.dow)}
                    </span>
                    {`${period.timeStart} - ${period.timeEnd}`}
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
