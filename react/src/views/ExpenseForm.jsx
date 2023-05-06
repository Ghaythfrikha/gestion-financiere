import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function ExpenseForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [expense, setExpense] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()
  const [user, setUser] = useState({})
  const [categories, setCategories] = useState([])

  useEffect(() => {
    axiosClient.get('/user')
      .then(({data}) => {
        setUser(data)
      });
    getCategories();
  }, [])
  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/expenses/${id}`)
        .then(({data}) => {
          setLoading(false)
          setExpense(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    if (expense.id) {
      axiosClient.put(`/expenses/${expense.id}`, expense)
        .then(() => {
          setNotification('Dépence a été modifié avec succès')
          navigate('/expenses')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      expense.user_id = user.id
      expense.date = new Date().toISOString().slice(0, 10)
      axiosClient.post('/expenses', expense)
        .then(() => {
          setNotification('Dépence a été ajouté avec succès')
          navigate('/expenses')
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
      case 'The category id field is required.':
        return 'La catégorie est obligatoire.';
      default:
        return errorMessage;
    }
  }

  const getCategories = () => {
    axiosClient.get('/categories')
      .then(({data}) => {
        setCategories(data.data)
      })
  }

  return (
    <>
      {expense.id && <h1 className="text-center">Modifier dépence: {expense.description}</h1>}
      {!expense.id && <h1 className="text-center">Nouvelle dépence</h1>}
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
            <input value={expense.amount} onChange={ev => setExpense({...expense, amount: ev.target.value})}
                   placeholder="Montant"/>&nbsp;
            <input value={expense.description} onChange={ev => setExpense({...expense, description: ev.target.value})}
                   placeholder="Description"/>
            <select className="form-select w-100 mt-4" onChange={ev => setExpense({...expense, category_id: ev.target.value})}>
              <option value="">Choisir une catégorie</option>
              {categories.map(category => (
                <option selected={expense.category === category.name} key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <button className="btn-add mt-3 rounded">Enregistrer</button>
          </form>
        )}
      </div>
    </>
  )
}
