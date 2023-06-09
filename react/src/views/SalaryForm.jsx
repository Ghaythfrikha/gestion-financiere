import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function SalaryForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [salary, setSalary] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
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
      axiosClient.get(`/salaries/${id}`)
        .then(({data}) => {
          setLoading(false)
          setSalary(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (salary.id) {
      axiosClient.put(`/salaries/${salary.id}`, salary)
        .then(() => {
          setNotification('Salaire a été modifié avec succès')
          navigate('/salaries')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
    else {
      salary.user_id = user.id
      salary.date = new Date().toISOString().slice(0, 10)
      axiosClient.post('/salaries', salary)
        .then(() => {
          setNotification('Salaire a été ajouté avec succès')
          navigate('/salaries')
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
      default:
        return errorMessage;
    }
  }
  return (
    <>
      {salary.id && <h1 className="text-center">Modifier recette: {salary.description}</h1>}
      {!salary.id && <h1 className="text-center">Nouvelle recette</h1>}
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
            <input value={salary.amount} onChange={ev => setSalary({...salary, amount: ev.target.value})}
                   placeholder="Montant"/>&nbsp;
            <input value={salary.description} onChange={ev => setSalary({...salary, description: ev.target.value})}
                   placeholder="Description"/>
            <button className="btn-add mt-3 rounded">Enregistrer</button>
          </form>
        )}
      </div>
    </>
  )
}
