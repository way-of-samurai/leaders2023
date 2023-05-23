'use client'

import { useState } from "react";
import { Button, Card, Chip, InputText, MultiSelect } from "@/components/primereact"
import { useFormik } from "formik";
import Link from "next/link";

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

const times = [
  { id: "monday", label: "Понедельник" },
  { id: "tuesay", label: "Вторник" },
  { id: "wednesday", label: "Среда" },
  { id: "thursday", label: "Четверг" },
  { id: "friday", label: "Пятница" },
  { id: "saturday", label: "Суббота" },
  { id: "sunday", label: "Воскресенье" },
]

export default function Search() {
  // const [activities, setAcitivites] = useState([])
  const activities = [
    {
      directions: ["Образование"],
      name: "Английский язык",
      isOnline: false,
      address: "город Москва, улица Мусы Джалиля, улица Мусы Джалиля, дом 25А",
      time: "Вт 11:15-13:15"
    },
    {
      directions: ["Образование"],
      name: "Английский язык",
      isOnline: true,
      address: "город Москва, дом 25А",
      time: "Вт 11:15-13:15"
    },
    {
      directions: ["Образование"],
      name: "Английский язык",
      isOnline: false,
      address: "город Москва, улица Мусы Джалиля, дом 25А",
      time: "Вт 11:15-13:15"
    }
  ]
  const initialValues = {
      search: "",
      direction: [],
      location: [],
      time: [],
  }
  const formik = useFormik({
    initialValues: initialValues,
    onSubmit: (data) => {
      console.log(data)
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
                <label htmlFor="direction">Место проведения</label>
              </span>
              <span className="p-float-label flex-grow min-w-[200px]">
                <MultiSelect
                  id="time"
                  name="time"
                  className="w-full"
                  options={times}
                  optionLabel="label"
                  showSelectAll={false}
                  maxSelectedLabels={2}
                  selectedItemsLabel="{0} выбрано"
                  value={formik.values.time}
                  onChange={formik.handleChange}
                />
                <label htmlFor="direction">Время проведения</label>
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
        {activities.map((activity, index) => (
          <Card
            key={index}
            className="p-card-stretch flex-grow md:max-w-[50%]"
            title={
              <div className="flex flex-col">
                <h5 className="text-base font-semibold">{activity.directions[0]}</h5>
                <h2>{activity.name}</h2>
              </div>
            }
            subTitle={
              <div className="flex flex-row flex-wrap gap-2">
                { activity.isOnline ?
                  <Chip label="Онлайн занятие" className="!text-sm" /> :
                  <Chip label="Очное занятие" className="!text-sm !font-semibold" />
                }
                <Chip label="Группа занимается" className="!text-sm" />
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
                <p>{activity.address}</p>
              </div>
              <div>
                <p>{activity.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
