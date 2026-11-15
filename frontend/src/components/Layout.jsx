import { Outlet } from 'react-router-dom'
import Menu from './Menu.jsx'
import Rodape from './Rodape.jsx'

export default function Layout() {
  return (
    <div className="app">
      <Menu />
      <div className="conteudo">
        <Outlet />
      </div>
      <Rodape />
    </div>
  )
}
