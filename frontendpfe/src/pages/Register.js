import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import "./Auth.css";
import { useSettings } from "../context/SettingsContext";
import { saveLoginContext } from "../utils/auth";

function extractRegisterError(error, fallback) {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const firstFieldErrors = Object.values(data.errors).find((value) => Array.isArray(value) && value.length > 0);
    if (firstFieldErrors) {
      return firstFieldErrors[0];
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}

function InputIcon({ name }) {
  const icons = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
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

function Register() {
  const navigate = useNavigate();
  const { t } = useSettings();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role_id: 2,
  });

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/register", form);
      saveLoginContext({
        role_id: Number(form.role_id),
        name: form.name,
      });
      alert(t("register.created"));
      navigate("/");
    } catch (error) {
      console.error("Register error:", error?.response?.data || error);
      alert(extractRegisterError(error, t("register.error")));
    }
  };

  return (
    <motion.div
      className="auth-container auth-register-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.div className="auth-box auth-box-register" initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.42, ease: "easeOut" }}>
        <div className="brand-row brand-row-centered brand-row-dark">
          <div className="brand-mark brand-mark-dark">E</div>
          <span>{t("common.brand")}</span>
        </div>

        <div className="auth-heading">
          <h2>{t("register.title")}</h2>
          <p>{t("register.subtitle")}</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group input-group-filled">
            <label htmlFor="name">{t("register.fullName")}</label>
            <div className="input-shell">
              <span className="input-icon"><InputIcon name="user" /></span>
              <input
                id="name"
                name="name"
                placeholder="Ahmed El Mansouri"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group input-group-filled">
            <label htmlFor="register-email">{t("common.email")}</label>
            <div className="input-shell">
              <span className="input-icon"><InputIcon name="email" /></span>
              <input
                id="register-email"
                name="email"
                type="email"
                placeholder="admin@edumanager.ma"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group input-group-filled">
            <label htmlFor="register-password">{t("common.password")}</label>
            <div className="input-shell">
              <span className="input-icon"><InputIcon name="password" /></span>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="........"
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="input-group input-group-filled">
            <label htmlFor="role">{t("register.role")}</label>
            <select id="role" name="role_id" className="select" onChange={handleChange}>
              <option value="2">{t("register.trainerRole")}</option>
              <option value="3">{t("register.studentRole")}</option>
            </select>
          </div>

          <motion.button className="btn" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
            {t("register.button")}
          </motion.button>

          <p className="auth-switch">
            {t("register.alreadyRegistered")}
            <span onClick={() => navigate("/")}> {t("register.signIn")}</span>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default Register;
