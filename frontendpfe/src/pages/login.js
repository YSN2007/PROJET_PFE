import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "./Auth.css";
import { useSettings } from "../context/SettingsContext";
import { clearLoginContext, getDashboardPathByRole, getLoginContext, getStoredRoleId, getStoredToken, saveAuthSession } from "../utils/auth";

function InputIcon({ name }) {
  const icons = {
    email: (
      <>
        <rect x="4" y="6" width="16" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m5.5 8 6.5 5 6.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    password: (
      <>
        <rect x="5" y="11" width="14" height="9" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 11V8.8A4 4 0 0 1 12 5a4 4 0 0 1 4 3.8V11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg className="input-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const loginContext = getLoginContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    const roleId = getStoredRoleId();

    if (token && roleId) {
      navigate(getDashboardPathByRole(roleId), { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", { email, password });
      saveAuthSession({
        token: res.data.token,
        user: res.data.user,
      });
      clearLoginContext();
      navigate(getDashboardPathByRole(res.data.user?.role_id), { replace: true });
    } catch (error){
      console.log(error.response?.data || error);
      alert(t("login.failed"));
    }
  };

  const roleId = Number(loginContext?.role_id);
  const isTrainerLogin = roleId === 2;
  const isStudentLogin = roleId === 3;
  const loginBadge = isTrainerLogin
    ? t("login.trainerBadge")
    : isStudentLogin
      ? t("login.studentBadge")
      : t("login.defaultBadge");
  const loginTitle = isTrainerLogin
    ? t("login.trainerTitle")
    : isStudentLogin
      ? t("login.studentTitle")
      : t("login.title");
  const loginSubtitle = isTrainerLogin
    ? t("login.trainerSubtitle")
    : isStudentLogin
      ? t("login.studentSubtitle")
      : t("login.subtitle");
  const heroTitle = isTrainerLogin
    ? t("login.trainerHeroTitle")
    : isStudentLogin
      ? t("login.studentHeroTitle")
      : t("login.heroTitle");
  const heroDescription = isTrainerLogin
    ? t("login.trainerHeroDescription")
    : isStudentLogin
      ? t("login.studentHeroDescription")
      : t("login.heroDescription");
  const emailPlaceholder = isTrainerLogin
    ? t("login.trainerEmailPlaceholder")
    : isStudentLogin
      ? t("login.studentEmailPlaceholder")
      : "admin@edumanager.ma";

  return (
    <motion.div
      className="auth-container auth-login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.section
        className="auth-showcase"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div className="auth-showcase-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}>
          <div className="brand-row">
            <div className="brand-mark">E</div>
            <span>{t("common.brand")}</span>
          </div>

          <div className={`auth-role-badge ${isTrainerLogin ? "trainer" : isStudentLogin ? "student" : "default"}`}>
            {loginBadge}
          </div>

          <h1>{heroTitle}</h1>

          <p>{heroDescription}</p>
        </motion.div>
      </motion.section>

      <motion.section
        className="auth-form-panel"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.06 }}
      >
        <motion.div className={`auth-box auth-box-login ${isTrainerLogin ? "trainer-login" : isStudentLogin ? "student-login" : ""}`} initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.42, ease: "easeOut", delay: 0.12 }}>
          <div className="auth-heading">
            <h2>{loginTitle}</h2>
            <p>{loginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group input-group-filled">
              <label htmlFor="email">{t("common.email")}</label>
              <div className="input-shell">
                <span className="input-icon"><InputIcon name="email" /></span>
                <input
                  id="email"
                  type="email"
                  placeholder={emailPlaceholder}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group input-group-filled">
              <label htmlFor="password">{t("common.password")}</label>
              <div className="input-shell">
                <span className="input-icon"><InputIcon name="password" /></span>
                <input
                  id="password"
                  type="password"
                  placeholder="........"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <motion.button className="btn" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
              {t("login.button")}
            </motion.button>

            <p className="auth-switch">
              {t("login.noAccount")}
              <span onClick={() => navigate("/register")}> {t("login.createAccount")}</span>
            </p>
          </form>
        </motion.div>
      </motion.section>
    </motion.div>
  );
}

export default Login;
