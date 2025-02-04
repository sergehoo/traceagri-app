import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

function Login() {
  const [username, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [load, setLoad] = useState(false)
  const [message, setMessage] = useState("")
  const [view, setView] = useState(false)

  const [user, setUser] = useState(null)
  const [loadpage, setLoadpage] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setUser(JSON.parse(localStorage.getItem("token")))
      setLoadpage(false)
    }, 100);
  }, [])

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setLoad(true)
      setMessage("")
      const api = await fetch("https://traceagri.com/fr/auth/tablette/token/login/", {
        headers: { "Content-type": "application/json" },
        method: "post",
        body: JSON.stringify({ username, password }),
      });
      const res = await api.json();
      if (res && res.auth_token && res.auth_token !== "") {
        setTimeout(() => {
          localStorage.setItem("token", JSON.stringify({
            username,
            token: res.auth_token
          }))
          document.getElementById("redirecte").click()
          return
        }, 100);
      } else {
        setMessage("Identifiant ou mot de passe incorrect")
      }
      setLoad(false)
    } catch (error) {
      setMessage("Erreur survenue, verifiez votre connection internet!")
      setLoad(false)
    }
  };

  if (!load) {
    if (user && user !== undefined) {
      location.href = "/dash"
    }
    else {
      return (
        <div
          className="login d-flex justify-content-center align-items-center"
          style={{ height: "100vh", width: "100%" }}
        >
          <Link to="/dash" id="redirecte"></Link>
          <div className="container px-4">
            <img src="/img/logo2.png" className="img=fluid" width={"100%"} alt="" />
            <form className="row mt-4" onSubmit={(e) => submitForm(e)}>
              <div className="col-md-12">
                {message !== "" && <p className="bg-danger text-center p-2 text-white fw-bold mb-3 rounded-2">{message}</p>}
              </div>              <div className="col-md-12 mb-3">
                <input onChange={(e) => setLogin(e.target.value)} type="text" className="form-control form-control-lg" placeholder="Login" required />
              </div>
              <div className="col-md-12 mb-3">
                <div className="input-group">
                  <input className="form-control form-control-lg" type={!view ? "password" : "text"} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
                  <span className="input-group-text btn btn-primary d-flex justify-content-center align-items-center" id="basic-addon1" onClick={() => setView(!view)}>
                    {view ? (
                      <FaRegEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </span>
                </div>
              </div>
              <div>
                {!load ? (
                  <button type="submit" className="btn btn-success form-control">Login</button>
                ) : (
                  <button className="btn btn-warning form-control" type="button" disabled>
                    <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                    <span role="status">Loading...</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      );
    }
  }
}

export default Login;
