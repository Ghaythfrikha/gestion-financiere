import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Check() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()

  useEffect(() => {
    getChecks();
  }, [])

  const onDeleteClick = check => {
    if (!window.confirm("Are you sure you want to delete this check?")) {
      return
    }
    axiosClient.delete(`/check/${check.id}`)
      .then(() => {
        setNotification('Check was successfully deleted')
        getChecks()
      })
  }

  const getChecks = () => {
    setLoading(true)
    axiosClient.get('/checks')
      .then(({ data }) => {
        setLoading(false)
        setChecks(data.data)
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
        getChecks()
      })
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Chéques</h1>
        <Link className="btn-add" to="/check/new">Ajouter</Link>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
          <tr>
            <th>Montant</th>
            <th>Numéro</th>
            <th>Description</th>
            <th>Date</th>
            <th className="text-capitalize">état</th>
            <th>Effectuer</th>
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
            {checks.map(c => (
              <tr key={c.id}>
                <td>{c.amount}</td>
                <td>{c.number}</td>
                <td>{c.description}</td>
                <td>{c.date.slice(0,10)}</td>
                <td>{c.status}</td>
                <td>{c.validated ? 'Oui' : 'Non'}</td>
                <td>
                  <Link className="btn-edit" to={'/check/' + c.id}>Modifier</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(c)}>Suprimer</button>
                  &nbsp;
                  {!c.validated && <button className="btn-add" onClick={ev => validateCheck(c)}>Effectuer</button>}
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
