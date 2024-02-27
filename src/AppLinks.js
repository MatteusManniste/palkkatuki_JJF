import { NavLink } from "react-router-dom";
import { AuthData } from "./backend/AuthWrapper";

const AppLinks = () => {
  const auth = AuthData();

  const privateLinks = [{ path: "/hallintapaneeli", name: "Hallintapaneeli" }, { path: "/upload", name: "Päivitä matriisi" }];

  return (
    <ul>
      <li>
        <NavLink to="/">Etusivu</NavLink>
      </li>
      {privateLinks.map(({ path, name }) => {
        if (auth.isAuth) {
          return (
            <li>
              <NavLink key={path} to={path}>
                {name}
              </NavLink>
            </li>
          );
        }
        return null;
      })}
      {auth.isAuth && (
        <li>
          <NavLink to="/" onClick={() => auth.logout()}>
            Kirjaudu ulos
          </NavLink>
        </li>
      )}
    </ul>
  );
};

export default AppLinks;
