import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoleSpaceNav from "../components/RoleSpaceNav";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { notifyError } from "../utils/notifications";
import { clearAuthSession, getRoleLabelById, getStoredUser, saveAuthSession } from "../utils/auth";
import "./RoleSpaces.css";

const statsConfig = (t) => [
  { key: "notes", label: t("roleSpaces.studentNotes"), accent: "blue" },
  { key: "absences", label: t("roleSpaces.studentAbsences"), accent: "orange" },
  { key: "validated", label: t("roleSpaces.validatedModules"), accent: "green" },
  { key: "retake", label: t("roleSpaces.retakeModules"), accent: "red" },
];

function StagiaireDashboard() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/stagiaire/dashboard");
        setDashboardData(response.data);

        if (response.data?.user) {
          saveAuthSession({ token: localStorage.getItem("token"), user: response.data.user });
        }
      } catch (error) {
        console.error(error);
        notifyError(error?.response?.data?.message || t("register.error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
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

  const currentUser = dashboardData?.user ?? user;
  const stagiaire = dashboardData?.stagiaire;
  const stats = dashboardData?.stats ?? { notes: 0, absences: 0, validated: 0, retake: 0 };
  const notesPreview = dashboardData?.notes_preview ?? [];
  const absencesPreview = dashboardData?.absences_preview ?? [];
  const statCards = useMemo(() => statsConfig(t), [t]);
  const navItems = useMemo(
    () => [
      { to: "/stagiaire/dashboard", label: t("common.nav.dashboard"), caption: t("roleSpaces.navOverview"), end: true },
      { to: "/stagiaire/notes", label: t("roleSpaces.openStudentNotes"), caption: t("roleSpaces.navNotes") },
      { to: "/stagiaire/absences", label: t("roleSpaces.openStudentAbsences"), caption: t("roleSpaces.navAbsences") },
    ],
    [t]
  );

  return (
    <motion.div className="role-space-page role-space-page-student" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="role-space-shell">
        <div className="role-space-card role-space-card-student">
          <div className="role-space-hero">
            <div className="role-space-topbar">
              <span className="role-space-kicker">{t("roleSpaces.studentSpace")}</span>
              <span className="role-space-role-badge">{getRoleLabelById(currentUser?.role_id)}</span>
            </div>
            <h1>{t("roleSpaces.studentTitle")}</h1>
            <p>{t("roleSpaces.studentDashboardSubtitle")}</p>
          </div>

          <div className="role-space-content">
            <RoleSpaceNav items={navItems} />
            <div className="role-space-stats-grid">
              {statCards.map((card) => (
                <motion.article
                  key={card.key}
                  className={`role-space-stat-card ${card.accent}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span>{card.label}</span>
                  <strong>{isLoading ? "..." : stats[card.key] ?? 0}</strong>
                </motion.article>
              ))}
            </div>

            <div className="role-space-grid role-space-grid-dashboard">
              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.profileTitle")}</h2>
                  <p>{t("roleSpaces.profileSubtitle")}</p>
                </div>
                <div className="role-space-profile">
                  <div className="role-space-profile-item">
                    <span>{t("register.fullName")}</span>
                    <strong>{currentUser?.name || "-"}</strong>
                  </div>
                  <div className="role-space-profile-item">
                    <span>{t("common.email")}</span>
                    <strong>{currentUser?.email || "-"}</strong>
                  </div>
                  <div className="role-space-profile-item">
                    <span>{t("common.nav.groupes")}</span>
                    <strong>{stagiaire?.groupe?.nom_groupe || "-"}</strong>
                  </div>
                  <div className="role-space-profile-item">
                    <span>{t("groupes.filiere")}</span>
                    <strong>{stagiaire?.groupe?.filiere || "-"}</strong>
                  </div>
                </div>
              </section>

              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.allowedAccess")}</h2>
                  <p>{t("roleSpaces.allowedAccessSubtitle")}</p>
                </div>
                <ul className="role-space-list">
                  <li>{t("roleSpaces.studentAccess1")}</li>
                  <li>{t("roleSpaces.studentAccess2")}</li>
                  <li>{t("roleSpaces.studentAccess3")}</li>
                </ul>
              </section>

              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.quickActions")}</h2>
                  <p>{t("roleSpaces.quickActionsSubtitle")}</p>
                </div>
                <div className="role-space-quick-grid">
                  <button type="button" className="role-space-quick-card" onClick={() => navigate("/stagiaire/notes")}>
                    <strong>{t("roleSpaces.openStudentNotes")}</strong>
                    <span>{t("roleSpaces.openStudentNotesHint")}</span>
                  </button>
                  <button type="button" className="role-space-quick-card" onClick={() => navigate("/stagiaire/absences")}>
                    <strong>{t("roleSpaces.openStudentAbsences")}</strong>
                    <span>{t("roleSpaces.openStudentAbsencesHint")}</span>
                  </button>
                </div>
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.notesListTitle")}</h2>
                  <p>{t("roleSpaces.studentNotesSubtitle")}</p>
                </div>
                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : !stagiaire ? (
                  <div className="role-space-empty">{t("roleSpaces.noStudentProfile")}</div>
                ) : notesPreview.length === 0 ? (
                  <div className="role-space-empty">{t("notes.noNotes")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {notesPreview.map((noteItem) => (
                      <article key={noteItem.id} className="role-space-preview-card">
                        <div>
                          <strong>{noteItem.module || "-"}</strong>
                          <span>{noteItem.groupe || "-"}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <strong>{noteItem.note}/20</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.absencesListTitle")}</h2>
                  <p>{t("roleSpaces.studentAbsencesSubtitle")}</p>
                </div>
                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : !stagiaire ? (
                  <div className="role-space-empty">{t("roleSpaces.noStudentProfile")}</div>
                ) : absencesPreview.length === 0 ? (
                  <div className="role-space-empty">{t("absences.noneFound")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {absencesPreview.map((absence) => (
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
            </div>

            <div className="role-space-actions">
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/stagiaire/notes")}>
                {t("roleSpaces.openStudentNotes")}
              </button>
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/stagiaire/absences")}>
                {t("roleSpaces.openStudentAbsences")}
              </button>
              <button type="button" className="role-space-btn primary" onClick={() => window.location.reload()}>
                {t("roleSpaces.refreshSpace")}
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

export default StagiaireDashboard;
