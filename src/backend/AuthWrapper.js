import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
export const AuthData = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3001/api/authStatus", { withCredentials: true }).then((response) => {
      setIsAuth(response.data.isAuth);
    }).catch(() => {
      setIsAuth(false);
    });
  }, []);

  useEffect(() => {
    console.log(isAuth);
  }, [isAuth]);

  const login = async (username, password) => {
    return await axios.post("http://localhost:3001/api/login", { username: username, password: password }, { withCredentials: true }).then((response) => {
      if (response.status === 200) {
        setIsAuth(true);
        return true;
      }
    }).catch(() => {
      return false;
    });
  };

  const logout = () => {
    axios.get("http://localhost:3001/api/logout", { withCredentials: true }).then((response) => {
      if (response.status === 200) {
        setIsAuth(false);
      }
    });
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};