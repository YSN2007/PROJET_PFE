import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoleSpaceNav from "../components/RoleSpaceNav";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { notifyError } from "../utils/notifications";
import { clearAuthSession, getRoleLabelById, getStoredUser, saveAuthSession } from "../utils/auth";
import { getFormateurLocalAssignmentContext } from "../utils/formateurAssignments";
import "./RoleSpaces.css";

const statsConfig = (t) => [
  { key: "modules", label: t("roleSpaces.myModules"), accent: "blue" },
  { key: "stagiaires", label: t("roleSpaces.myStagiaires"), accent: "green" },
  { key: "notes", label: t("roleSpaces.notesScope"), accent: "orange" },
  { key: "absences", label: t("roleSpaces.absencesScope"), accent: "red" },
];

function FormateurDashboard() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useMemo(() => getStoredUser(), []);
  const currentUserName = dashboardData?.user?.name || user?.name || "";
  const localAssignmentContext = useMemo(
    () => getFormateurLocalAssignmentContext(currentUserName),
    [currentUserName]
  );

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);

      try {
        const response = await api.get("/formateur/dashboard", {
          params: localAssignmentContext.queryParams,
        });
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
  }, [localAssignmentContext.queryKey, localAssignmentContext.queryParams, t]);

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
  const backendStats = dashboardData?.stats ?? { modules: 0, stagiaires: 0, notes: 0, absences: 0 };
  const backendModulesPreview = dashboardData?.modules_preview ?? [];
  const backendStagiairesPreview = dashboardData?.stagiaires_preview ?? [];
  const shouldUseLocalAssignments =
    localAssignmentContext.hasAssignments &&
    backendStats.modules === 0 &&
    backendModulesPreview.length === 0;
  const stats = shouldUseLocalAssignments ? localAssignmentContext.stats : backendStats;
  const modulesPreview = shouldUseLocalAssignments
    ? localAssignmentContext.modules.map((moduleItem) => ({
        id: moduleItem.id,
        nom_module: moduleItem.name,
        masse_horaire: moduleItem.hours,
        groupe: moduleItem.groupCode,
        filiere: moduleItem.filiere,
      }))
    : backendModulesPreview;
  const stagiairesPreview = shouldUseLocalAssignments
    ? localAssignmentContext.groupSummaries.map((groupItem) => ({
        id: groupItem.id,
        nom_complet: `${groupItem.stagiairesCount} ${t("groupes.studentsWord")}`,
        email: groupItem.filiere || "-",
        groupe: groupItem.code,
      }))
    : backendStagiairesPreview;
  const statCards = useMemo(() => statsConfig(t), [t]);
  const navItems = useMemo(
    () => [
      { to: "/formateur/dashboard", label: t("common.nav.dashboard"), caption: t("roleSpaces.navOverview"), end: true },
      { to: "/formateur/notes", label: t("roleSpaces.openNotesSpace"), caption: t("roleSpaces.navNotes") },
      { to: "/formateur/absences", label: t("roleSpaces.openAbsencesSpace"), caption: t("roleSpaces.navAbsences") },
    ],
    [t]
  );

  return (
    <motion.div className="role-space-page role-space-page-trainer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <div className="role-space-shell">
        <div className="role-space-card role-space-card-trainer">
          <div className="role-space-hero">
            <div className="role-space-topbar">
              <span className="role-space-kicker">{t("roleSpaces.trainerSpace")}</span>
              <span className="role-space-role-badge">{getRoleLabelById(currentUser?.role_id)}</span>
            </div>
            <h1>{t("roleSpaces.trainerTitle")}</h1>
            <p>{t("roleSpaces.trainerDashboardSubtitle")}</p>
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
                  <h2>{t("roleSpaces.quickActions")}</h2>
                  <p>{t("roleSpaces.quickActionsSubtitle")}</p>
                </div>
                <div className="role-space-quick-grid">
                  <button type="button" className="role-space-quick-card" onClick={() => navigate("/formateur/notes")}>
                    <strong>{t("roleSpaces.addNote")}</strong>
                    <span>{t("roleSpaces.quickNoteHint")}</span>
                  </button>
                  <button type="button" className="role-space-quick-card" onClick={() => navigate("/formateur/absences")}>
                    <strong>{t("roleSpaces.addAbsence")}</strong>
                    <span>{t("roleSpaces.quickAbsenceHint")}</span>
                  </button>
                </div>
              </section>

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
                </div>
              </section>

              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.allowedAccess")}</h2>
                  <p>{t("roleSpaces.allowedAccessSubtitle")}</p>
                </div>
                <ul className="role-space-list">
                  <li>{t("roleSpaces.trainerAccess1")}</li>
                  <li>{t("roleSpaces.trainerAccess2")}</li>
                  <li>{t("roleSpaces.trainerAccess3")}</li>
                </ul>
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.assignedModules")}</h2>
                  <p>{t("roleSpaces.assignedModulesSubtitle")}</p>
                </div>
                {shouldUseLocalAssignments ? (
                  <div className="role-space-context-badge">{t("roleSpaces.localAssignmentsDetected")}</div>
                ) : null}
                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : modulesPreview.length === 0 ? (
                  <div className="role-space-empty">{t("roleSpaces.noModulesAssigned")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {modulesPreview.map((moduleItem) => (
                      <article key={moduleItem.id} className="role-space-preview-card">
                        <div>
                          <strong>{moduleItem.nom_module}</strong>
                          <span>{moduleItem.groupe || "-"}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <span>{moduleItem.filiere || "-"}</span>
                          <strong>{moduleItem.masse_horaire}h</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.myStagiaires")}</h2>
                  <p>{t("roleSpaces.assignedStagiairesSubtitle")}</p>
                </div>
                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : stagiairesPreview.length === 0 ? (
                  <div className="role-space-empty">{t("roleSpaces.noStagiairesAssigned")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {stagiairesPreview.map((stagiaire) => (
                      <article key={stagiaire.id} className="role-space-preview-card">
                        <div>
                          <strong>{stagiaire.nom_complet}</strong>
                          <span>{stagiaire.email || "-"}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <span>{stagiaire.groupe || "-"}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="role-space-actions">
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/formateur/notes")}>
                {t("roleSpaces.openNotesSpace")}
              </button>
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/formateur/absences")}>
                {t("roleSpaces.openAbsencesSpace")}
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

export default FormateurDashboard;
