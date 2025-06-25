import React, {useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import axios from "../api/axios";


const Login = () => {
  const navigate = useNavigate();
  const loading = false

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("expenses/login/", {username: e.target.username.value, password: e.target.password.value},{ headers: {
          "Content-Type": "application/json"
        }});
      const userData = {
      username: response.data.username,
      is_staff: response.data.is_staff,
    };

    localStorage.setItem("user", JSON.stringify(userData));
      navigate("/");
    } catch (error) {
        console.log(error)
        if (error.response) {

            if (error.response.status === 400) {
            toast.error("Invalid username or password. Please try again.", { position: "top-right" });
            } else if (error.response.status === 401) {
            toast.error("Invalid username or password. Please try again.", { position: "top-right" });
            } else if (error.response.status === 500) {
            toast.error("Unauthorized access. Check your credentials.", { position: "top-right" });
            } else {
            toast.error(`Unexpected error: ${error.response.status}`, { position: "top-right" });
            }
        } else if (error.request) {
            toast.error("Network error. Please check your internet connection.",  { position: "top-right" });
        } else {
            toast.error("An unknown error occurred. Please try again.",  { position: "top-right" });
        } 
    }
  };


  return (
    <div>
      <ToastContainer /> 
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form method="POST" className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? <Spinner aria-label="Default status example" /> : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login