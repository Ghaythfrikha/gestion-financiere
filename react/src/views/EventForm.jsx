import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function EventForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [event, setEvent] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
    type: '',
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()
  const [user, setUser] = useState({})

  useEffect(() => {
    axiosClient.get('/user')
      .then(({data}) => {
        setUser(data)
      });
  }, [])
  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/events/${id}`)
        .then(({data}) => {
          setLoading(false)
          setEvent(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (event.id) {
      axiosClient.put(`/events/${event.id}`, event)
        .then(() => {
          setNotification('événement a été modifié avec succès')
          navigate('/event')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      event.user_id = user.id
      event.date = new Date().toISOString().slice(0, 10)
      axiosClient.post('/events', event)
        .then(() => {
          setNotification('événement a été ajouté avec succès')
          navigate('/event')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
  }

  function translateErrorMessage(errorMessage) {
    switch (errorMessage) {
      case 'The amount field is required.':
        return 'Le montant est obligatoire.';
      case 'The description field is required.':
        return 'La description est obligatoire.';
      case 'The type field is required.':
        return 'Le type est obligatoire.';
      default:
        return errorMessage;
    }
  }

  return (
    <>
      {event.id && <h1 className="text-center">Modifier événement: {event.description}</h1>}
      {!event.id && <h1 className="text-center">Nouveau événement</h1>}
      <div className="card animated fadeInDown w-50 align-items-center mt-5 ml-96">
        {loading && (
          <div className="text-center">
            Loading...
          </div>
        )}
        {errors &&
          <div className="alert bg-danger text-white">
            {Object.keys(errors).map(key => (
              <p key={key}>{translateErrorMessage(errors[key][0])}</p>
            ))}
          </div>
        }
        {!loading && (
          <form onSubmit={onSubmit} className="">
            <input value={event.amount} onChange={ev => setEvent({...event, amount: ev.target.value})}
                   placeholder="Montant"/>&nbsp;
            <input value={event.description} onChange={ev => setEvent({...event, description: ev.target.value})}
                   placeholder="Description"/>&nbsp;
            <input value={event.type} onChange={ev => setEvent({...event, type: ev.target.value})}
                   placeholder="Type"/>
            <button className="btn-add mt-3 rounded">Enregistrer</button>
          </form>
        )}
      </div>
    </>
  )
}
