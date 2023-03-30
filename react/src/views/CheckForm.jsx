import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function CheckForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [check, setCheck] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
    date: '',
    status: '',
    number: '',
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()
  const [user, setUser] = useState({})

  useEffect(() => {
    axiosClient.get('/user')
      .then(({data}) => {
        setUser(data)
      })
  }, [])
  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/checks/${id}`)
        .then(({data}) => {
          setLoading(false)
          setCheck(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    console.log(check)
    if (check.id) {
      axiosClient.put(`/checks/${check.id}`, check)
        .then(() => {
          setNotification('Check was successfully updated')
          navigate('/check')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
    else {
      check.user_id = user.id
      axiosClient.post('/checks', check)
        .then(() => {
          setNotification('Check was successfully created')
          navigate('/check')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

  return (
    <>
      {check.id && <h1>Modifier chéque: {check.name}</h1>}
      {!check.id && <h1>Nouveau chéque</h1>}
      <div className="card animated fadeInDown">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert">
            {Object.keys(errors).map(key => (
              <p key={key}>{errors[key][0]}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit}>
            <input value={check.amount} onChange={ev => setCheck({...check, amount: ev.target.value})}
                   placeholder="Montant"/>
            <input value={check.number} onChange={ev => setCheck({...check, number: ev.target.value})}
                   placeholder="Numéro"/>
            <select defaultValue={check.status} className="form-select" name="" id="" onChange={ev => setCheck({...check, status: ev.target.value})}>
              <option value="">Choisir le status</option>
              <option value="Entrant">Entrant</option>
              <option value="Sortant">Sortant</option>
            </select>
            <input type="date" className="form-control" value={check.date.slice(0,10)} onChange={ev => setCheck({...check,date: ev.target.value})}/>
            <input value={check.description} onChange={ev => setCheck({...check, description: ev.target.value})}
                   placeholder="Description"/>
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
