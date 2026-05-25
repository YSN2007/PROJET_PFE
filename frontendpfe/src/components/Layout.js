import { Link } from "react-router-dom";
import { clearAuthSession } from "../utils/auth";

function Layout({ children }) {

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <div className="layout">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>OFPPT</h2>

        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/stagiaires">Stagiaires</Link></li>
          <li><Link to="/groupes">Groupes</Link></li>
          <li><Link to="/modules">Modules</Link></li>
        </ul>

        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main */}
      <div className="main">
        {children}
      </div>

    </div>
  );
}

export default Layout;
