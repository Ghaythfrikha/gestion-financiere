import {Link} from "react-router-dom";
import {createRef, useState} from "react";
import axiosClient from "../axios-client.js";
import {useStateContext} from "../context/ContextProvider.jsx";

export default function Signup() {
  const nameRef = createRef()
  const emailRef = createRef()
  const passwordRef = createRef()
  const passwordConfirmationRef = createRef()
  const {setUser, setToken} = useStateContext()
  const [errors, setErrors] = useState(null)

  const onSubmit = ev => {
    ev.preventDefault()

    if (!nameRef.current.value) {
      setErrors('Votre nom est obligatoire')
      return;
    }
    if (!emailRef.current.value) {
      setErrors('Votre adresse email est obligatoire')
      return;
    }
    if (!passwordRef.current.value) {
      setErrors('Votre mot de passe est obligatoire')
      return;
    }
    if (!passwordConfirmationRef.current.value) {
      setErrors('Vous devez confirmer votre mot de passe')
      return;
    }
    if (passwordRef.current.value !== passwordConfirmationRef.current.value) {
      setErrors('Les mots de passe ne correspondent pas')
      return;
    }
    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      password: passwordRef.current.value,
      password_confirmation: passwordConfirmationRef.current.value,
    }
    axiosClient.post('/signup', payload)
      .then(({data}) => {
        setUser(data.user)
        setToken(data.token);
        localStorage.setItem('USER_ID', data.user.id.toString())
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 422) {
          setErrors(response.data.message)
        }
      })
  }

  // onSubmit={onSubmit}
  /*{errors &&
            <div className="alert">
              {Object.keys(errors).map(key => (
                <p key={key}>{errors[key][0]}</p>
              ))}
            </div>
          }*/
  // ref={nameRef}
  // ref={emailRef}
  // ref={passwordRef}
  // ref={passwordConfirmationRef}
  // <Link to="/login">Sign In</Link>
  function translateErrorMessage(errorMessage) {
    switch (errorMessage) {
      case 'The password must be at least 8 characters. (and 2 more errors)':
        return 'Le mot de passe doit contenir au moins 8 caractères.';
      case 'The password must contain at least one symbol. (and 1 more error)':
        return 'Le mot de passe doit contenir au moins un caractère spécial.';
      case 'The password must contain at least one number.':
        return 'Le mot de passe doit contenir au moins un chiffre.';
      case 'The password must contain at least one symbol.':
        return 'Le mot de passe doit contenir au moins un caractère spécial.';
      default:
        return errorMessage;
    }
  }
  return (
    <section className="bg-gray-50 dark:bg-gray-900 animated fadeInDown">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div
          className="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Créer un compte
            </h1>
            {errors &&
              <div className="bg-red-600 p-2 text-white dark:bg-red-600 rounded">
                <p className="dark:text-white">{translateErrorMessage(errors)}</p>
              </div>
            }
            <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
              <div>
                <label htmlFor="nom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Votre nom
                </label>
                <input type="text" name="nom" id="nom" ref={nameRef}
                       className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                       placeholder="Votre nom" required=""/>
              </div>
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
                // help text
                <p className="text-xs text-gray-500 dark:text-gray-400 ">
                  Votre mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial.
                </p>
              </div>
              <div>
                <label htmlFor="password_confirmation"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Confirmer votre mot de passe
                </label>
                <input type="password" name="password_confirmation" id="password_confirmation" placeholder="••••••••" ref={passwordConfirmationRef}
                        className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required=""/>
              </div>
              <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Créer un compte
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Vous avez déjà un compte ?
                &nbsp;&nbsp;
                <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
