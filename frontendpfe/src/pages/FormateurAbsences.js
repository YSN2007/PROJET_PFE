import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RoleSpaceNav from "../components/RoleSpaceNav";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { notifyError, notifySuccess } from "../utils/notifications";
import { clearAuthSession, getStoredUser } from "../utils/auth";
import { getFormateurLocalAssignmentContext } from "../utils/formateurAssignments";
import "./RoleSpaces.css";

function FormateurAbsences() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [data, setData] = useState({ modules: [], stagiaires: [], absences: [], formateur: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ stagiaire_id: "", date_absence: "", justifie: false, raison: "" });
  const user = useMemo(() => getStoredUser(), []);
  const localAssignmentContext = useMemo(
    () => getFormateurLocalAssignmentContext(user?.name),
    [user?.name]
  );
  const navItems = useMemo(
    () => [
      { to: "/formateur/dashboard", label: t("common.nav.dashboard"), caption: t("roleSpaces.navOverview"), end: true },
      { to: "/formateur/notes", label: t("roleSpaces.openNotesSpace"), caption: t("roleSpaces.navNotes") },
      { to: "/formateur/absences", label: t("roleSpaces.openAbsencesSpace"), caption: t("roleSpaces.navAbsences") },
    ],
    [t]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/formateur/absences", {
        params: localAssignmentContext.queryParams,
      });
      setData(response.data);
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || t("register.error"));
    } finally {
      setIsLoading(false);
    }
  }, [localAssignmentContext.queryParams, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.log(error);
    }
    clearAuthSession();
    navigate("/", { replace: true });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ stagiaire_id: "", date_absence: "", justifie: false, raison: "" });
  };

  const handleEdit = (absence) => {
    setEditingId(absence.id);
    setFormData({
      stagiaire_id: String(absence.stagiaire_id || absence.stagiaire?.id || ""),
      date_absence: String(absence.date_absence || "").slice(0, 10),
      justifie: Boolean(absence.justifie),
      raison: absence.raison || "",
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.stagiaire_id || !formData.date_absence) {
      notifyError(t("register.error"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        stagiaire_id: Number(formData.stagiaire_id),
        date_absence: formData.date_absence,
        justifie: Boolean(formData.justifie),
        raison: formData.raison.trim() || null,
      };

      if (editingId) {
        await api.put(`/formateur/absences/${editingId}`, payload, {
          params: localAssignmentContext.queryParams,
        });
      } else {
        await api.post("/formateur/absences", payload, {
          params: localAssignmentContext.queryParams,
        });
      }

      notifySuccess("Operation reussie ✅");
      resetForm();
      await fetchData();
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || t("register.error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div className="role-space-page role-space-page-trainer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="role-space-shell">
        <div className="role-space-card role-space-card-trainer">
          <div className="role-space-hero">
            <div className="role-space-topbar">
              <span className="role-space-kicker">{t("roleSpaces.trainerSpace")}</span>
              <span className="role-space-role-badge">{user?.name || "Formateur"}</span>
            </div>
            <h1>{t("roleSpaces.absencesPageTitle")}</h1>
            <p>{t("roleSpaces.absencesPageSubtitle")}</p>
          </div>

          <div className="role-space-content">
            <RoleSpaceNav items={navItems} />
            <div className="role-space-grid role-space-grid-dashboard">
              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{editingId ? t("roleSpaces.editAbsence") : t("roleSpaces.addAbsence")}</h2>
                  <p>{t("roleSpaces.absenceFormHint")}</p>
                </div>

                <form className="role-space-form" onSubmit={handleSave}>
                  <label className="role-space-field">
                    <span>{t("absences.trainee")}</span>
                    <select value={formData.stagiaire_id} onChange={(event) => setFormData((current) => ({ ...current, stagiaire_id: event.target.value }))}>
                      <option value="">{t("roleSpaces.selectTrainee")}</option>
                      {(data.stagiaires || []).map((stagiaire) => (
                        <option key={stagiaire.id} value={stagiaire.id}>
                          {`${stagiaire.prenom || ""} ${stagiaire.nom || ""}`.trim()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="role-space-field">
                    <span>{t("absences.date")}</span>
                    <input
                      type="date"
                      min="2026-01-01"
                      max="2026-12-31"
                      value={formData.date_absence}
                      onChange={(event) => setFormData((current) => ({ ...current, date_absence: event.target.value }))}
                    />
                  </label>

                  <label className="role-space-field">
                    <span>{t("absences.reason")}</span>
                    <textarea
                      value={formData.raison}
                      onChange={(event) => setFormData((current) => ({ ...current, raison: event.target.value }))}
                      placeholder={t("absences.reasonPlaceholder")}
                    />
                  </label>

                  <label className="role-space-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.justifie}
                      onChange={(event) => setFormData((current) => ({ ...current, justifie: event.target.checked }))}
                    />
                    <span>{t("absences.justifiedAbsence")}</span>
                  </label>

                  <div className="role-space-actions">
                    <button type="submit" className="role-space-btn primary" disabled={isSaving}>
                      {editingId ? t("common.update") : t("common.add")}
                    </button>
                    <button type="button" className="role-space-btn ghost" onClick={resetForm}>
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              </section>

              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.myStagiaires")}</h2>
                  <p>{t("roleSpaces.absenceScopeHint")}</p>
                </div>
                {localAssignmentContext.hasAssignments && (!data.stagiaires || data.stagiaires.length === 0) ? (
                  <div className="role-space-context-badge">{t("roleSpaces.localAssignmentsDetected")}</div>
                ) : null}

                <div className="role-space-preview-list">
                  {(data.stagiaires || []).length === 0 ? (
                    <div className="role-space-empty">{t("roleSpaces.noStagiairesAssigned")}</div>
                  ) : (
                    data.stagiaires.map((stagiaire) => (
                      <article key={stagiaire.id} className="role-space-preview-card">
                        <div>
                          <strong>{`${stagiaire.prenom || ""} ${stagiaire.nom || ""}`.trim()}</strong>
                          <span>{stagiaire.email || "-"}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <span>{stagiaire.groupe?.nom_groupe || "-"}</span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.absencesListTitle")}</h2>
                  <p>{t("roleSpaces.absencesListSubtitle")}</p>
                </div>

                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : (data.absences || []).length === 0 ? (
                  <div className="role-space-empty">{t("absences.noneFound")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {data.absences.map((absence) => (
                      <article key={absence.id} className="role-space-preview-card role-space-action-card">
                        <div>
                          <strong>{`${absence.stagiaire?.prenom || ""} ${absence.stagiaire?.nom || ""}`.trim()}</strong>
                          <span>{String(absence.date_absence || "").slice(0, 10)}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <span>{absence.justifie ? t("absences.yes") : t("absences.unjustifiedOnly")}</span>
                          <button type="button" className="role-space-inline-btn" onClick={() => handleEdit(absence)}>
                            {t("common.update")}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="role-space-actions">
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/formateur/dashboard")}>
                {t("common.nav.dashboard")}
              </button>
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/formateur/notes")}>
                {t("roleSpaces.openNotesSpace")}
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

export default FormateurAbsences;
