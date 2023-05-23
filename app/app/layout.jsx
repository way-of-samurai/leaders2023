import './globals.css'
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css"
import 'primeicons/primeicons.css';

export const metadata = {
  title: "ЛЦТ 2023",
  description: "ЛЦТ 2023 Путь Самурая",
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
