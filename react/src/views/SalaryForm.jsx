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
      axiosClient.get(`/salary/${id}`)
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
      axiosClient.put(`/salary/${salary.id}`, salary)
        .then(() => {
          setNotification('User was successfully updated')
          navigate('/users')
        })
        .catch(err => {
          const response = err.response;
          if (response && response.status === 422) {
            setErrors(response.data.errors)
          }
        })
    }
    else {
      // set user_id to current user
      salary.user_id = user.id
      // set date to current date
      salary.date = new Date().toISOString().slice(0, 10)
      axiosClient.post('/salaries', salary)
        .then(() => {
          setNotification('Salary was successfully created')
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

  return (
    <>
      {salary.id && <h1>Update User: {salary.name}</h1>}
      {!salary.id && <h1>New Salary</h1>}
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
            <input value={salary.amount} onChange={ev => setSalary({...salary, amount: ev.target.value})}
                   placeholder="Amount"/>
            <input value={salary.description} onChange={ev => setSalary({...salary, description: ev.target.value})}
                   placeholder="Description"/>
            <button className="btn">Save</button>
          </form>
        )}
      </div>
    </>
  )
}
