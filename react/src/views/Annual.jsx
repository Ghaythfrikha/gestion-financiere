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


export default function Annual() {
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
  const [events, setEvents] = useState([])
  const [prevMonthCheckInTotal, setPrevMonthCheckInTotal] = useState(0);
  const [prevMonthCheckOutTotal, setPrevMonthCheckOutTotal] = useState(0);
  const [monthAndYear, setMonthAndYear] = useState(new Date().toLocaleString("fr-FR", {
    year: "numeric"
  }));
  // use state for monthly salaries
  const [monthlySalaries, setMonthlySalaries] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  // chart ref
  const chartRef = useRef();
  // how to use chartRef


  useEffect(() => {
    getExpenses();
    getSalaries();
    getCategories();
    getChecks();
    getEvents();
    getPrevYearSalariesAndExpenses();
  }, [])

  const getExpenses = () => {
    setLoading(true)
    const year = new Date().getFullYear()
    axiosClient.get(`/user-expenses-year/${localStorage.getItem('USER_ID')}/${year}`)
      .then(({data}) => {
        setLoading(false)
        setExpenses(data.expenses)
        setTotalExpenses(data.total)
        setMonthlyExpenses(data.monthlyExpenses)
      })
      .catch(() => {
        setLoading(false)
      })
  }
  const getSalaries = () => {
    setLoading(true)
    // get the current year
    const year = new Date().getFullYear()
    axiosClient.get(`/user-salaries-year/${localStorage.getItem('USER_ID')}/${year}`)
      .then(({data}) => {
        setLoading(false)
        setSalaries(data.salaries)
        setTotalSalaries(data.total)
        setMonthlySalaries(data.monthlySalaries)
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
    const year = new Date().getFullYear()
    axiosClient.get(`/checks-valid-year/${userId}/${year}`)
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
    const year = new Date().getFullYear()
    axiosClient.get(`/user-events-year/${userId}/${year}`)
      .then(({data}) => {
        setLoading(false)
        setEvents(data.data)
      })
      .catch(() => {
        setLoading(false)
      })
  }


  const handleFilter = ev => {
    ev.preventDefault()
    const year = ev.target[0].value
    // check if is there an empty field
    if (!year) {
      setNotification('Veuillez remplir le champ année')
      return;
    }
    axiosClient.get(`/user-salaries-year/${localStorage.getItem('USER_ID')}/${year}`)
      .then(({data}) => {
        if (data.salaries.length === 0) {
          setNotification('No data found')
          setSalaries([])
          return;
        }
        setSalaries(data.salaries)
        setTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses-year/${localStorage.getItem('USER_ID')}/${year}`)
      .then(({data}) => {
        if (data.expenses.length === 0) {
          setNotification('No data found')
          setExpenses([])
          return;
        }
        setExpenses(data.expenses)
        setTotalExpenses(data.total)
      })
    axiosClient.get(`/checks-valid-year/${localStorage.getItem('USER_ID')}/${year}`)
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
    axiosClient.get(`/user-events-year/${localStorage.getItem('USER_ID')}/${year}`)
      .then(({data}) => {
        if (data.data.length === 0) {
          setNotification('No data found')
          setEvents([])
          return;
        }
        setEvents(data.data)
      })

    getPrevYearSalariesAndExpenses(year);
    // create a new date object with the month and year of the filter and set it to the state
    const date = new Date(year).toLocaleString('fr-FR', {year: 'numeric'});
    setMonthAndYear(date)
  }

  // get previous month salaries
  const getPrevYearSalariesAndExpenses = (yearFilter = null) => {
    const date = new Date();
    const year = date.getFullYear();
    axiosClient.get(`/user-salaries-year/${localStorage.getItem('USER_ID')}/${yearFilter ?? year - 1}`)
      .then(({data}) => {
        setPrevMonthTotalSalaries(data.total)
      })
    axiosClient.get(`/user-expenses-year/${localStorage.getItem('USER_ID')}/${yearFilter ?? year - 1}`)
      .then(({data}) => {
        setPrevMonthTotalExpenses(data.total)
      })
    axiosClient.get(`/checks-valid-year/${localStorage.getItem('USER_ID')}/${yearFilter ?? year - 1}`)
      .then(({data}) => {
        setPrevMonthCheckInTotal(data.totalEntrant)
        setPrevMonthCheckOutTotal(data.totalSortant)
      })
  }


  const resetFilter = () => {
    getSalaries()
    getExpenses()
    getCategories()
    getPrevYearSalariesAndExpenses()
    getChecks()
    getEvents()
    setMonthAndYear(new Date().toLocaleString('fr-FR', {
      month: 'long',
      year: "numeric"
    }))
  }

  function calculateTotals(expenses, salaries) {
    // Create a Set of unique months by combining the months from both arrays
    const months = new Set([
      ...expenses.map(expense => expense.date.slice(0, 7)),
      ...salaries.map(salary => salary.date.slice(0, 7))
    ]);

    // Convert the Set to an array and sort it in ascending order
    const sortedMonths = Array.from(months).sort();

    // Map over the sorted months and calculate the total salary and expense for each month
    const results = sortedMonths.map(month => {
      const totalSalary = salaries.filter(salary => salary.date.slice(0, 7) === month).reduce((acc, salary) => acc + parseFloat(salary.amount), 0);
      const totalExpense = expenses.filter(expense => expense.date.slice(0, 7) === month).reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
      return {
        month,
        totalSalary,
        totalExpense
      };
    });
    return results;
  }

  const results = calculateTotals(expenses, salaries);
  const dataBarChart = {
    labels: results.map(result => result.month.slice(0, 11)),
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
    labels: calculateTotals(expenses, salaries).map(group => group.month),
    datasets: [
      {
        label: 'Les dépenses par jour du mois',
        data: calculateTotals(expenses, salaries).map(group => group.totalExpense),
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
    labels: calculateTotals(expenses, salaries).map(group => group.month),
    datasets: [
      {
        label: 'Les salaires par mois',
        data: calculateTotals(expenses, salaries).map(group => group.totalSalary),
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
                </tr>
                </thead>
                <tbody>
                {
                  // loop through the object monthlySalaries
                  Object.keys(monthlySalaries).map((key, index) => {
                    // create date object from month name
                    const date = new Date(`${monthAndYear} ${key}`);
                    //
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2 text-capitalize">{date.toLocaleString('fr-FR', {
                          month: 'long',
                          year: "numeric"
                        })}</td>
                        <td className="border px-4 py-2">{monthlySalaries[key].toFixed(2).replace(/\.00$/, '')} DT</td>
                      </tr>
                    )
                  })
                }
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
                </tr>
                </thead>
                <tbody>
                {Object.keys(monthlyExpenses).map((key, index) => {
                    const date = new Date(`${monthAndYear} ${key}`);
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2 text-capitalize">{date.toLocaleString('fr-FR', {
                          month: 'long',
                          year: "numeric"
                        })}</td>
                        <td className="border px-4 py-2">{monthlyExpenses[key].toFixed(2).replace(/\.00$/, '')} DT</td>
                      </tr>)})}
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
                  <th className="px-4 py-2">Validé</th>
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
                      <td className="border px-4 py-2"> {check.validated ? 'Oui' : 'Non'}</td>
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
            <BarChart data={dataBarChart} title="Recette et dépense par mois"/>
          </div>
          <div className="basis-1/2 card page-break">
            <h4 className="text-center text-capitalize"></h4>
            <LineChart data={dataLineChartSalaries} title="évolution du recette par mois"/>
          </div>
        </div>
        <div className="flex mt-5 space-x-6">
          <div className="basis-1/2 card">
            <BarChart data={dataBarChartCategories} title="Dépense par catégorie" options={optionsBarChartCategories}/>
          </div>
          <div className="basis-1/2 card">
            <LineChart data={dataLineChartExpenses} title="évolution du dépense par mois"/>
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
