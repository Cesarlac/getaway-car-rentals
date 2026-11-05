import { Outlet } from 'react-router-dom'
import Menu from './Menu.jsx'

export default function Layout() {
  return (
    <>
      <Menu />
      <Outlet />
    </>
  )
}