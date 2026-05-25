import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";
import "./RoleSpaces.css";

function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSettings();
  const redirectPath = location.state?.redirectPath || "/";

  return (
    <motion.div className="unauthorized-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="unauthorized-shell">
        <div className="unauthorized-card">
          <div className="unauthorized-hero">
            <span className="unauthorized-status">!</span>
            <h1>{t("unauthorized.title")}</h1>
            <p>{t("unauthorized.subtitle")}</p>
          </div>

          <div className="unauthorized-content">
            <div className="role-space-actions">
              <button type="button" className="unauthorized-btn primary" onClick={() => navigate(redirectPath, { replace: true })}>
                {t("unauthorized.backSpace")}
              </button>
              <button type="button" className="unauthorized-btn ghost" onClick={() => navigate("/", { replace: true })}>
                {t("unauthorized.backLogin")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Unauthorized;
