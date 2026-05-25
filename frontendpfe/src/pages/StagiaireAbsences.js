import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoleSpaceNav from "../components/RoleSpaceNav";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { notifyError } from "../utils/notifications";
import { clearAuthSession, getStoredUser } from "../utils/auth";
import "./RoleSpaces.css";

function StagiaireAbsences() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [data, setData] = useState({ stagiaire: null, absences: [] });
  const [isLoading, setIsLoading] = useState(true);
  const user = getStoredUser();
  const navItems = [
    { to: "/stagiaire/dashboard", label: t("common.nav.dashboard"), caption: t("roleSpaces.navOverview"), end: true },
    { to: "/stagiaire/notes", label: t("roleSpaces.openStudentNotes"), caption: t("roleSpaces.navNotes") },
    { to: "/stagiaire/absences", label: t("roleSpaces.openStudentAbsences"), caption: t("roleSpaces.navAbsences") },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/stagiaire/absences");
        setData(response.data);
      } catch (error) {
        console.error(error);
        notifyError(error?.response?.data?.message || t("register.error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.log(error);
    }
    clearAuthSession();
    navigate("/", { replace: true });
  };

  return (
    <motion.div className="role-space-page role-space-page-student" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="role-space-shell">
        <div className="role-space-card role-space-card-student">
          <div className="role-space-hero">
            <div className="role-space-topbar">
              <span className="role-space-kicker">{t("roleSpaces.studentSpace")}</span>
              <span className="role-space-role-badge">{user?.name || t("roleSpaces.studentSpace")}</span>
            </div>
            <h1>{t("roleSpaces.studentAbsencesPageTitle")}</h1>
            <p>{t("roleSpaces.studentAbsencesPageSubtitle")}</p>
          </div>

          <div className="role-space-content">
            <RoleSpaceNav items={navItems} />
            <section className="role-space-panel">
              <div className="role-space-panel-head">
                <h2>{t("roleSpaces.absencesListTitle")}</h2>
                <p>{t("roleSpaces.studentAbsencesSubtitle")}</p>
              </div>

              {isLoading ? (
                <div className="role-space-empty">{t("modules.loading")}</div>
              ) : !data.stagiaire ? (
                <div className="role-space-empty">{t("roleSpaces.noStudentProfile")}</div>
              ) : data.absences.length === 0 ? (
                <div className="role-space-empty">{t("absences.noneFound")}</div>
              ) : (
                <div className="role-space-preview-list">
                  {data.absences.map((absence) => (
                    <article key={absence.id} className="role-space-preview-card">
                      <div>
                        <strong>{String(absence.date_absence || "").slice(0, 10)}</strong>
                        <span>{absence.raison || t("absences.noReason")}</span>
                      </div>
                      <div className="role-space-preview-meta">
                        <span>{absence.justifie ? t("absences.yes") : t("absences.unjustifiedOnly")}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="role-space-actions">
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/stagiaire/dashboard")}>
                {t("common.nav.dashboard")}
              </button>
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/stagiaire/notes")}>
                {t("roleSpaces.openStudentNotes")}
              </button>
              <button type="button" className="role-space-btn ghost" onClick={handleLogout}>
                {t("common.logout")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StagiaireAbsences;
