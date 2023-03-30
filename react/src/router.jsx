import {createBrowserRouter, Navigate} from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Users from "./views/Users";
import UserForm from "./views/UserForm";
import Salary from "./views/Salary.jsx";
import SalaryForm from "./views/SalaryForm.jsx";
import Expense from "./views/Expense.jsx";
import Monthly from "./views/Monthly.jsx";
import Check from "./views/Check.jsx";
import CheckForm from "./views/CheckForm.jsx";
import Event from "./views/Event.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/users"/>
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/users',
        element: <Users/>
      },
      {
        path: '/users/new',
        element: <UserForm key="userCreate" />
      },
      {
        path: '/users/:id',
        element: <UserForm key="userUpdate" />
      },
      {
        path: '/salaries',
        element: <Salary/>
      },
      {
        path: '/salary/new',
        element: <SalaryForm key="salaryCreate" />
      },
      {
        path: '/expenses',
        element: <Expense/>
      },
      {
        path: '/expenses/new',
        element: <SalaryForm key="expenseCreate" />
      },
      {
        path: '/monthly',
        element: <Monthly/>
      },
      {
        path: '/check',
        element: <Check/>
      },
      {
        path: '/check/new',
        element: <CheckForm key="checkCreate" />
      },
      {
        path: '/check/:id',
        element: <CheckForm key="checkUpdate" />
      },
      {
        path: '/event',
        element: <Event key="eventCreate" />
      }
    ]
  },
  {
    path: '/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signup',
        element: <Signup/>
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

export default router;
