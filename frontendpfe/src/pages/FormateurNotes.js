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

function FormateurNotes() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [data, setData] = useState({ modules: [], stagiaires: [], notes: [], formateur: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ stagiaire_id: "", module_id: "", note: "" });
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
      const response = await api.get("/formateur/notes", {
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

  const selectedStagiaire = useMemo(
    () => (data.stagiaires || []).find((item) => String(item.id) === String(formData.stagiaire_id)) || null,
    [data.stagiaires, formData.stagiaire_id]
  );

  const availableModules = useMemo(() => {
    if (!selectedStagiaire) return data.modules || [];
    return (data.modules || []).filter((moduleItem) => String(moduleItem.groupe_id) === String(selectedStagiaire.groupe_id));
  }, [data.modules, selectedStagiaire]);

  useEffect(() => {
    if (!formData.stagiaire_id) return;
    if (!availableModules.some((moduleItem) => String(moduleItem.id) === String(formData.module_id))) {
      setFormData((current) => ({ ...current, module_id: "" }));
    }
  }, [availableModules, formData.module_id, formData.stagiaire_id]);

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
    setFormData({ stagiaire_id: "", module_id: "", note: "" });
  };

  const handleEdit = (noteItem) => {
    setEditingId(noteItem.id);
    setFormData({
      stagiaire_id: String(noteItem.stagiaire_id || noteItem.stagiaire?.id || ""),
      module_id: String(noteItem.module_id || noteItem.module?.id || ""),
      note: String(noteItem.note ?? ""),
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.stagiaire_id || !formData.module_id || formData.note === "") {
      notifyError(t("register.error"));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        stagiaire_id: Number(formData.stagiaire_id),
        module_id: Number(formData.module_id),
        note: Number(formData.note),
      };

      if (editingId) {
        await api.put(
          `/formateur/notes/${editingId}`,
          { note: payload.note },
          { params: localAssignmentContext.queryParams }
        );
      } else {
        await api.post("/formateur/notes", payload, {
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
            <h1>{t("roleSpaces.notesPageTitle")}</h1>
            <p>{t("roleSpaces.notesPageSubtitle")}</p>
          </div>

          <div className="role-space-content">
            <RoleSpaceNav items={navItems} />
            <div className="role-space-grid role-space-grid-dashboard">
              <section className="role-space-panel">
                <div className="role-space-panel-head">
                  <h2>{editingId ? t("roleSpaces.editNote") : t("roleSpaces.addNote")}</h2>
                  <p>{t("roleSpaces.noteFormHint")}</p>
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
                    <span>{t("absences.module")}</span>
                    <select value={formData.module_id} onChange={(event) => setFormData((current) => ({ ...current, module_id: event.target.value }))}>
                      <option value="">{t("roleSpaces.selectModule")}</option>
                      {availableModules.map((moduleItem) => (
                        <option key={moduleItem.id} value={moduleItem.id}>
                          {moduleItem.nom_module}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="role-space-field">
                    <span>{t("notes.note")}</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={formData.note}
                      onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))}
                    />
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
                  <h2>{t("roleSpaces.assignedModules")}</h2>
                  <p>{t("roleSpaces.noteScopeHint")}</p>
                </div>
                {localAssignmentContext.hasAssignments && (!data.modules || data.modules.length === 0) ? (
                  <div className="role-space-context-badge">{t("roleSpaces.localAssignmentsDetected")}</div>
                ) : null}

                <div className="role-space-preview-list">
                  {(data.modules || []).length === 0 ? (
                    <div className="role-space-empty">{t("roleSpaces.noModulesAssigned")}</div>
                  ) : (
                    data.modules.map((moduleItem) => (
                      <article key={moduleItem.id} className="role-space-preview-card">
                        <div>
                          <strong>{moduleItem.nom_module}</strong>
                          <span>{moduleItem.groupe?.nom_groupe || "-"}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <span>{moduleItem.groupe?.filiere || "-"}</span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>

              <section className="role-space-panel role-space-panel-wide">
                <div className="role-space-panel-head">
                  <h2>{t("roleSpaces.notesListTitle")}</h2>
                  <p>{t("roleSpaces.notesListSubtitle")}</p>
                </div>

                {isLoading ? (
                  <div className="role-space-empty">{t("modules.loading")}</div>
                ) : (data.notes || []).length === 0 ? (
                  <div className="role-space-empty">{t("notes.noNotes")}</div>
                ) : (
                  <div className="role-space-preview-list">
                    {data.notes.map((noteItem) => (
                      <article key={noteItem.id} className="role-space-preview-card role-space-action-card">
                        <div>
                          <strong>{noteItem.module?.nom_module || "-"}</strong>
                          <span>{`${noteItem.stagiaire?.prenom || ""} ${noteItem.stagiaire?.nom || ""}`.trim()}</span>
                        </div>
                        <div className="role-space-preview-meta">
                          <strong>{noteItem.note}/20</strong>
                          <button type="button" className="role-space-inline-btn" onClick={() => handleEdit(noteItem)}>
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
              <button type="button" className="role-space-btn ghost" onClick={() => navigate("/formateur/absences")}>
                {t("roleSpaces.openAbsencesSpace")}
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

export default FormateurNotes;
