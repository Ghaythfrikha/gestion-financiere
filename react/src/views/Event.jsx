import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";
import ProgressBarElement from "../components/ProgressBar.jsx";

export default function Event() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
    category_id: '',
    event_id: '',
  })
  const [errorsExpense, setErrorsExpense] = useState(null)
  const {setNotification} = useStateContext()

  useEffect(() => {
    getEvents();
  }, [])

  const onDeleteClick = event => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet événement?")) {
      return
    }
    axiosClient.delete(`/events/${event.id}`)
      .then(() => {
        setNotification('L\'événement a été supprimé avec succès')
        getEvents()
      })
  }

  const getEvents = () => {
    setLoading(true)
    const userId = localStorage.getItem('USER_ID')
    axiosClient.get('/user-events-all/' + userId)
      .then(({ data }) => {
        setLoading(false)
        setEvents(data.data)
      })
      .catch(() => {
        setLoading(false)
      })

  }
  const onSubmitExpense = ev => {
    ev.preventDefault()
    if (ev.target.amount.value === '') {
      setNotification('La valeur ne peut pas être vide')
      return;
    }
    if (parseFloat(ev.target.amount.value) > parseFloat(ev.target.eventAmount.value - ev.target.eventExpenses.value)) {
      setNotification('La valeur ne peut pas être supérieure au montant restant')
      return;
    }
    if (parseFloat(ev.target.amount.value) < 0) {
      setNotification('La valeur ne peut pas être négative')
      return;
    }
    expense.user_id = localStorage.getItem('USER_ID')
    expense.date = new Date().toISOString().slice(0, 10)
    expense.event_id = ev.target.eventId.value
    axiosClient.post('/expense/add', expense)
      .then(() => {
        getEvents();
        setNotification('Expense was successfully created')
        setExpense({
          id: null,
          amount: '',
          description: '',
          user_id: '',
          category_id: '',
          event_id: '',
        })
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrorsExpense(response.data.errors)
        }
      })
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1 className="text-capitalize">événement</h1>
        <Link className="btn-add" to="/event/new">Ajouter <i className="bi bi-plus-lg"></i></Link>
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
            <th>Progrés</th>
            <th>Payer</th>
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
                <td>{e.expenses} DT </td>
                <td><ProgressBarElement value={(e.expenses/e.amount)*100} label={parseInt((e.expenses/e.amount)*100)}/></td>
                <td>
                  {e.amount - e.expenses > 0 &&
                    <form onSubmit={onSubmitExpense}>
                      <label htmlFor="">Montant pour payer</label>
                      <input name="amount" onChange={ev => setExpense({...expense,amount:ev.target.value})} style={{width:100,height:20,margin:5}} type="number"/>
                      <input name="eventId" type="hidden" value={e.id}/>
                      <input name="eventAmount" type="hidden" value={e.amount}/>
                      <input name="eventExpenses" type="hidden" value={e.expenses}/>
                      <button className="btn-add">Payer</button>
                    </form>
                  }
                </td>
                <td>
                  <Link className="btn-edit" to={'/event/' + e.id}>Modifier</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(e)}>Suprimer</button>
                  &nbsp;
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
