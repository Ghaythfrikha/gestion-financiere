import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()

  useEffect(() => {
    getCategories();
  }, [])

  const onDeleteClick = category => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette catégorie ?")) {
      return
    }
    axiosClient.delete(`/categories/${category.id}`)
      .then(() => {
        setNotification('La catégorie a été supprimée avec succès')
        getCategories()
      })
  }

  const getCategories = () => {
    setLoading(true)
    axiosClient.get(`/category/${localStorage.getItem('USER_ID')}`)
      .then(({ data }) => {
        setLoading(false)
        setCategories(data.data)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Catégories</h1>
        <Link className="btn-add" to="/category/new">Ajouter <i className="bi bi-plus-lg"></i></Link>
      </div>
      <div className="card animated fadeInDown">
        <table>
          <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
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
            {categories.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>
                  <Link className="btn-edit" to={'/category/' + u.id}>Edit</Link>
                  &nbsp;
                  <button className="btn-delete" onClick={ev => onDeleteClick(u)}>Delete</button>
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
