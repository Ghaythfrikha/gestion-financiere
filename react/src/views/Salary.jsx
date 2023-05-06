import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";
import Modal from "react-bootstrap/Modal";

export default function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    getSalaries();
  }, [])

  const onDeleteClick = user => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette recette?")) {
      return
    }
    axiosClient.delete(`/salaries/${user.id}`)
      .then(() => {
        setNotification('Recette supprimée avec succès')
        getSalaries()
      })
  }

  const getSalaries = () => {
    setLoading(true)
    axiosClient.get(`user-salaries-all/${localStorage.getItem('USER_ID')}`)
      .then(({data}) => {
        setLoading(false)
        setSalaries(data.data)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const groupedSalaries = salaries.reduce((acc, salary) => {
    const [year, month] = salary.date.split('-');
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(salary);
    return acc;
  }, {});

  // calculate total salary for each month
  const totalSalaries = Object.entries(groupedSalaries).map(([key, salaries]) => {
    const total = salaries.reduce((acc, salary) => {
      return acc + parseFloat(salary.amount)
    }, 0)
    return {key, total}
  })

  const [selectedMonth, setSelectedMonth] = useState(null);

  const openModal = (month) => {
    setSelectedMonth(month);
  };

  const closeModal = () => {
    setSelectedMonth(null);
  };

  const getSalariesByMonth = (month) => {
    return groupedSalaries.hasOwnProperty(month) ? groupedSalaries[month] : [];
  }

  // filter salaries by year
  function filterSalariesByYear(year) {
    return salaries.filter(salary => {
      const [salaryYear, salaryMonth] = salary.date.split('-');
      return salaryYear === year;
    });
  }

  const filteredSalaries = selectedYear ? totalSalaries.filter(({key}) => key.startsWith(selectedYear)) : totalSalaries;

  function getYearsFromSalaries(salaries) {
    const years = new Set();
    salaries.forEach(salary => {
      const [year] = salary.date.split('-');
      years.add(year);
    });
    return Array.from(years).sort().reverse();
  }

  const years = getYearsFromSalaries(salaries);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Les recettes</h1>
        <select className="form-select w-50" onChange={(e) => setSelectedYear(e.target.value)}
                defaultValue={new Date().getFullYear()}>
          <option value="" selected>Sélectionner une année</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <Link className="btn-add" to="/salary/new">Ajouter <i className="bi bi-plus-lg"></i></Link>
      </div>
      <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center", marginTop: "40px",flexWrap:"wrap"}}>
        {filteredSalaries.map(({key, total}) => (
          <div className=" bg-white min-h-48 p-3 mb-4 font-medium">
            <div className="w-52 flex-none rounded-t lg:rounded-t-none lg:rounded-l text-center shadow-lg ">
              <div className="block rounded-t overflow-hidden  text-center ">
                <div className="bg-blue-500 text-white py-1 text-capitalize">{new Date(key).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'})}</div>
                <div className="pt-1 border-l border-r border-white bg-white mt-3">
                  <span className="text-4xl font-bold leading-tight">{total} DT</span>
                </div>
                <div className="border-l border-r border-b rounded-b-lg text-center border-white bg-white pt-2 mb-3 mt-3">
                  <button className="bg-gray-200 p-1 rounded" onClick={() => openModal(key)}>Détaille <i className="bi bi-arrow-right"></i></button>
                </div>
              </div>
            </div>
          </div>
          // <div className='flex sm:flex-row flex-col space-y-2 sm:space-x-2 flex-row w-full items-center justify-center'>
          //   <div
          //     className='flex flex-wrap flex-row sm:flex-col justify-center items-center  p-5 bg-white rounded-md shadow-xl border-l-4 border-blue-300'>
          //     <div>
          //       <div className="font-bold text-capitalize">
          //         {new Date(key).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'})}
          //       </div>
          //       <div className="font-bold text-sm">
          //         {total} DT
          //       </div>
          //       <div className="font-bold text-sm pt-4">
          //         <button className="btn btn-primary" onClick={() => openModal(key)}>Détaille</button>
          //       </div>
          //     </div>
          //   </div>
          // </div>
        ))}
      </div>
      <Modal show={selectedMonth} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">
            Recette de {new Date(selectedMonth).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'})}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-striped">
            <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Montant</th>
              <th scope="col">Description</th>
              <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            {getSalariesByMonth(selectedMonth).map(salary => (
              <tr key={salary.id}>
                <td>{new Date(salary.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: "numeric",
                  minute: "numeric"
                })}</td>
                <td>{salary.amount} DT</td>
                <td>{salary.description}</td>
                <td>
                  <Link className="bi bi-pencil-square cursor-pointer text-decoration-none"
                        to={`/salary/${salary.id}`}></Link>&nbsp;&nbsp;
                  <i className="bi bi-trash cursor-pointer text-danger" onClick={() => onDeleteClick(salary)}></i>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </div>
  )
}
