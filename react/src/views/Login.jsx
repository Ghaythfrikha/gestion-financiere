import {Link} from "react-router-dom";
import axiosClient from "../axios-client.js";
import {createRef} from "react";
import {useStateContext} from "../context/ContextProvider.jsx";
import { useState } from "react";

export default function Login() {
  const emailRef = createRef()
  const passwordRef = createRef()
  const { setUser, setToken } = useStateContext()
  const [message, setMessage] = useState(null)
  function translateErrorMessage(errorMessage) {
    switch (errorMessage) {
      case 'Provided email or password is incorrect':
        return 'Adresse email ou mot de passe incorrect.';
      case 'The selected email is invalid.':
        return 'Adresse email ou mot de passe incorrect.';
      default:
        return errorMessage;
    }
  }
  const onSubmit = ev => {
    ev.preventDefault()
    if (!emailRef.current.value) {
      setMessage('Adresse email est obligatoire')
      return;
    }
    if (!passwordRef.current.value) {
      setMessage('Mot de passe est obligatoire')
      return;
    }
    const payload = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    }
    axiosClient.post('/login', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
        // store id in local storage
        localStorage.setItem('USER_ID', data.user.id.toString())
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status === 422) {
          setMessage(response.data.message)
        }
      })
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 animated fadeInDown">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div
          className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Bienvenue à nouveau
            </h1>
            {message &&
              <div className="bg-red-600 p-2 text-white dark:bg-red-600 rounded">
                <p className="dark:text-white">{translateErrorMessage(message)}</p>
              </div>
            }
            <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Votre email
                </label>
                <input type="email" name="email" id="email" ref={emailRef}
                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="example@example.com" required=""/>
              </div>
              <div>
                <label htmlFor="password"
                       className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Votre mot de passe
                </label>
                <input type="password" name="password" id="password" placeholder="••••••••" ref={passwordRef}
                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       required=""/>
              </div>
              <div className="flex items-center justify-between">
                <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Mot de passe oublié ?
                </a>
              </div>
              <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Se connecter
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Vous n'avez pas de compte ?&nbsp;&nbsp;
                <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Créer un compte
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
