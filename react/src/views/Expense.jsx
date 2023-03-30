import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    getExpenses();
  }, [])

  const onDeleteClick = user => {
    if (!window.confirm("Are you sure you want to delete this salary?")) {
      return
    }
    axiosClient.delete(`/expenses/${user.id}`)
      .then(() => {
        setNotification('Salary was successfully deleted')
        getExpenses()
      })
  }

  const getExpenses = () => {
    setLoading(true)
    axiosClient.get('/expenses')
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
        <h1>Expenses</h1>
        <select onChange={(e) => setSelectedYear(e.target.value)} defaultValue={new Date().getFullYear()}>
          <option value="">Select year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <Link className="btn-add" to="/salary/new">Add new</Link>
      </div>
      <div className="card-container" style={{display: "flex", justifyContent: "space-evenly", alignItems: "center"}}>
        {filteredExpense.map(({key, total}) => (
          <div className="card" key={key}>
            <div className="card-header" style={{marginBottom: 20}}>
              <h2>{new Date(key).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}</h2>
            </div>
            <div className="card-body" style={{marginBottom: 20}}>
              <p>Total: {total}</p>
            </div>
            <button className="btn btn-primary" onClick={() => openModal(key)}>View</button>
          </div>
        ))}
      </div>
      {selectedMonth && (
        <div className="modal-container show">
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedMonth}</h3>
                <button className="btn btn-primary" onClick={closeModal}>Close</button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {groupedExpenses[selectedMonth].map(expense => (
                    <tr key={expense.id}>
                      <td>{expense.amount}</td>
                      <td>{expense.description}</td>
                      <td>{expense.date}</td>
                      <td>{expense.category}</td>
                      <td>
                        <Link className="btn-edit" to={`/salary/${expense.id}`}>Edit</Link> &nbsp;
                        <button className="btn-delete" onClick={() => onDeleteClick(expense)}>Delete</button>

                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
