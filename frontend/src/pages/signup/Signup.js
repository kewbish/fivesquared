import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
  const [issue, setIssue] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const fileUploadRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");

  const onSubmit = async (data) => {
    setIssue(false);
    console.log({
      username: data.username,
      password: data.password,
      bio: data.bio,
      dob: data.dob,
      img_url: imageUrl ? imageUrl : "https://placehold.co/400x400/grey/white?text=pfp"
    });

    const response = await fetch(
      "http://localhost:65535/signup",
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          username: data.username,
          password: data.password,
          bio: data.bio,
          dob: data.dob,
          img_url: imageUrl ? imageUrl : "https://placehold.co/400x400/grey/white?text=pfp"
        })
      }
    );
    const result = await response.json();
    if (result.success) {
      console.log("RESULT: ", result);
        setCookie('login_cookie', data.username);
        navigate(-1);
    } else {
        console.log("RESULT: ", result);
        setIssue(true);
    }
  };

  const fileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) {
        return 0;
    }
    const fileReader = new FileReader();
    fileReader.onload = (fileLoadedEvent) => {
        const file = fileLoadedEvent.target.result;
        setImageUrl(file);
    };
    fileReader.readAsDataURL(files[0]);
};

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
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Choose a username
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
              <label htmlFor="dob" className="block text-sm font-medium leading-6 text-gray-900">
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
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
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
                          <label htmlFor="image" className="block text-sm font-medium leading-6 text-gray-900">
                Choose a profile picture
              </label>
                            <label
                                htmlFor="af-submit-app-upload-images"
                                class="group p-4 sm:p-7 block cursor-pointer text-center border-2 border-dashed border-gray-200 rounded-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                            >
                                <input
                                    id="af-submit-app-upload-images"
                                    name="af-submit-app-upload-images"
                                    type="file"
                                    class="sr-only"
                                    onChange={fileUpload}
                                    ref={fileUploadRef}
                                />
                                <svg
                                    class="w-10 h-10 mx-auto text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path
                                        fill-rule="evenodd"
                                        d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"
                                    />
                                    <path
                                        d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                                </svg>
                                <span className="mt-2 block text-sm text-gray-800">
                  Browse your device or drag 'n drop
                </span>
                            </label>
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

          {issue ? <p className="mt-10 text-center text-sm text-red-500">
            Username taken. Please try a different one.
          </p> : <></>}

        </div>
      </div>
    </>
  )
}

export default Signup;