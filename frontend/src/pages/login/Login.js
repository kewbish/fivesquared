import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function Login() {
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setIncorrectPassword(false);
    console.log(data);
    const response = await fetch(
      "http://localhost:65535/login/verify/",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          username: data.username,
          password: data.password
      })
      }
    );
    const result = await response.json();
    if (result.success) {
        setCookie('login_cookie', data.username);
        navigate(-1);
    } else {
        setIncorrectPassword(true);
    }
  };

  // NOTE: As was explicitly discussed and permitted by our TA Terry during the Milestone 3 review, we have based parts of the following component around
  // a component library example: https://tailwindui.com/components/application-ui/forms/sign-in-forms . The code was not auto-generated, and we made significant
  // changes to the template to style it with our project's specific goals.

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 ">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://th.bing.com/th/id/OIP.kM4ux4jP37Xu9dcXoeePSwHaHa?pid=ImgDet&rs=1"
            alt="Sign-in icon"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-5 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("username", { required: true })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("password", { required: true })}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-500 hover:bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          {incorrectPassword ? <p className="mt-10 text-center text-sm text-red-500">
            Incorrect username or password.
          </p> : <></>}

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{' '}
            <a href="/signup" className="font-semibold leading-6 text-blue-500 hover:text-blue-500">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login;