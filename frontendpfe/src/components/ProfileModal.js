import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "../context/SettingsContext";

function getInitials(nom, prenom) {
  return `${(nom || "").charAt(0)}${(prenom || "").charAt(0)}`.toUpperCase();
}

function getBadgeClass(filiere = "") {
  const value = filiere.toLowerCase();
  if (value.includes("dev")) return "dev";
  if (value.includes("infra") || value.includes("id")) return "infra";
  if (value.includes("gestion") || value.includes("ge")) return "gestion";
  if (value.includes("commerce")) return "commerce";
  return "neutral";
}

function getStatusClass(statut = "") {
  return statut.toLowerCase().includes("pause") || statut.toLowerCase().includes("inactif")
    ? "pause"
    : "active";
}

function ProfileModal({ open, loading, profileData, onClose }) {
  const { t } = useSettings();

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, open]);

  const stats = useMemo(() => {
    const notes = profileData?.notes || [];
    const average = notes.length
      ? (notes.reduce((sum, item) => sum + Number(item.note || 0), 0) / notes.length).toFixed(1)
      : "0.0";

    return {
      average,
      totalAbsences: Number(profileData?.absences || 0),
      totalModules: notes.length,
    };
  }, [profileData]);

  const stagiaire = profileData?.stagiaire;
  const groupe = profileData?.groupe || stagiaire?.groupe;
  const notes = profileData?.notes || [];
  const filiere = groupe?.filiere || t("stagiaires.undefined");
  const statut = profileData?.statut || t("stagiaires.active");
  const statusClass = getStatusClass(statut);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="profile-modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="profile-modal-card"
            onClick={(event) => event.stopPropagation()}
            initial={{ scale: 0.84, opacity: 0, y: 18 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.84, opacity: 0, y: 18 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            {loading ? (
              <div className="profile-modal-loading">
                <motion.div
                  className="profile-modal-spinner"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
                <p>{t("modules.loading")}</p>
              </div>
            ) : stagiaire ? (
              <>
                <div className="profile-modal-header">
                  <div className="profile-modal-identity">
                    <div className="profile-avatar">{getInitials(stagiaire.nom, stagiaire.prenom)}</div>
                    <div>
                      <h3>{`${stagiaire.nom || ""} ${stagiaire.prenom || ""}`.trim()}</h3>
                      <p>{stagiaire.email}</p>
                    </div>
                  </div>

                  <button type="button" className="profile-modal-close" onClick={onClose}>
                    x
                  </button>
                </div>

                <div className="profile-modal-info">
                  <div className="profile-info-item">
                    <span>{t("stagiaires.group")}</span>
                    <div className="profile-info-values">
                      <span className="group-pill">{groupe?.nom_groupe || t("stagiaires.noGroup")}</span>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <span>{t("stagiaires.filiere")}</span>
                    <div className="profile-info-values">
                      <span className={`badge ${getBadgeClass(filiere)}`}>{filiere}</span>
                    </div>
                  </div>

                  <div className="profile-info-item">
                    <span>{t("stagiaires.status")}</span>
                    <div className="profile-info-values">
                      <span className={`status-badge ${statusClass}`}>
                        {statusClass === "pause" ? t("notes.retake") : t("stagiaires.active")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-stats-grid">
                  <article className="profile-stat-card average">
                    <span>{t("notes.average")}</span>
                    <strong>{stats.average}/20</strong>
                  </article>

                  <article className="profile-stat-card">
                    <span>{t("absences.total")}</span>
                    <strong>{stats.totalAbsences}</strong>
                  </article>

                  <article className="profile-stat-card">
                    <span>{t("notes.totalLabel")}</span>
                    <strong>{stats.totalModules}</strong>
                  </article>
                </div>

                <div className="profile-performance-section">
                  <div className="profile-performance-head">
                    <h4>{t("notes.performance")}</h4>
                  </div>

                  {notes.length > 0 ? (
                    <div className="profile-performance-list">
                      {notes.map((item, index) => {
                        const value = Number(item.note || 0);
                        const isValidated = value >= 10;

                        return (
                          <motion.div
                            key={item.id}
                            className="profile-performance-row"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, delay: index * 0.04 }}
                            whileHover={{ y: -2, scale: 1.01 }}
                          >
                            <div className="profile-performance-main">
                              <span className="profile-module-name">
                                {item.module?.nom_module || item.module?.name || t("notes.moduleLabel")}
                              </span>
                              <strong className={`profile-note-value ${isValidated ? "success" : "danger"}`}>
                                {value}/20
                              </strong>
                            </div>

                            <span className={`profile-status-pill ${isValidated ? "success" : "danger"}`}>
                              {isValidated ? t("notes.validated") : t("notes.retake")}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="profile-empty-state">
                      <p>{t("notes.noNotes")}</p>
                    </div>
                  )}
                </div>

                <div className="profile-modal-footer">
                  <button type="button" className="ghost-btn" onClick={onClose}>
                    {t("common.cancel")}
                  </button>
                </div>
              </>
            ) : (
              <div className="profile-empty-state">
                <p>{t("register.error")}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProfileModal;
