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
    if (!window.confirm("Voulez-vous vraiment supprimer ce chéque?")) {
      return
    }
    axiosClient.delete(`/checks/${check.id}`)
      .then(() => {
        setNotification('Le chéque a été supprimé avec succès')
        getChecks()
      })
  }

  const getChecks = () => {
    setLoading(true)
    axiosClient.get(`/checks-valid-all/${localStorage.getItem('USER_ID')}`)
      .then(({ data }) => {
        setLoading(false)
        setChecks(data.data)
      })
      .catch(() => {
        setLoading(false)
      })

  }

  const validateCheck = check => {
    if (!window.confirm("Voulez-vous vraiment effectuer ce chéque?")) {
      return
    }
    axiosClient.patch(`/check-validate/${check.id}`)
      .then(() => {
        setNotification('Le chéque a été effectué avec succès')
        getChecks()
      })
  }

  const handleFilterByDate = (e) => {
    const date = e.target.value;
    console.log(date)
    if (date) {
      axiosClient.get(`/checks-valid-all/${localStorage.getItem('USER_ID')}?date=${date}`)
        .then(({ data }) => {
          setLoading(false)
          setChecks(data.data)
        })
        .catch(() => {
          setLoading(false)
        })
    }
    else {
      getChecks();
    }
  }

  const handleFilterByStatus = (e) => {
    const status = e.target.value;
    console.log(status)
    if (status) {
      axiosClient.get(`/checks-valid-all/${localStorage.getItem('USER_ID')}?status=${status}`)
        .then(({ data }) => {
          setLoading(false)
          setChecks(data.data)
        })
        .catch(() => {
          setLoading(false)
        })
    }
    else {
      getChecks();
    }
  }

  const handleFilterByValidated = (e) => {
    const validated = e.target.checked;
    if (validated) {
      axiosClient.get(`/checks-valid-all/${localStorage.getItem('USER_ID')}?validated=${validated}`)
        .then(({ data }) => {
          setLoading(false)
          setChecks(data.data)
        })
        .catch(() => {
          setLoading(false)
        })
    }
    else {
      getChecks();
    }
  }
  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Les chéques</h1>
        <div  style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
          <select className="form-select" onChange={e => handleFilterByStatus(e)}>
            <option selected value="">Tous</option>
            <option value="Entrant">Entrant</option>
            <option value="Sortant">Sortant</option>
          </select>
          &nbsp;
          <input type="date" className="form-control" onChange={e => handleFilterByDate(e)} />
          &nbsp;
          <input type="checkbox" className="form-check-input" onChange={e => handleFilterByValidated(e)} />
          &nbsp;
          <label>Validé</label>
        </div>
        <Link className="btn-add" to="/check/new">Ajouter <i className="bi bi-plus-lg"></i></Link>
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
          {!loading && checks.length !== 0 &&
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
