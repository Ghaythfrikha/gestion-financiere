import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function CategoryForm() {
  const navigate = useNavigate();
  let {id} = useParams();
  const [category, setCategory] = useState({
    id: null,
    name: '',
    user_id: '',
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(false)
  const {setNotification} = useStateContext()

  if (id) {
    useEffect(() => {
      setLoading(true)
      axiosClient.get(`/categories/${id}`)
        .then(({data}) => {
          setLoading(false)
          setCategory(data)
        })
        .catch(() => {
          setLoading(false)
        })
    }, [])
  }

  const onSubmit = ev => {
    ev.preventDefault()
    category.user_id = localStorage.getItem('USER_ID')
    if (category.id) {
      axiosClient.put(`/categories/${category.id}`, category)
        .then(() => {
          setNotification('La catégorie a été mise à jour avec succès')
          navigate('/categories')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    } else {
      console.log(category)
      axiosClient.post('/categories', category)
        .then(() => {
          setNotification('La catégorie a été créée avec succès')
          navigate('/categories')
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
      {category.id && <h1>Modifier une catégorie: {category.name}</h1>}
      {!category.id && <h1>Ajouter une catégorie</h1>}
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
            <input value={category.name} onChange={ev => setCategory({...category, name: ev.target.value})} placeholder="Name"/>
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
