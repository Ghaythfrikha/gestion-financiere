import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";
import ProgressBarElement from "../components/ProgressBar.jsx";

export default function Event() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()

  useEffect(() => {
    getEvents();
  }, [])

  const onDeleteClick = check => {
    if (!window.confirm("Are you sure you want to delete this check?")) {
      return
    }
    axiosClient.delete(`/check/${check.id}`)
      .then(() => {
        setNotification('Check was successfully deleted')
        getEvents()
      })
  }

  const getEvents = () => {
    setLoading(true)
    const userId = localStorage.getItem('USER_ID')
    axiosClient.get('/user-events/' + userId)
      .then(({ data }) => {
        setLoading(false)
        setEvents(data.data)
      })
      .catch(() => {
        setLoading(false)
      })

  }


  const validateCheck = check => {
    if (!window.confirm("Are you sure you want to validate this check?")) {
      return
    }
    axiosClient.patch(`/check-validate/${check.id}`)
      .then(() => {
        setNotification('Check was successfully validated')
        getEvents()
      })
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1 className="text-capitalize">événement</h1>
        <Link className="btn-add" to="/check/new">Ajouter</Link>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
          <tr>
            <th>Type</th>
            <th>Montant</th>
            <th>Description</th>
            <th>Date</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
          </thead>
          {loading &&
            <tbody>
            <tr>
              <td colSpan="5" className="text-center">
                Loading...
              </td>
            </tr>
            </tbody>
          }
          {!loading &&
            <tbody>
            {events.map(e => (
              <tr key={e.id}>
                <td>{e.type}</td>
                <td>{e.amount}</td>
                <td>{e.description}</td>
                <td>{e.date.slice(0,10)}</td>
                <td><ProgressBarElement value={51.5} label={100}/></td>
                <td>
                  <Link className="btn-edit" to={'/check/' + e.id}>Modifier</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(e)}>Suprimer</button>
                  &nbsp;
                  {!e.validated && <button className="btn-add" onClick={ev => validateCheck(e)}>Effectuer</button>}
                </td>
              </tr>
            ))}
            </tbody>
          }
        </table>
      </div>
    </div>
  )
}
