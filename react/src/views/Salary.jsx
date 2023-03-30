import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {Link} from "react-router-dom";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Salary() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext()
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    getSalaries();
  }, [])

  const onDeleteClick = user => {
    if (!window.confirm("Are you sure you want to delete this salary?")) {
      return
    }
    axiosClient.delete(`/salaries/${user.id}`)
      .then(() => {
        setNotification('Salary was successfully deleted')
        getSalaries()
      })
  }

  const getSalaries = () => {
    setLoading(true)
    axiosClient.get('/salaries')
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
    return groupedSalaries[month];
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
        <h1>Salaries</h1>
        <select onChange={(e) => setSelectedYear(e.target.value)} defaultValue={new Date().getFullYear()}>
          <option value="" selected>Select year</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <Link className="btn-add" to="/salary/new">Add new</Link>
      </div>
      <div className="card-container" style={{display: "flex", justifyContent: "space-evenly", alignItems: "center"}}>
        {filteredSalaries.map(({key, total}) => (
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
                    <th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {groupedSalaries[selectedMonth].map(salary => (
                    <tr key={salary.id}>
                      <td>{salary.amount}</td>
                      <td>{salary.description}</td>
                      <td>{salary.date}</td>
                      <td>
                        <Link className="btn-edit" to={`/salary/${salary.id}`}>Edit</Link> &nbsp;
                        <button className="btn-delete" onClick={() => onDeleteClick(salary)}>Delete</button>

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
