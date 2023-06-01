import {useEffect, useRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";
import BarChart from "../components/BarChart.jsx";
import PieChart from "../components/PieChart.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import LineChart from "../components/LineChart.jsx";
import ReactToPrint from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


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
  const {user, setUser} = useStateContext();
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
  const [events, setEvents] = useState([])
  const [prevMonthCheckInTotal, setPrevMonthCheckInTotal] = useState(0);
  const [prevMonthCheckOutTotal, setPrevMonthCheckOutTotal] = useState(0);
  const [monthAndYear, setMonthAndYear] = useState(new Date().toLocaleString("fr-FR", {
    month: "long",
    year: "numeric"
  }));
  // chart ref
  const chartRef = useRef();
  // how to use chartRef


  useEffect(() => {
    getExpenses();
    getSalaries();
    getCategories();
    getChecks();
    getEvents();
    getPrevMonthSalariesAndExpenses();
  }, [])

  const getUser = () => {
    axiosClient.get(`/users/${localStorage.getItem('USER_ID')}`)
      .then(({data}) => {
        setUser(data.data)
      })
  }
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
      })
      .catch(() => {
        setLoading(false)
      })
  }

  // get events by user id
  const getEvents = () => {
    setLoading(true)
    const userId = localStorage.getItem('USER_ID')
    axiosClient.get('/user-events/' + userId)
      .then(({data}) => {
        setLoading(false)
        setEvents(data.data)
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
          setSalaries([])
          return;
        }
        setSalaries(data.salaries)
        setTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        if (data.expenses.length === 0) {
          setNotification('No data found')
          setExpenses([])
          return;
        }
        setExpenses(data.expenses)
        setTotalExpenses(data.total)
      })
    axiosClient.get(`/checks-valid/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        if (data.checks.length === 0) {
          setNotification('No data found')
          setChecks([])
          return;
        }
        setChecks(data.checks)
        setCheckInTotal(data.totalEntrant)
        setCheckOutTotal(data.totalSortant)
      })
    axiosClient.get(`/user-events/${localStorage.getItem('USER_ID')}/${month}/${year}`)
      .then(({data}) => {
        if (data.data.length === 0) {
          setNotification('No data found')
          setEvents([])
          return;
        }
        setEvents(data.data)
      })

    getPrevMonthSalariesAndExpenses(month - 1, year);
    // create a new date object with the month and year of the filter and set it to the state
    const date = new Date(year, month - 1, 1).toLocaleString('fr-FR', {month: 'long', year: 'numeric'});
    setMonthAndYear(date)
  }

  // get previous month salaries
  const getPrevMonthSalariesAndExpenses = (monthFilter = null, yearFilter = null) => {
    const date = new Date();
    const month = date.getMonth();
    const year = date.getFullYear();
    axiosClient.get(`/user-salaries/${localStorage.getItem('USER_ID')}/${monthFilter ?? month}/${yearFilter ?? year}`)
      .then(({data}) => {
        setPrevMonthTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses/${localStorage.getItem('USER_ID')}/${monthFilter ?? month}/${yearFilter ?? year}`)
      .then(({data}) => {
        setPrevMonthTotalExpenses(data.total)
      })
    axiosClient.get(`/checks-valid/${localStorage.getItem('USER_ID')}/${monthFilter ?? month}/${yearFilter ?? year}`)
      .then(({data}) => {
        setPrevMonthCheckInTotal(data.totalEntrant)
        setPrevMonthCheckOutTotal(data.totalSortant)
      })
  }


  const resetFilter = () => {
    getSalaries()
    getExpenses()
    getCategories()
    getPrevMonthSalariesAndExpenses()
    getChecks()
    getEvents()
    setMonthAndYear(new Date().toLocaleString('fr-FR', {
      month: 'long',
      year: "numeric"
    }))
  }

  function calculateTotals(expenses, salaries) {
    // Create a Set of unique dates by combining the dates from both arrays
    const dates = new Set([...expenses.map(expense => expense.date), ...salaries.map(salary => salary.date)]);

    // Convert the Set to an array and sort it in ascending order
    const sortedDates = Array.from(dates).sort((a, b) => new Date(a) - new Date(b));

    // Map over the sorted dates and calculate the total salary and expense for each day
    const results = sortedDates.map(date => {
      const totalSalary = salaries.filter(salary => salary.date === date).reduce((acc, salary) => acc + parseFloat(salary.amount), 0);
      const totalExpense = expenses.filter(expense => expense.date === date).reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
      return {
        date,
        totalSalary,
        totalExpense
      };
    });
    return results;
  }
  const results = calculateTotals(expenses, salaries);
  const dataBarChart = {
    labels: results.map(result => result.date.slice(0, 11)),
    datasets: [
      {
        label: 'Salaries',
        data: results.map(result => result.totalSalary),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: results.map(result => result.totalExpense),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }
    ],
  };

  const catsGroup = expenses.map(expense => expense.category);
  const unique = [...new Set(catsGroup)];
  const categoriesChart = [...new Set(expenses.map(expense => expense.category).filter(category => category))];
  const eventsChart = [...new Set(expenses.map(expense => expense.event).filter(event => event))];
  const allCategories = [...categoriesChart, ...eventsChart];

  const groupedExpenses = allCategories.map(category => {
    const filtered = expenses.filter(expense => expense.category === category || expense.event === category);
    const total = filtered.reduce((acc, expense) => {
      return acc + parseFloat(expense.amount);
    }, 0);
    return {category, total};
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


  const dataBarChartCategories =  {
    labels: groupedExpenses.map(expense => expense.category),
    datasets: [
      {
        label: 'Les dépenses par catégories',
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
  };
  const optionsBarChartCategories = {
    plugins: {
      title: {
        display: true,
        text: 'Dépenses par catégories',
        padding: {
          top: 10,
        },
        position: 'bottom'
      }
    }
  }

  // dataLineChart for the evolution of the expenses by day of the month
  const dataLineChartExpenses = {
    labels: expenses.map(group => group.date.slice(0, 11)),
    datasets: [
      {
        label: 'Les dépenses par jour du mois',
        data: expenses.map(group => group.amount),
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
  const dataLineChartSalaries = {
    labels: salaries.map(group => group.date.slice(0, 11)),
    datasets: [
      {
        label: 'Les salaires par jour du mois',
        data: salaries.map(group => group.amount),
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

  const generatePDF = (monthAndYear) => {
    const charts = document.getElementById('charts');
    html2canvas(charts, {
      logging: true,
      letterRendering: 1,
      useCORS: true,
      allowTaint: true,
      scale: 2,
      scrollX: 0,
      scrollY: -window.scrollY,
      backgroundColor: '#fff',
    }).then(canvas => {
      const imageWidth = 208;
      const imageHeight = canvas.height * imageWidth / canvas.width;
      const imageData = canvas.toDataURL('image/jpeg');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imageData, 'JPEG', 0, 0, imageWidth, imageHeight);
      pdf.save(`rapport-${monthAndYear}.pdf`);
    })
  }
  return (
    <div className="container">
      <h1 className="text-3xl text-center pb-5 text-capitalize">
        {monthAndYear !== "" ? `${monthAndYear}` : new Date().toLocaleString('fr-FR', {
          month: 'long',
          year: "numeric"
        })}
      </h1>
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
              {Array.from(new Array(10), (v, i) => {
                const year = i + new Date(user.created_at).getFullYear();
                return year <= new Date().getFullYear() ? year : null;
              }).map(year => (
                year && <option key={year} value={year}>{year}</option>
              ))}
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
            {((prevMonthTotalSalaries + prevMonthCheckInTotal) - (prevMonthTotalExpenses + prevMonthCheckOutTotal)).toFixed(2).replace(/\.00$/, '')} DT
          </p>
        </div>
        <div className="basis-1/3 bg-green-400 p-4 rounded">
          <h1 className="text-left text-2xl">Débit</h1>
          <p className="card-text text-left text-4xl font-bold">
            {(((totalSalaries + checkInTotal) - (totalExpenses + checkOutTotal)) + ((prevMonthTotalSalaries + prevMonthCheckInTotal) - (prevMonthTotalExpenses + prevMonthCheckOutTotal))).toFixed(2).replace(/\.00$/, '')} DT
          </p>
        </div>
        <div className="basis-1/3 bg-red-400 p-4 rounded">
          <h1 className="text-left text-2xl">Dépense Mensuel</h1>
          <p
            className="card-text text-left text-4xl font-bold">{(totalExpenses + checkOutTotal).toFixed(2).replace(/\.00$/, '')} DT</p>
        </div>
        <div className="basis-1/3 bg-blue-400 p-4 rounded">
          <h1 className="text-left text-2xl">Recette Mensuel</h1>
          <p
            className="card-text text-left text-4xl font-bold">{(totalSalaries + checkInTotal).toFixed(2).replace(/\.00$/, '')} DT</p>
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
                  <th className="px-4 py-2 text-capitalize">événement</th>
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
                      <td className="border px-4 py-2">{expense.event}</td>
                      <td className="border px-4 py-2">{expense.description}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
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
                  <th className="px-4 py-2">Nom</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Progrés</th>
                </tr>
                </thead>
                <tbody>
                {events.map((e, index) => {
                  const date = new Date(e.date);
                  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }).format(date);
                  return (
                    <tr key={index}>
                      <td className="border px-4 py-2">{formattedDate}</td>
                      <td className="border px-4 py-2">{e.amount} DT</td>
                      <td className="border px-4 py-2">{e.type}</td>
                      <td className="border px-4 py-2">{e.description}</td>
                      <td className="border px-4 py-2"><ProgressBar value={(e.expenses / e.amount) * 100}
                                                                    label={(e.expenses / e.amount) * 100}/></td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
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
            </div>
          </div>
        </div>
      </div>
      <div className="chars" id="charts">
        <div className="flex mt-5 space-x-6" ref={chartRef}>
          <div className="basis-1/2 card page-break" >
            <BarChart data={dataBarChart} title="Recette et dépense par jour"/>
          </div>
          <div className="basis-1/2 card page-break">
            <h4 className="text-center text-capitalize"></h4>
            <LineChart data={dataLineChartSalaries} title="évolution du recette par jour"/>
          </div>
        </div>
        <div className="flex mt-5 space-x-6">
          <div className="basis-1/2 card">
            <BarChart data={dataBarChartCategories} title="Dépense par catégorie" options={optionsBarChartCategories}/>
          </div>
          <div className="basis-1/2 card">
            <LineChart data={dataLineChartExpenses} title="évolution du dépense par jour"/>
          </div>
        </div>
        <div className="flex card mt-5" style={{height:"550px",width:"40%",margin:"auto"}}>
            <PieChart data={dataPieChart} title="Dépense par catégorie"/>
        </div>
      </div>
      <button className="btn btn-info" onClick={() => generatePDF(monthAndYear)}>
        Générer PDF pour {monthAndYear}&nbsp;
        <i className="bi bi-filetype-pdf"></i>
      </button>
    </div>
  );
}
