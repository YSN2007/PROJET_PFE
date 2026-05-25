import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import "./Modules.css";
import { notifyError, notifySuccess } from "../utils/notifications";
import { useSettings } from "../context/SettingsContext";
import { clearAuthSession } from "../utils/auth";

const SIDEBAR_STORAGE_KEY = "appSidebarCollapsed";
const MODULES_LOCAL_STORAGE_KEY = "modulesDataLocal";
const MODULE_FORMATEUR_STORAGE_KEY = "moduleFormateurs";
const MODULE_STATUS_STORAGE_KEY = "moduleStatuses";
const MODULE_PROGRESS_STORAGE_KEY = "moduleProgress";
const MODULE_FAVORITES_STORAGE_KEY = "moduleFavorites";

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

function Icon({ name, className = "" }) {
  const map = {
    logo: <path d="M12 4 4 8l8 4 6-3v5h2V8L12 4Zm-4 7v3.5C8 16.4 9.8 18 12 18s4-1.6 4-3.5V11l-4 2-4-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
    dashboard: <><rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="4.5" width="6.5" height="9.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="4.5" y="13" width="6.5" height="6.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="13" y="16" width="6.5" height="3.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" /></>,
    stagiaires: <><circle cx="9" cy="8.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M4.5 18.5a4.8 4.8 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="16.8" cy="9.2" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M14.5 18a4 4 0 0 1 5-.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    groupes: <><path d="M3.8 8.8h5.2l1.7-2.8h5.9a2 2 0 0 1 2 2v1.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><rect x="3.8" y="8.8" width="16.4" height="10.4" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /></>,
    modules: <><path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h10.7v14.2H7.8A2.8 2.8 0 0 0 5 21V6.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="M8.2 4v14.2" fill="none" stroke="currentColor" strokeWidth="1.7" /></>,
    absences: <><rect x="4.5" y="6.2" width="15" height="13.3" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M8 4.5v3.3M16 4.5v3.3M4.5 10h15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    notes: <><path d="M6 18h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M7.5 15V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 15V6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    user: <><circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    logout: <><path d="M10 6H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M13 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    search: <><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m20 20-4.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    plus: <><path d="M12 5v14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
    clock: <><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M12 8.5v4l2.8 1.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    users: <><path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M4 18a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    edit: <><path d="m5 16.5 8.9-8.9 3.5 3.5-8.9 8.9L5 20l.1-3.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /><path d="m12.8 8.7 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    trash: <><path d="M6 7h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M8 7v11a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 18V7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></>,
    star: <path d="m12 4.5 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 4.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />,
  };
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">{map[name]}</svg>;
}

const toneByGroup = (code = "") => {
  const value = String(code).toUpperCase();
  if (value.startsWith("DEV")) return "blue";
  if (value.startsWith("INF") || value.startsWith("ID")) return "green";
  if (value.startsWith("GES") || value.startsWith("GE")) return "orange";
  if (value.startsWith("COM")) return "sky";
  return "blue";
};

const statusClass = (value = "") => (value.toLowerCase() === "active" ? "active" : value.toLowerCase() === "completed" ? "completed" : "not-started");
const progressClass = (value = 0) => (value > 70 ? "good" : value >= 40 ? "medium" : "low");
const getHoursDone = (hours = 0, progress = 0) => Math.round(((Number(hours) || 0) * (Number(progress) || 0)) / 100);
const getHoursLeft = (hours = 0, progress = 0) => Math.max(0, (Number(hours) || 0) - getHoursDone(hours, progress));

function highlightText(text, search) {
  if (!search || !text) return text;
  const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safe})`, "gi");
  return String(text).split(regex).filter(Boolean).map((part, index) => (
    part.toLowerCase() === search.toLowerCase() ? <mark key={`${part}-${index}`} className="module-highlight">{part}</mark> : part
  ));
}

const normalizeGroup = (item) => ({
  id: item?.id,
  code: item?.nom_groupe ?? item?.code ?? "Sans groupe",
  filiere: item?.filiere ?? "Non definie",
  stagiairesCount: Number(item?.stagiaires_count ?? item?.effectif ?? 0) || 0,
});

const getFormateurDisplayName = (formateur, fallback = "") => {
  if (formateur?.user?.name) return formateur.user.name;
  const fullName = [formateur?.prenom, formateur?.nom].filter(Boolean).join(" ").trim();
  return fullName || fallback;
};

function CustomSelect({ value, placeholder, options, onChange, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = () => setIsOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className={`custom-select ${className}`}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((current) => !current);
        }}
      >
        <span>{selectedOption?.label ?? placeholder}</span>
        <span className="custom-select-chevron">⌄</span>
      </button>

      {isOpen ? (
        <div className="custom-select-menu" onClick={(event) => event.stopPropagation()}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`custom-select-option ${String(option.value) === String(value) ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Modules() {
  const navigate = useNavigate();
  const { t, language } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [modules, setModules] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTrainer, setSelectedTrainer] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [formData, setFormData] = useState({ nom: "", groupeId: "", duree: "", formateurId: "", status: "active", progress: "70" });

  useEffect(() => {
    localStorage.removeItem("modules");
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [modulesRes, groupesRes, formateursRes] = await Promise.allSettled([api.get("/modules"), api.get("/groupes"), api.get("/formateurs")]);
        const groups = groupesRes.status === "fulfilled" && Array.isArray(groupesRes.value.data) ? groupesRes.value.data.map(normalizeGroup) : [];
        const trainersSource = formateursRes.status === "fulfilled" && Array.isArray(formateursRes.value.data) ? formateursRes.value.data : [];
        const savedModules = JSON.parse(localStorage.getItem(MODULES_LOCAL_STORAGE_KEY) || "[]");
        const savedFormateurs = JSON.parse(localStorage.getItem(MODULE_FORMATEUR_STORAGE_KEY) || "{}");
        const savedStatuses = JSON.parse(localStorage.getItem(MODULE_STATUS_STORAGE_KEY) || "{}");
        const savedProgress = JSON.parse(localStorage.getItem(MODULE_PROGRESS_STORAGE_KEY) || "{}");
        const savedFavorites = JSON.parse(localStorage.getItem(MODULE_FAVORITES_STORAGE_KEY) || "{}");
        const localOnlyModules = Array.isArray(savedModules) ? savedModules.filter((item) => String(item?.id || "").startsWith("local-")) : [];
        const source = [...(modulesRes.status === "fulfilled" && Array.isArray(modulesRes.value.data) ? modulesRes.value.data : []), ...localOnlyModules];
        const normalizedFormateurs = trainersSource.map((item) => ({
          ...item,
          displayName: getFormateurDisplayName(item, t("modules.notAssigned")),
        }));

        const normalized = source.map((item, index) => {
          const groupId = item?.groupId ?? item?.groupe_id ?? item?.group_id ?? item?.groupe?.id ?? "";
          const group = groups.find((entry) => String(entry.id) === String(groupId)) || groups.find((entry) => entry.code === (item?.groupCode ?? item?.groupe ?? item?.nom_groupe)) || null;
          const id = item?.id ?? `local-${index}`;
          const formateurId = item?.formateurId ?? item?.formateur_id ?? item?.formateur?.id ?? "";
          const linkedFormateur = normalizedFormateurs.find((entry) => String(entry.id) === String(formateurId));
          return {
            id,
            name: item?.name ?? item?.nom_module ?? item?.nom ?? `Module ${index + 1}`,
            trainer: linkedFormateur?.displayName ?? getFormateurDisplayName(item?.formateur, savedFormateurs[id] ?? item?.trainer ?? item?.professeur ?? item?.nom_formateur ?? t("modules.notAssigned")),
            formateurId: formateurId ? String(formateurId) : "",
            groupId: group?.id ?? groupId,
            groupCode: group?.code ?? item?.groupCode ?? item?.groupe ?? item?.nom_groupe ?? t("stagiaires.noGroup"),
            filiere: group?.filiere ?? item?.filiere ?? t("stagiaires.undefined"),
            hours: Number(item?.hours ?? item?.masse_horaire ?? item?.duree ?? 0) || 0,
            status: savedStatuses[id] ?? item?.status ?? item?.etat ?? "active",
            progress: Number(savedProgress[id] ?? item?.progress ?? 70) || 0,
            favorite: Boolean(savedFavorites[id] ?? item?.favorite),
            studentsCount: group?.stagiairesCount ?? (Number(item?.studentsCount ?? item?.stagiaires_count ?? 0) || 0),
          };
        });

        setGroupes(groups);
        setFormateurs(normalizedFormateurs);
        setModules(normalized);
      } catch (error) {
        console.error(error);
        notifyError(t("register.error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (modules.length === 0) return;
    localStorage.setItem(MODULES_LOCAL_STORAGE_KEY, JSON.stringify(modules));
    const formateurs = {};
    const statuses = {};
    const progress = {};
    const favorites = {};
    modules.forEach((moduleItem) => {
      formateurs[moduleItem.id] = moduleItem.trainer;
      statuses[moduleItem.id] = moduleItem.status;
      progress[moduleItem.id] = moduleItem.progress;
      favorites[moduleItem.id] = moduleItem.favorite;
    });
    localStorage.setItem(MODULE_FORMATEUR_STORAGE_KEY, JSON.stringify(formateurs));
    localStorage.setItem(MODULE_STATUS_STORAGE_KEY, JSON.stringify(statuses));
    localStorage.setItem(MODULE_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    localStorage.setItem(MODULE_FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [modules]);

  const trainers = useMemo(() => [...new Set(modules.map((item) => item.trainer).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [modules]);
  const formateurOptions = useMemo(
    () => formateurs.map((item) => ({ value: String(item.id), label: item.displayName })),
    [formateurs]
  );
  const groupOptions = useMemo(
    () => [{ value: "all", label: t("modules.allGroups") }, ...groupes.map((item) => ({ value: String(item.id), label: item.code }))],
    [groupes, t]
  );
  const trainerOptions = useMemo(
    () => [{ value: "all", label: t("modules.allTrainers") }, ...trainers.map((item) => ({ value: item, label: item }))],
    [trainers, t]
  );
  const filteredModules = useMemo(
    () =>
      modules.filter((item) => {
        const q = search.trim().toLowerCase();
        const bySearch = !q || item.name.toLowerCase().includes(q);
        const byGroup = selectedGroup === "all" || String(item.groupId) === selectedGroup;
        const byTrainer = selectedTrainer === "all" || item.trainer === selectedTrainer;
        return bySearch && byGroup && byTrainer;
      }),
    [modules, search, selectedGroup, selectedTrainer]
  );

  const navItems = [
    { to: "/dashboard", icon: "dashboard", label: t("common.nav.dashboard") },
    { to: "/stagiaires", icon: "stagiaires", label: t("common.nav.stagiaires") },
    { to: "/groupes", icon: "groupes", label: t("common.nav.groupes") },
    { to: "/modules", icon: "modules", label: t("common.nav.modules") },
    { to: "/absences", icon: "absences", label: t("common.nav.absences") },
    { to: "/notes", icon: "notes", label: t("common.nav.notes") },
  ];

  const statusLabels = {
    active: t("modules.active"),
    completed: t("modules.completed"),
    "not started": t("modules.notStarted"),
  };

  const closeModals = () => {
    setShowFormModal(false);
    setShowDetailsModal(false);
    setSelectedModule(null);
    setEditingId(null);
    setFormData({ nom: "", groupeId: "", duree: "", formateurId: "", status: "active", progress: "70" });
  };

  const openAddModal = () => {
    closeModals();
    setShowFormModal(true);
  };

  const openEditModal = (moduleItem) => {
    setEditingId(moduleItem.id);
    setFormData({
      nom: moduleItem.name,
      groupeId: String(moduleItem.groupId || ""),
      duree: String(moduleItem.hours || ""),
      formateurId: String(moduleItem.formateurId || ""),
      status: moduleItem.status,
      progress: String(moduleItem.progress),
    });
    setShowFormModal(true);
  };

  const openDetailsModal = (moduleItem) => {
    setSelectedModule(moduleItem);
    setShowDetailsModal(true);
  };

  const handleSaveModule = async (event) => {
    event.preventDefault();
    if (!formData.nom.trim() || !formData.groupeId || !formData.duree.trim()) {
      notifyError(t("register.error"));
      return;
    }

    const group = groupes.find((entry) => String(entry.id) === String(formData.groupeId));
    const currentModule = editingId ? modules.find((item) => String(item.id) === String(editingId)) : null;
    const payload = {
      nom_module: formData.nom.trim(),
      masse_horaire: Number(formData.duree) || 0,
      groupe_id: formData.groupeId,
      formateur_id: formData.formateurId ? Number(formData.formateurId) : null,
    };

    try {
      const response = editingId && !String(editingId).startsWith("local-")
        ? await api.put(`/modules/${editingId}`, payload)
        : await api.post("/modules", payload);

      const savedItem = response.data;
      const linkedFormateur = formateurs.find((entry) => String(entry.id) === String(savedItem?.formateur?.id ?? payload.formateur_id ?? ""));
      const normalizedModule = {
        id: savedItem.id,
        name: savedItem.nom_module ?? payload.nom_module,
        trainer: linkedFormateur?.displayName ?? getFormateurDisplayName(savedItem?.formateur, t("modules.notAssigned")),
        formateurId: savedItem?.formateur?.id ? String(savedItem.formateur.id) : payload.formateur_id ? String(payload.formateur_id) : "",
        groupId: group?.id ?? payload.groupe_id,
        groupCode: savedItem?.groupe?.nom_groupe ?? group?.code ?? t("stagiaires.noGroup"),
        filiere: savedItem?.groupe?.filiere ?? group?.filiere ?? t("stagiaires.undefined"),
        hours: Number(savedItem?.masse_horaire ?? payload.masse_horaire) || 0,
        status: currentModule?.status ?? formData.status,
        progress: currentModule?.progress ?? Math.max(0, Math.min(100, Number(formData.progress) || 0)),
        favorite: currentModule?.favorite ?? false,
        studentsCount: group?.stagiairesCount ?? currentModule?.studentsCount ?? 0,
      };

      setModules((current) => {
        const filteredCurrent = current.filter((item) => String(item.id) !== String(editingId));

        if (editingId) {
          const insertIndex = current.findIndex((item) => String(item.id) === String(editingId));
          if (insertIndex >= 0) {
            const next = [...filteredCurrent];
            next.splice(insertIndex, 0, normalizedModule);
            return next;
          }
        }

        return [normalizedModule, ...filteredCurrent];
      });

      notifySuccess("Operation reussie ✅");
      closeModals();
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || t("register.error"));
    }
  };

  const handleDeleteModule = async (id) => {
    if (!window.confirm(language === "en" ? "Delete this module?" : language === "ar" ? "هل تريد حذف هذه الوحدة؟" : "Supprimer ce module ?")) return;

    try {
      if (!String(id).startsWith("local-")) {
        await api.delete(`/modules/${id}`);
      }

      setModules((current) => current.filter((item) => item.id !== id));
      notifySuccess("Operation reussie ✅");
    } catch (error) {
      console.error(error);
      notifyError(error?.response?.data?.message || t("register.error"));
    }
  };

  const toggleFavorite = (id) => {
    setModules((current) => current.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item)));
  };

  return (
    <motion.div className={`modules-page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`} {...pageMotion}>
      <aside className="modules-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Icon name="logo" /></div>
          {!isSidebarCollapsed ? <div><h2>{t("common.brand")}</h2><p>{t("common.schoolManagement")}</p></div> : null}
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
              <Icon name={item.icon} />
              {!isSidebarCollapsed ? <span>{item.label}</span> : null}
              {item.to === "/modules" && !isSidebarCollapsed ? <i className="sidebar-dot" /> : null}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer"><button type="button" className="sidebar-collapse" onClick={() => setIsSidebarCollapsed((current) => !current)}>{isSidebarCollapsed ? "›" : "‹"}</button></div>
      </aside>
      <div className="modules-content">
        <header className="page-header">
          <div><h1>{t("modules.pageTitle")}</h1><p>{t("modules.pageSubtitle")}</p></div>
          <div className="header-actions">
            <div className="user-card"><div className="user-avatar"><Icon name="user" /></div><div><strong>{t("common.admin")}</strong><span>{t("common.administrator")}</span></div></div>
            <button type="button" className="header-icon-btn" onClick={() => { clearAuthSession(); navigate("/"); }} aria-label={t("common.logout")}><Icon name="logout" /></button>
          </div>
        </header>
        <main className="modules-body">
          <div className="section-top">
            <div><h2>{t("modules.pageTitle")}</h2><p>{t("modules.found", { count: filteredModules.length })}</p></div>
            <button type="button" className="primary-btn" onClick={openAddModal}><Icon name="plus" />{t("modules.addButton")}</button>
          </div>
          <div className="modules-toolbar">
            <div className="modules-search"><Icon name="search" /><input type="text" placeholder={t("modules.searchPlaceholder")} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <div className="modules-filter">
              <CustomSelect value={selectedGroup} placeholder={t("modules.allGroups")} options={groupOptions} onChange={setSelectedGroup} />
            </div>
            <div className="modules-filter">
              <CustomSelect value={selectedTrainer} placeholder={t("modules.allTrainers")} options={trainerOptions} onChange={setSelectedTrainer} />
            </div>
          </div>
          <motion.div className="modules-grid" layout>
            {isLoading ? <div className="empty-state">{t("modules.loading")}</div> : filteredModules.length === 0 ? <div className="empty-state">{t("modules.noneFound")}</div> : filteredModules.map((moduleItem) => {
              const tone = toneByGroup(moduleItem.groupCode);
              const hoursDone = getHoursDone(moduleItem.hours, moduleItem.progress);
              const hoursLeft = getHoursLeft(moduleItem.hours, moduleItem.progress);
              return (
                <motion.article key={moduleItem.id} layout className={`module-card ${tone} ${moduleItem.favorite ? "favorite" : ""}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.03, y: -3 }} transition={{ duration: 0.2, ease: "easeOut" }} onClick={() => openDetailsModal(moduleItem)}>
                  <div className="module-card-top">
                    <div className="module-icon-box"><Icon name="modules" /></div>
                    <div className="module-card-tools">
                      <div className="module-card-badges">
                        <span className={`module-badge ${tone}`}>{moduleItem.groupCode}</span>
                        <span className={`module-status-badge ${statusClass(moduleItem.status)}`}>{statusLabels[moduleItem.status] || moduleItem.status}</span>
                      </div>
                      <div className="module-actions" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className={`module-action module-action-favorite ${moduleItem.favorite ? "active" : ""}`} onClick={() => toggleFavorite(moduleItem.id)}><Icon name="star" /></button>
                        <button type="button" className="module-action module-action-edit" onClick={() => openEditModal(moduleItem)}><Icon name="edit" /></button>
                        <button type="button" className="module-action module-action-delete" onClick={() => handleDeleteModule(moduleItem.id)}><Icon name="trash" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="module-content-box"><h3>{highlightText(moduleItem.name, search)}</h3><p>{moduleItem.trainer}</p></div>
                  <div className="module-progress-block">
                    <div className="module-progress-head"><span>{t("modules.progress")}</span><strong>{moduleItem.progress}%</strong></div>
                    <div className="module-progress-track"><div className={`module-progress-fill ${progressClass(moduleItem.progress)}`} style={{ width: `${moduleItem.progress}%` }} /></div>
                    <div className="module-progress-caption"><span>{t("modules.hoursDone", { count: hoursDone })}</span><strong>{t("modules.hoursLeft", { count: hoursLeft })}</strong></div>
                  </div>
                  <div className="module-footer"><span className="module-meta"><Icon name="clock" />{t("modules.hoursTotal", { count: moduleItem.hours })}</span><span className="module-meta"><Icon name="users" />{t("modules.studentsCount", { count: moduleItem.studentsCount })}</span></div>
                </motion.article>
              );
            })}
          </motion.div>
        </main>
      </div>
      <AnimatePresence>{showFormModal ? <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModals}><motion.div className="modal-card" initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.22 }} onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3>{editingId ? t("modules.modalEdit") : t("modules.modalAdd")}</h3><button type="button" className="modal-close" onClick={closeModals}>x</button></div><form onSubmit={handleSaveModule}><div className="modal-grid"><div className="modal-field modal-field-full"><label>{t("modules.moduleName")}</label><input type="text" value={formData.nom} onChange={(event) => setFormData((current) => ({ ...current, nom: event.target.value }))} /></div><div className="modal-field"><label>{t("modules.group")}</label><select value={formData.groupeId} onChange={(event) => setFormData((current) => ({ ...current, groupeId: event.target.value }))}><option value="">{t("modules.selectGroup")}</option>{groupes.map((item) => <option key={item.id} value={String(item.id)}>{item.code}</option>)}</select></div><div className="modal-field"><label>{t("modules.duration")}</label><input type="number" min="0" value={formData.duree} onChange={(event) => setFormData((current) => ({ ...current, duree: event.target.value }))} /></div><div className="modal-field"><label>{t("modules.trainer")}</label><select value={formData.formateurId} onChange={(event) => setFormData((current) => ({ ...current, formateurId: event.target.value }))}><option value="">{t("modules.notAssigned")}</option>{formateurOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><div className="modal-field"><label>{t("stagiaires.status")}</label><select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}><option value="active">{t("modules.active")}</option><option value="completed">{t("modules.completed")}</option><option value="not started">{t("modules.notStarted")}</option></select></div><div className="modal-field modal-field-full"><div className="slider-field-head"><label>{t("modules.progress")} (%)</label><strong>{formData.progress}%</strong></div><input className="progress-slider" type="range" min="0" max="100" step="1" value={formData.progress} onChange={(event) => setFormData((current) => ({ ...current, progress: event.target.value }))} /><div className="slider-field-meta"><span>0%</span><span>{t("modules.hoursLeft", { count: getHoursLeft(formData.duree, formData.progress) })}</span><span>100%</span></div></div></div><div className="modal-actions"><button type="button" className="ghost-btn" onClick={closeModals}>{t("common.cancel")}</button><button type="submit" className="primary-btn">{editingId ? t("common.update") : t("common.add")}</button></div></form></motion.div></motion.div> : null}</AnimatePresence>
      <AnimatePresence>{showDetailsModal && selectedModule ? <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModals}><motion.div className="modal-card module-details-modal" initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.22 }} onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3>{t("modules.detailsTitle")}</h3><button type="button" className="modal-close" onClick={closeModals}>x</button></div><div className="module-details-grid"><div className="module-details-item module-details-item-full"><span>{t("modules.detailsModuleName")}</span><strong>{selectedModule.name}</strong></div><div className="module-details-item"><span>{t("modules.detailsTrainer")}</span><strong>{selectedModule.trainer}</strong></div><div className="module-details-item"><span>{t("modules.detailsGroup")}</span><strong>{selectedModule.groupCode}</strong></div><div className="module-details-item"><span>{t("modules.detailsHours")}</span><strong>{selectedModule.hours}h</strong></div><div className="module-details-item"><span>{t("modules.detailsRemaining")}</span><strong>{getHoursLeft(selectedModule.hours, selectedModule.progress)}h</strong></div><div className="module-details-item"><span>{t("modules.detailsTrainees")}</span><strong>{selectedModule.studentsCount}</strong></div></div><div className="modal-actions"><button type="button" className="ghost-btn" onClick={closeModals}>{t("modules.close")}</button></div></motion.div></motion.div> : null}</AnimatePresence>
    </motion.div>
  );
}
