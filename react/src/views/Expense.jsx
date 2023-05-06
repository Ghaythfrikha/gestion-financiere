import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";
import Modal from "react-bootstrap/Modal";
export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    getExpenses();
  }, [])

  const onDeleteClick = user => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette dépence?")) {
      return
    }
    axiosClient.delete(`/expenses/${user.id}`)
      .then(() => {
        setNotification('Dépence supprimée avec succès')
        getExpenses()
      })
  }

  const getExpenses = () => {
    setLoading(true)
    axiosClient.get(`user-expenses-all/${localStorage.getItem('USER_ID')}`)
      .then(({data}) => {
        setLoading(false)
        setExpenses(data.data)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const groupedExpenses = expenses.reduce((acc, salary) => {
    const [year, month] = salary.date.split('-');
    const key = `${year}-${month}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(salary);
    return acc;
  }, {});

  // calculate total salary for each month
  const totalExpenses = Object.entries(groupedExpenses).map(([key, expenses]) => {
    const total = expenses.reduce((acc, expense) => {
      return acc + parseFloat(expense.amount)
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
    return groupedExpenses[month];
  }

  // filter salaries by year
  function filterSalariesByYear(year) {
    return expenses.filter(expense => {
      const [salaryYear, salaryMonth] = expense.date.split('-');
      return salaryYear === year;
    });
  }

  const filteredExpense = selectedYear ? totalExpenses.filter(({key}) => key.startsWith(selectedYear)) : totalExpenses;

  function getYearsFromSalaries(salaries) {
    const years = new Set();
    salaries.forEach(salary => {
      const [year] = salary.date.split('-');
      years.add(year);
    });
    return Array.from(years).sort().reverse();
  }

  const years = getYearsFromSalaries(expenses);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center"}}>
        <h1>Les dépences</h1>
        <select className="form-select w-50" onChange={(e) => setSelectedYear(e.target.value)} defaultValue={new Date().getFullYear()}>
          <option value="" selected>Sélectionner une année</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <Link className="btn-add" to="/expense/new">Ajouter <i className="bi bi-plus-lg"></i></Link>
      </div>
      <div style={{display: "flex", justifyContent: "space-evenly", alignItems: "center", marginTop: "40px",flexWrap:"wrap"}}>
        {filteredExpense.map(({key, total}) => (
          <div className=" bg-white min-h-48 p-3 mb-4 font-medium">
            <div className="w-52 flex-none rounded-t lg:rounded-t-none lg:rounded-l text-center shadow-lg ">
              <div className="block rounded-t overflow-hidden  text-center ">
                <div className="bg-red-500 text-white py-1 text-capitalize">{new Date(key).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'})}</div>
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
          //     className='flex flex-wrap flex-row sm:flex-col justify-center items-center  p-5 bg-white rounded-md shadow-xl border-l-4 border-red-500'>
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
          <Modal.Title className="text-capitalize">Dépences de {new Date(selectedMonth).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long'})}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-striped">
            <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Montant</th>
              <th scope="col">Description</th>
              <th scope="col">Catégorie</th>
              <th className="text-capitalize" scope="col">événement</th>
              <th scope="col">Actions</th>
            </tr>
            </thead>
            <tbody>
            {getSalariesByMonth(selectedMonth)?.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric',hour:"numeric",minute:"numeric"})}</td>
                <td>{expense.amount} DT</td>
                <td>{expense.description}</td>
                <td>{expense.category}</td>
                <td>{expense.event}</td>
                <td>
                  <Link to={`/expense/${expense.id}`}><i className="bi bi-pencil-square cursor-pointer text-primary"></i></Link>&nbsp;&nbsp;
                  <i className="bi bi-trash cursor-pointer text-danger" onClick={()=>onDeleteClick(expense)}></i>
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
