import {useEffect, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import BarChart from "../components/BarChart.jsx";
import PieChart from "../components/PieChart.jsx";


export default function Monthly() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalSalaries, setTotalSalaries] = useState(0);
  const [prevMonthTotalSalaries, setPrevMonthTotalSalaries] = useState(0);
  const [prevMonthTotalExpenses, setPrevMonthTotalExpenses] = useState(0);
  const [salaries, setSalaries] = useState([]);
  const [checks, setChecks] = useState([]);
  const [checkInTotal, setCheckInTotal] = useState(0);
  const [checkOutTotal, setCheckOutTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const {setNotification} = useStateContext();
  const {user} = useStateContext();
  const [salary, setSalary] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
  })
  const [expense, setExpense] = useState({
    id: null,
    amount: '',
    description: '',
    user_id: '',
    category_id: '',
  })
  const [errors, setErrors] = useState(null)
  const [errorsExpense, setErrorsExpense] = useState(null)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getExpenses();
    getSalaries();
    getCategories();
    getChecks();
  }, [])

  const getExpenses = () => {
    setLoading(true)
    axiosClient.get(`/user-expenses/${localStorage.getItem('USER_ID')}`)
      .then(({data}) => {
        setLoading(false)
        setExpenses(data.expenses)
        setTotalExpenses(data.total)
      })
      .catch(() => {
        setLoading(false)
      })
  }
  const getSalaries = () => {
    setLoading(true)
    axiosClient.get(`/user-salaries/${localStorage.getItem('USER_ID')}`)
      .then(({data}) => {
        setLoading(false)
        setSalaries(data.salaries)
        setTotalSalaries(data.total)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  const getCategories = () => {
    axiosClient.get('/categories')
      .then(({data}) => {
        setCategories(data.data)
      })
  }


  const getChecks = () => {
    setLoading(true)
    const userId = localStorage.getItem('USER_ID')
    axiosClient.get('/checks-valid/' + userId)
      .then(({data}) => {
        setLoading(false)
        setChecks(data.checks)
        setCheckInTotal(data.totalEntrant)
        setCheckOutTotal(data.totalSortant)
        /*setCheckInTotal(0);
        setCheckOutTotal(0);
        checks.map(check => {
          if (check.status === 'Entrant') {
            setCheckInTotal(parseFloat(checkInTotal) + parseFloat(check.amount))
          }
          if (check.status === 'Sortant') {
            setCheckOutTotal(parseFloat(checkOutTotal) + parseFloat(check.amount))
          }
        })*/
      })
      .catch(() => {
        setLoading(false)
      })
  }
  const checkIn = () => {
    setCheckInTotal(0);
    setCheckOutTotal(0);
    checks.map(check => {
      if (check.status === 'Entrant') {
        setCheckInTotal(parseFloat(checkInTotal) + parseFloat(check.amount))
      }
      if (check.status === 'Sortant') {
        setCheckOutTotal(parseFloat(checkOutTotal) + parseFloat(check.amount))
      }
    })
  }

  const onSubmitSalary = ev => {
    ev.preventDefault()
    // set user_id to current user
    salary.user_id = user.id
    // set date to current date
    salary.date = new Date().toISOString().slice(0, 10)
    axiosClient.post('/salaries', salary)
      .then(() => {
        setNotification('Salary was successfully created')
        // reset form
        setSalary({
          id: null,
          amount: '',
          description: '',
          user_id: '',
        })
        getSalaries()
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.errors)
        }
      })
  }

  const onSubmitExpense = ev => {
    ev.preventDefault()
    // check if is there an empty field
    if (!expense.amount || !expense.description || !expense.category_id) {
      setNotification('Please fill all fields')
      return;
    }
    expense.user_id = user.id
    expense.date = new Date().toISOString().slice(0, 10)
    axiosClient.post('/expenses', expense)
      .then(() => {
        setNotification('Expense was successfully created')
        setExpense({
          id: null,
          amount: '',
          description: '',
          user_id: '',
          category_id: '',
        })
        getExpenses()
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrorsExpense(response.data.errors)
        }
      })
  }

  const handleFilter = ev => {
    ev.preventDefault()
    const month = ev.target[0].value
    const year = ev.target[1].value
    // check if is there an empty field
    if (!month || !year) {
      setNotification('Please fill all fields')
      return;
    }
    axiosClient.get(`/user-salaries/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        if (data.salaries.length === 0) {
          setNotification('No data found')
          return;
        }
        setSalaries(data.salaries)
        setTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        if (data.expenses.length === 0) {
          setNotification('No data found')
          return;
        }
        setExpenses(data.expenses)
        setTotalExpenses(data.total)
      })
  }

  // get previous month salaries
  const getPrevMonthSalariesAndExpenses = () => {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    axiosClient.get(`/user-salaries/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        setPrevMonthTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        setPrevMonthTotalExpenses(data.total)
      })
  }


  const resetFilter = () => {
    getSalaries()
    getExpenses()
    getCategories()
    getPrevMonthSalariesAndExpenses()
  }


  const DateGroup = salaries.map(salary => salary.date.slice(0,11));
  const uniqueDate = [...new Set(DateGroup)];
  const groupedSalaries = uniqueDate.map(date => {
    const salariesFiltered = salaries.filter(salary => salary.date.slice(0,11) === date);
    const totalSalaries = salariesFiltered.reduce((acc, salary) => {
      return acc + parseFloat(salary.amount)
    }, 0);
    const expensesFiltered = expenses.filter(expense => expense.date.slice(0,11) === date);
    const totalExpenses = expensesFiltered.reduce((acc, expense) => {
      return acc + parseFloat(expense.amount)
    }, 0);
    return {date, totalSalaries, totalExpenses}
  });
  const dataBarChart = {
    labels: groupedSalaries.map(group => group.date),
    datasets: [
      {
        label: 'Salaries',
        data: groupedSalaries.map(group => group.totalSalaries),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: groupedSalaries.map(group => group.totalExpenses),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ],
  };

  const catsGroup = expenses.map(expense => expense.category);
  const unique = [...new Set(catsGroup)];
  const groupedExpenses = unique.map(category => {
    const filtered = expenses.filter(expense => expense.category === category);
    const total = filtered.reduce((acc, expense) => {
      return acc + parseFloat(expense.amount)
    }, 0)
    return {category, total}
  });

  const dataPieChart = {
    labels: groupedExpenses.map(expense => expense.category),
    datasets: [
      {
        label: 'Expenses',
        data: groupedExpenses.map(expense => expense.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      }
    ],
  }

  return (
    <div className="container">
      <h1 className="text-3xl text-center pb-5 text-capitalize">{new Date().toLocaleString('fr-FR', {
        month: 'long',
        year: "numeric"
      })}</h1>
      <form onSubmit={handleFilter}>
        <div className="flex flex-row space-x-6">
          <div className="basis-1/1 mb-5 form-control">
            <select className="form-select" name="" id="">
              <option value="">Sélectionner un mois</option>
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>
          <div className="basis-1/1 mb-5 form-control">
            <select className="form-select" name="" id="">
              <option value="">Sélectionner une année</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="basis-1/1">
            <button className="btn btn-primary">Rechercher</button>
          </div>
          <div className="basis-1/1">
            <button type="reset" onClick={resetFilter} className="btn btn-primary">Réinitialiser</button>
          </div>
        </div>
      </form>
      <div className="flex flex-row space-x-6">
        <div className="basis-1/3 bg-yellow-400 p-4 rounded">
          <h1 className="text-left text-2xl">Reste</h1>
          <p className="card-text text-left text-4xl font-bold">
            {(prevMonthTotalSalaries - prevMonthTotalExpenses).toFixed(2).replace(/\.00$/, '')} DT
          </p>
        </div>
        <div className="basis-1/3 bg-green-400 p-4 rounded">
          <h1 className="text-left text-2xl">Débit</h1>
          <p className="card-text text-left text-4xl font-bold">
            {(((totalSalaries + checkInTotal) - (totalExpenses + checkOutTotal)) + (prevMonthTotalSalaries - prevMonthTotalExpenses)).toFixed(2).replace(/\.00$/, '')} DT
          </p>
        </div>
        <div className="basis-1/3 bg-red-400 p-4 rounded">
          <h1 className="text-left text-2xl">Dépense Mensuel</h1>
          <p className="card-text text-left text-4xl font-bold">{(totalExpenses + checkOutTotal).toFixed(2).replace(/\.00$/, '')} DT</p>
        </div>
        <div className="basis-1/3 bg-blue-400 p-4 rounded">
          <h1 className="text-left text-2xl">Recette Mensuel</h1>
          <p className="card-text text-left text-4xl font-bold">{(totalSalaries + checkInTotal).toFixed(2).replace(/\.00$/, '')} DT</p>
        </div>
      </div>
      <div className="flex flex-row space-x-6 mt-5">
        <div className="basis-1/2 rounded-full">
          <h1 className="text-left text-2xl">Recettes</h1>
          <div className="card">
            <div className="card-body">
              <table className="table-auto w-full">
                <thead>
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
                </thead>
                <tbody>
                {salaries.map((salary, index) => {
                  const date = new Date(salary.date);
                  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }).format(date);
                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2">{formattedDate}</td>
                      <td className="border px-4 py-2">{salary.amount} DT</td>
                      <td className="border px-4 py-2">{salary.description}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              {errors &&
                <div className="alert-danger font-medium mt-5 text-white p-1 text-center rounded text-bg-danger">
                  {Object.keys(errors).map(key => (
                    <p key={key}>{errors[key][0]}</p>
                  ))}
                </div>
              }
              <form className="mt-5" onSubmit={onSubmitSalary}>
                <div className="flex flex-row space-x-6">
                  <div className="basis-1/2">
                    <label htmlFor="amount">Montant</label>
                    <input value={salary.amount} onChange={ev => setSalary({...salary, amount: ev.target.value})}
                           type="number" id="amount" name="amount" className="form-control"/>
                  </div>
                  <div className="basis-1/2">
                    <label htmlFor="description">Description</label>
                    <input value={salary.description}
                           onChange={ev => setSalary({...salary, description: ev.target.value})} type="text"
                           id="description" name="description" className="form-control"/>
                  </div>
                </div>
                <button className="rounded bg-blue-200 mt-5 p-1">Ajouter une recette</button>
              </form>
            </div>
          </div>
        </div>
        <div className="basis-1/2 rounded-full">
          <h1 className="text-left text-2xl">Dépenses</h1>
          <div className="card">
            <div className="card-body">
              <table className="table-auto w-full">
                <thead>
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Montant</th>
                  <th className="px-4 py-2">Catégorie</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
                </thead>
                <tbody>
                {expenses.map((expense, index) => {
                  const date = new Date(expense.date);
                  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }).format(date);
                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2">{formattedDate}</td>
                      <td className="border px-4 py-2">{expense.amount} DT</td>
                      <td className="border px-4 py-2">{expense.category}</td>
                      <td className="border px-4 py-2">{expense.description}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              {errorsExpense &&
                <div className="alert-danger font-medium mt-5 text-white p-1 text-center rounded text-bg-danger">
                  {Object.keys(errors).map(key => (
                    <p key={key}>{errors[key][0]}</p>
                  ))}
                </div>
              }
              <form className="mt-5" onSubmit={onSubmitExpense}>
                <div className="flex flex-row space-x-6">
                  <div className="basis-1/3">
                    <label htmlFor="amount">Montant</label>
                    <input value={expense.amount} onChange={ev => setExpense({...expense, amount: ev.target.value})}
                           type="number" id="amount" name="amount" className="form-control p-2"/>
                  </div>
                  <div className="basis-1/3">
                    <label htmlFor="category">Catégorie</label>
                    <select onChange={ev => setExpense({...expense, category_id: ev.target.value})}
                            value={expense.category} name="category" id="category" className="form-control p-2">
                      <option selected>Choisir une catégorie</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="basis-1/3">
                    <label htmlFor="description">Description</label>
                    <input value={expense.description}
                           onChange={ev => setExpense({...expense, description: ev.target.value})} type="text"
                           id="description" name="description" className="form-control p-2"/>
                  </div>
                </div>
                <button className="rounded bg-blue-200 mt-5 p-1">Ajouter une dépense</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row space-x-6 mt-5">
      <div className="basis-1/2 rounded-full">
        <h1 className="text-left text-2xl">Evénement</h1>
        <div className="card">
          <div className="card-body">
            <table className="table-auto w-full">
              <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Catégorie</th>
                <th className="px-4 py-2">Description</th>
              </tr>
              </thead>
              <tbody>
              {expenses.map((expense, index) => {
                const date = new Date(expense.date);
                const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(date);
                return (
                  <tr key={index}>
                    <td className="border px-4 py-2">{formattedDate}</td>
                    <td className="border px-4 py-2">{expense.amount} DT</td>
                    <td className="border px-4 py-2">{expense.category}</td>
                    <td className="border px-4 py-2">{expense.description}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            {errorsExpense &&
              <div className="alert-danger font-medium mt-5 text-white p-1 text-center rounded text-bg-danger">
                {Object.keys(errors).map(key => (
                  <p key={key}>{errors[key][0]}</p>
                ))}
              </div>
            }
            <form className="mt-5" onSubmit={onSubmitExpense}>
              <div className="flex flex-row space-x-6">
                <div className="basis-1/3">
                  <label htmlFor="amount">Montant</label>
                  <input value={expense.amount} onChange={ev => setExpense({...expense, amount: ev.target.value})}
                         type="number" id="amount" name="amount" className="form-control p-2"/>
                </div>
                <div className="basis-1/3">
                  <label htmlFor="category">Catégorie</label>
                  <select onChange={ev => setExpense({...expense, category_id: ev.target.value})}
                          value={expense.category} name="category" id="category" className="form-control p-2">
                    <option selected>Choisir une catégorie</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="basis-1/3">
                  <label htmlFor="description">Description</label>
                  <input value={expense.description}
                         onChange={ev => setExpense({...expense, description: ev.target.value})} type="text"
                         id="description" name="description" className="form-control p-2"/>
                </div>
              </div>
              <button className="rounded bg-blue-200 mt-5 p-1">Ajouter une dépense</button>
            </form>
          </div>
        </div>
      </div>
      <div className="basis-1/2 rounded-full">
        <h1 className="text-left text-2xl">Chéques</h1>
        <div className="card">
          <div className="card-body">
            <table className="table-auto w-full">
              <thead>
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Montant</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Description</th>
              </tr>
              </thead>
              <tbody>
              {checks.map((check, index) => {
                const date = new Date(check.date);
                const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }).format(date);
                return (
                  <tr key={index}>
                    <td className="border px-4 py-2">{formattedDate}</td>
                    <td className="border px-4 py-2">{check.amount} DT</td>
                    <td className="border px-4 py-2">{check.status}</td>
                    <td className="border px-4 py-2">{check.description}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
            {errorsExpense &&
              <div className="alert-danger font-medium mt-5 text-white p-1 text-center rounded text-bg-danger">
                {Object.keys(errors).map(key => (
                  <p key={key}>{errors[key][0]}</p>
                ))}
              </div>
            }
            <form className="mt-5" onSubmit={onSubmitExpense}>
              <div className="flex flex-row space-x-6">
                <div className="basis-1/3">
                  <label htmlFor="amount">Montant</label>
                  <input value={expense.amount} onChange={ev => setExpense({...expense, amount: ev.target.value})}
                         type="number" id="amount" name="amount" className="form-control p-2"/>
                </div>
                <div className="basis-1/3">
                  <label htmlFor="category">Catégorie</label>
                  <select onChange={ev => setExpense({...expense, category_id: ev.target.value})}
                          value={expense.category} name="category" id="category" className="form-control p-2">
                    <option selected>Choisir une catégorie</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="basis-1/3">
                  <label htmlFor="description">Description</label>
                  <input value={expense.description}
                         onChange={ev => setExpense({...expense, description: ev.target.value})} type="text"
                         id="description" name="description" className="form-control p-2"/>
                </div>
              </div>
              <button className="rounded bg-blue-200 mt-5 p-1">Ajouter une dépense</button>
            </form>
          </div>
        </div>
      </div>
      </div>
      <div className="flex">
        <div className="basis-1/2">
          <BarChart data={dataBarChart}/>
        </div>
        <div className="basis-1/2">
          <PieChart data={dataPieChart}/>
        </div>
      </div>
    </div>
  );
}
