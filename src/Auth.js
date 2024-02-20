import { useNavigate } from "react-router-dom";
import { AuthData } from "./backend/AuthWrapper";
import { useState } from "react";
import "./css/Auth.css";

const Auth = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const auth = AuthData();

  const handleLogout = (e) => {
    e.preventDefault();

    auth.logout();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const success = await auth.login(
      e.target.username.value,
      e.target.password.value
    );

    if (success) {
      setError("");
      navigate("/hallintapaneeli");
    } else {
      e.target.password.value = "";
      setError("Virheellinen käyttäjätunnus tai salasana");
    }
  };

  return (
    <section>
      {auth.isAuth ? (
        <form className="logout" action="" onSubmit={(e) => handleLogout(e)}>
          <h1 className="logout-title">Olet jo kirjautuneena sisään</h1>
          <button className="logout-button" type="submit">
            Kirjaudu ulos
          </button>
        </form>
      ) : (
        <form className="login" action="" onSubmit={(e) => handleLogin(e)}>
          <h1 className="login-title">Kirjaudu sisään hallintapaneeliin</h1>
          <input
            className="login-username"
            type="text"
            name="username"
            placeholder="Käyttäjätunnus..."
            autoComplete="off"
            onInput={() => setError("")}
          />
          <input
            className="login-password"
            type="password"
            name="password"
            placeholder="Salasana..."
            autoComplete="off"
            onInput={() => setError("")}
          />
          <span className="login-error">{error}</span>
          <button className="login-button" type="submit">
            Kirjaudu sisään
          </button>
        </form>
      )}
    </section>
  );
};

export default Auth;
