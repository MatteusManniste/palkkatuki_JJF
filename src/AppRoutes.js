import { Routes, Route } from "react-router-dom";
import Laskuri from "./Laskuri";
import Auth from "./Auth";
import Hallintapaneeli from "./Hallintapaneeli";
import Etusivu from "./Etusivu";
import Editor from "./Editor";
import Sivu from "./Sivu";
import SivuEditor from "./SivuEditor";
import { AuthData } from "./backend/AuthWrapper";

const AppRoutes = () => {
  const auth = AuthData();

  const privateRoutes = [
    { path: "/hallintapaneeli", element: <Hallintapaneeli /> },
    { path: "/editor", element: <Editor /> },
    { path: "/sivueditor/:id", element: <SivuEditor /> }
  ];

  const NotFound = () => <h1>404 - Not Found</h1>;

  return (
    <Routes>
      {privateRoutes.map(({ path, element }) => {
        if (auth.isAuth) {
          return <Route key={path} path={path} element={element} />;
        }
        return null;
      })}
      <Route path="/" element={<Etusivu />} />
      <Route path="/sivu/:otsikko" element={<Sivu />} />
      <Route path="/laskuri" element={<Laskuri />} />
      <Route path="/login" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;