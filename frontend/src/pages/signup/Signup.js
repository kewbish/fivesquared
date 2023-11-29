import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../components/ImageUpload";
import { makeToast } from "../nav/Nav";

function Signup() {
  const [cookies, setCookie, removeCookie] = useCookies(["login_cookie"]);
  const [issue, setIssue] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");

  const onSubmit = async (data) => {
    setIssue(false);
    console.log({
      username: data.username,
      password: data.password,
      bio: data.bio,
      dob: data.dob,
      img_url: imageUrl
        ? imageUrl
        : "https://placehold.co/400x400/grey/white?text=pfp",
    });

    const response = await fetch("http://localhost:65535/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
        bio: data.bio,
        dob: data.dob,
        img_url: imageUrl
          ? imageUrl
          : "https://placehold.co/400x400/grey/white?text=pfp",
      }),
    });
    const result = await response.json();
    if (result.success) {
      console.log("RESULT: ", result);
      setCookie("login_cookie", data.username);
      makeToast('Signup successful!');
      navigate(-1);
    } else {
      console.log("RESULT: ", result);
      makeToast('Username taken. Please try a different one.', false);
      setIssue(true);
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
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Choose a username (this cannot be changed)
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Choose a password
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
              <label
                htmlFor="dob"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                When were you born? (your age will be displayed)
              </label>
              <div className="mt-2">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  autoComplete="date"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("dob", { required: true })}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Tell us a bit about you (this will be displayed)
              </label>
              <div className="mt-2">
                <textarea
                  maxLength={120}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("bio", { required: true })}
                />
              </div>
            </div>

            {imageUrl ? (
              <div className="relative">
                <button
                  type="button"
                  class="absolute top-4 right-4 py-1 px-2 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => setImageUrl("")}
                >
                  X
                </button>
                <img
                  src={imageUrl}
                  className="block w-full border border-gray-200 rounded-md shadow-sm text-sm text-gray-800"
                  alt="File upload preview"
                />
              </div>
            ) : (
              <div>
                <label
                  htmlFor="image"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Choose a profile picture
                </label>
                <ImageUpload setImageUrl={setImageUrl} />
              </div>
            )}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-blue-500 hover:bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign up!
              </button>
            </div>
          </form>

          {issue ? (
            <p className="mt-10 text-center text-sm text-red-500">
              Username taken. Please try a different one.
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}

export default Signup;
