import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import "./Login.css";
import { useCookies } from "react-cookie";
import { Modal } from 'antd';

function Login({showLogin}) {
  const [cookies, setCookie, removeCookie] = useCookies(['login_cookie']);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [incorrectPassword, setIncorrectPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(showLogin);
  
  useEffect(() => {
    setIsModalOpen(showLogin);
  }, [showLogin]);

  const onClose = () => {
    setIsModalOpen(false);
    setCookie('login_cookie', null);
  }

  const onSubmit = async (data) => {
    setIncorrectPassword(false);
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
        setIsModalOpen(false);
    } else {
        setIncorrectPassword(true);
    }
  };  

  const modalStyle = {
    'display': 'flex',
  }

  return (
    <Modal style={modalStyle} maskClosable={true} open={isModalOpen} footer={null} closeIcon={false} className="Modal" width={'30vw'}>
      <button className="close" onClick={onClose}>X</button>
      <p className="title">Log In</p>
      <form className="Form" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Username" {...register("username", { required: true })} />
        <input type="password" placeholder="Password" {...register("password", { required: true })} />
        {incorrectPassword ? <p style={{ color: "red"}}>Incorrect username or password.</p> : <></>}
        <input type={"submit"} style={{ backgroundColor: "gray" }} />
      </form>
    </Modal>
  );
}

export default Login;