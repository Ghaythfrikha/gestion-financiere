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
import ExpenseForm from "./views/ExpenseForm.jsx";
import EventForm from "./views/EventForm.jsx";
import Annual from "./views/Annual.jsx";
import Category from "./views/Category.jsx";
import CategoryForm from "./views/CategoryForm.jsx";

const router = createBrowserRouter([
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/salaries"/>
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
        path: '/salary/:id',
        element: <SalaryForm key="salaryUpdate" />
      },
      {
        path: '/expenses',
        element: <Expense/>
      },
      {
        path: '/expense/new',
        element: <ExpenseForm key="expenseCreate" />
      },
      {
        path: '/expense/:id',
        element: <ExpenseForm key="salaryUpdate" />
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
      },
      {
        path: '/event/:id',
        element: <EventForm key="eventUpdate" />
      },
      {
        path: '/event/new',
        element: <EventForm key="eventCreate" />
      },
      {
        path: '/annual',
        element: <Annual/>
      },
      {
        path: '/categories',
        element: <Category/>
      },
      {
        path: '/category/new',
        element: <CategoryForm key="categoryCreate" />
      },
      {
        path: '/category/:id',
        element: <CategoryForm key="categoryUpdate" />
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
