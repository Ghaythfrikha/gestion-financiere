import {Link, Navigate, Outlet} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider";
import axiosClient from "../axios-client.js";
import {useEffect} from "react";
import logo from "../assets/logo.png";

export default function DefaultLayout() {
  const {user, token, setUser, setToken, notification} = useStateContext();

  if (!token) {
    return <Navigate to="/login"/>
  }

  const onLogout = ev => {
    ev.preventDefault()

    axiosClient.post('/logout')
      .then(() => {
        setUser({})
        setToken(null)
      })
  }

  useEffect(() => {
    axiosClient.get('/user')
      .then(({data}) => {
         setUser(data)
      })
  }, [])

  return (
    <div id="defaultLayout">
      <aside className="fixed h-100">
        <img src={logo} alt="logo" width="100%"/>
        <Link to="/dashboard">Dashboard</Link>
        {/*<Link to="/users">Users</Link>*/}
        <Link to="/salaries">Salaires</Link>
        <Link to="/expenses">Dépences</Link>
        <Link className="text-capitalize" to="/event">événement</Link>
        <Link to="/check">Chéques</Link>
        <Link to="/monthly">Rapport Mensuel</Link>
        <Link to="/annual">Rapport Annuel</Link>
        <Link to="/categories">Catégories</Link>
      </aside>
      <aside></aside>
      <div className="content">
        <header>
          <div>

          </div>

          <div>
            {user.name} &nbsp; &nbsp;
            <a onClick={onLogout} className="btn-logout" href="#">Déconnexion</a>
          </div>
        </header>
        <main>
          <Outlet/>
        </main>
        {notification &&
          <div className="notification">
            {notification}
          </div>
        }
      </div>
    </div>
  )
}
