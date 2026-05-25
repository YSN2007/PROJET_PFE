import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";
import "./Groupes.css";
import { useSettings } from "../context/SettingsContext";
import { notifyError, notifySuccess } from "../utils/notifications";
import { clearAuthSession } from "../utils/auth";

const GROUP_YEAR_STORAGE_KEY = "groupYears";
const NOTES_STORAGE_KEY = "manualNotesByStagiaire";
const SIDEBAR_STORAGE_KEY = "appSidebarCollapsed";

const pageMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

const listMotion = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const rowMotion = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function Icon({ name, className = "" }) {
  const icons = {
    logo: (
      <path
        d="M12 4 4 8l8 4 6-3v5h2V8L12 4Zm-4 7v3.5C8 16.4 9.8 18 12 18s4-1.6 4-3.5V11l-4 2-4-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    dashboard: (
      <>
        <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13" y="4.5" width="6.5" height="9.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13" y="16" width="6.5" height="3.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </>
    ),
    stagiaires: (
      <>
        <circle cx="9" cy="8.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 18.5a4.8 4.8 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="16.8" cy="9.2" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M14.5 18a4 4 0 0 1 5-.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    groupes: (
      <>
        <path d="M3.8 8.8h5.2l1.7-2.8h5.9a2 2 0 0 1 2 2v1.1" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3.8" y="8.8" width="16.4" height="10.4" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </>
    ),
    modules: (
      <>
        <path d="M5 6.8A2.8 2.8 0 0 1 7.8 4h10.7v14.2H7.8A2.8 2.8 0 0 0 5 21V6.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8.2 4v14.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M11.2 7.6h4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    absences: (
      <>
        <rect x="4.5" y="6.2" width="15" height="13.3" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 4.5v3.3M16 4.5v3.3M4.5 10h15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="m9.2 14 1.8 1.8 3.8-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    notes: (
      <>
        <path d="M6 18h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7.5 15V9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 15V6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16.5 15v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    logout: (
      <>
        <path d="M10 6H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M13 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 12H9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    search: <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />,
    searchTail: <path d="m20 20-4.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
    plus: (
      <>
        <path d="M12 5v14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    chevron: (
      <path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
    trash: (
      <>
        <path d="M6 7h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8 7v11a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 16 18V7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M10.5 10.5v5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M13.5 10.5v5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    users: (
      <>
        <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4 18a4.5 4.5 0 0 1 9 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16.8 10.5a2.4 2.4 0 1 0 0-4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M16.2 18a4 4 0 0 1 3.8-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  };

  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {name === "search" ? (
        <>
          {icons.search}
          {icons.searchTail}
        </>
      ) : (
        icons[name]
      )}
    </svg>
  );
}

function getBadgeClass(filiere = "") {
  const value = filiere.toLowerCase();
  if (value.includes("dev")) return "dev";
  if (value.includes("infra") || value.includes("id")) return "infra";
  if (value.includes("gestion") || value.includes("ge")) return "gestion";
  if (value.includes("commerce")) return "commerce";
  return "neutral";
}

function getYearLabel(code = "") {
  if (code.endsWith("101") || code.endsWith("102")) return "1ere annee";
  if (code.endsWith("201") || code.endsWith("202")) return "2eme annee";
  return "3eme annee";
}

function getAverageTone(value, t) {
  const average = Number(value || 0);
  if (average >= 14) return { label: t("groupes.good"), className: "good" };
  if (average >= 10) return { label: t("groupes.medium"), className: "medium" };
  return { label: t("groupes.low"), className: "low" };
}

function getAbsenceTone(value, t) {
  const rate = Number(value || 0);
  if (rate < 10) return { label: t("groupes.low"), className: "good" };
  if (rate <= 20) return { label: t("groupes.medium"), className: "medium" };
  return { label: t("groupes.high"), className: "low" };
}

function getCapacityTone(value) {
  if (value < 50) return "low";
  if (value < 80) return "medium";
  return "good";
}

function getGroupeStatus(count, t) {
  const total = Number(count || 0);
  if (total >= 25) return { label: t("groupes.full"), className: "full" };
  if (total >= 15) return { label: t("groupes.medium"), className: "medium" };
  return { label: t("groupes.low"), className: "low" };
}

function CountUpValue({ value, decimals = 0, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value || 0);
    let frameId;
    let start;
    const duration = 700;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(target * progress);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return `${displayValue.toFixed(decimals)}${suffix}`;
}

function Groupes() {
  const navigate = useNavigate();
  const { t, theme } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [groupes, setGroupes] = useState([]);
  const [nom, setNom] = useState("");
  const [filiere, setFiliere] = useState("");
  const [annee, setAnnee] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [groupDetailsLoading, setGroupDetailsLoading] = useState(false);
  const [groupesLoading, setGroupesLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterFiliereDropdownOpen, setIsFilterFiliereDropdownOpen] = useState(false);
  const [isFiliereDropdownOpen, setIsFiliereDropdownOpen] = useState(false);
  const [isAnneeDropdownOpen, setIsAnneeDropdownOpen] = useState(false);
  const [groupYears, setGroupYears] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(GROUP_YEAR_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const itemsPerPage = 5;
  const isDark = theme === "dark";
  const chartGridColor = isDark ? "#31415f" : "#e7edf7";
  const chartTickColor = isDark ? "#c3d2e7" : "#6d7890";
  const chartTooltipBorder = isDark ? "#375074" : "#e7edf7";
  const chartTooltipBackground = isDark ? "#1b2943" : "#ffffff";
  const chartTooltipShadow = isDark ? "0 18px 32px rgba(2, 8, 20, 0.42)" : "0 18px 32px rgba(15, 23, 42, 0.12)";
  const chartCursorFill = isDark ? "rgba(157, 195, 255, 0.12)" : "rgba(47, 91, 159, 0.08)";
  const chartBarColor = isDark ? "#6ea8ff" : "#2f5b9f";

  useEffect(() => {
    fetchGroupes();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, selectedFiliere, currentPage]);

  useEffect(() => {
    if (!showDetailsModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        handleCloseDetails();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showDetailsModal]);

  const fetchGroupes = async () => {
    try {
      setGroupesLoading(true);
      const res = await api.get("/groupes");
      setGroupes(res.data);
    } catch (err) {
      console.log(err);
      notifyError(t("groupes.error"), { toastId: "groupes-fetch-error" });
    } finally {
      setGroupesLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!nom || !filiere || !annee) {
      notifyError(t("groupes.fillFields"), { toastId: "groupes-validation" });
      return;
    }

    try {
      await api.post("/groupes", {
        nom_groupe: nom,
        filiere,
      });

      const normalizedCode = nom.trim().toUpperCase();
      const nextYears = {
        ...groupYears,
        [normalizedCode]: annee,
      };

      setGroupYears(nextYears);
      localStorage.setItem(GROUP_YEAR_STORAGE_KEY, JSON.stringify(nextYears));

      resetForm();
      fetchGroupes();
      notifySuccess(t("groupes.added"), { toastId: "groupes-add-success" });
    } catch (err) {
      console.log(err.response?.data);
      notifyError(t("groupes.error"), { toastId: "groupes-add-error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("common.delete"))) return;

    const groupToDelete = groupes.find((group) => group.id === id);

    try {
      await api.delete(`/groupes/${id}`);

      if (groupToDelete?.nom_groupe) {
        const nextYears = { ...groupYears };
        delete nextYears[groupToDelete.nom_groupe.trim().toUpperCase()];
        setGroupYears(nextYears);
        localStorage.setItem(GROUP_YEAR_STORAGE_KEY, JSON.stringify(nextYears));
      }

      fetchGroupes();
      notifySuccess(t("groupes.deleted"), { toastId: "groupes-delete-success" });
    } catch (err) {
      console.log(err.response?.data);
      notifyError(t("groupes.error"), { toastId: "groupes-delete-error" });
    }
  };

  const toggleSelectedId = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleToggleSelectAll = (checked, ids) => {
    if (checked) {
      setSelectedIds((current) => [...new Set([...current, ...ids])]);
      return;
    }

    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || bulkLoading) return;
    if (!window.confirm(t("groupes.deleteSelected"))) return;

    setBulkLoading(true);

    try {
      const selectedGroupes = groupes.filter((group) => selectedIds.includes(group.id));

      await api.post("/groupes/bulk-delete", {
        ids: selectedIds,
      });

      if (selectedGroupes.length > 0) {
        const nextYears = { ...groupYears };
        selectedGroupes.forEach((group) => {
          if (!group?.nom_groupe) return;
          delete nextYears[group.nom_groupe.trim().toUpperCase()];
        });
        setGroupYears(nextYears);
        localStorage.setItem(GROUP_YEAR_STORAGE_KEY, JSON.stringify(nextYears));
      }

      setSelectedIds([]);
      await fetchGroupes();
      notifySuccess(t("groupes.deleted"), { toastId: "groupes-bulk-delete-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("groupes.error"), { toastId: "groupes-bulk-delete-error" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleOpenDetails = async (group) => {
    setSelectedGroupe(group);
    setShowDetailsModal(true);
    setGroupDetails(null);
    setGroupDetailsLoading(true);

    try {
      const response = await api.get(`/groupes/${group.id}/details`);
      const data = response.data || {};
      let manualNotesByStagiaire = {};

      try {
        manualNotesByStagiaire = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "{}");
      } catch {
        manualNotesByStagiaire = {};
      }

      const groupeStagiaires = data?.groupe?.stagiaires || [];
      const manualEntries = groupeStagiaires.flatMap((stagiaire) => {
        const moduleMap = manualNotesByStagiaire[String(stagiaire.id)] || {};
        return Object.values(moduleMap)
          .map((entry) => {
            if (entry && typeof entry === "object") return Number(entry.note);
            return Number(entry);
          })
          .filter((value) => Number.isFinite(value));
      });

      const manualAverages = groupeStagiaires
        .map((stagiaire) => {
          const moduleMap = manualNotesByStagiaire[String(stagiaire.id)] || {};
          const values = Object.values(moduleMap)
            .map((entry) => {
              if (entry && typeof entry === "object") return Number(entry.note);
              return Number(entry);
            })
            .filter((value) => Number.isFinite(value));

          if (values.length === 0) return null;

          return {
            id: stagiaire.id,
            nom: stagiaire.nom,
            prenom: stagiaire.prenom,
            average: values.reduce((sum, value) => sum + value, 0) / values.length,
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.average - a.average);

      const fallbackAverage = manualEntries.length
        ? manualEntries.reduce((sum, value) => sum + value, 0) / manualEntries.length
        : 0;

      setGroupDetails({
        ...data,
        moyenne: Number(data?.moyenne || 0) > 0 ? data.moyenne : fallbackAverage,
        top_stagiaire: data?.top_stagiaire || (manualAverages[0]
          ? {
              id: manualAverages[0].id,
              nom: manualAverages[0].nom,
              prenom: manualAverages[0].prenom,
              average: Number(manualAverages[0].average || 0).toFixed(1),
            }
          : null),
      });
    } catch (err) {
      console.log(err);
      notifyError(t("groupes.error"), { toastId: "groupes-details-error" });
    } finally {
      setGroupDetailsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.log(err);
    }
    clearAuthSession();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const nextValue = !current;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  };

  const resetForm = () => {
    setNom("");
    setFiliere("");
    setAnnee("");
    setIsFiliereDropdownOpen(false);
    setIsAnneeDropdownOpen(false);
    setShowForm(false);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedGroupe(null);
    setGroupDetails(null);
    setGroupDetailsLoading(false);
  };

  const filiereOptions = useMemo(
    () => [...new Set(groupes.map((g) => g.filiere).filter(Boolean))],
    [groupes]
  );

  const filtered = groupes.filter((g) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || (g.nom_groupe || "").toLowerCase().includes(normalizedSearch);
    const matchesFiliere = !selectedFiliere || g.filiere === selectedFiliere;
    return matchesSearch && matchesFiliere;
  });

  const groupStats = useMemo(() => {
    if (!groupes.length) {
      return {
        total_groupes: 0,
        max_groupe: null,
        min_groupe: null,
      };
    }

    const sortedByCount = [...groupes].sort(
      (a, b) => Number(b.stagiaires_count || 0) - Number(a.stagiaires_count || 0)
    );

    return {
      total_groupes: groupes.length,
      max_groupe: sortedByCount[0] || null,
      min_groupe: sortedByCount[sortedByCount.length - 1] || null,
    };
  }, [groupes]);

  const groupesChartData = useMemo(
    () =>
      filtered.map((group) => ({
        name: group.nom_groupe,
        stagiaires: Number(group.stagiaires_count || 0),
      })),
    [filtered]
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const visibleIds = currentItems.map((group) => group.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const getDisplayedYear = (groupCode) => {
    const normalizedCode = (groupCode || "").trim().toUpperCase();
    return groupYears[normalizedCode] || getYearLabel(groupCode);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedFiliere("");
    setIsFilterFiliereDropdownOpen(false);
    setCurrentPage(1);
  };

  const detailsAverage = Number(groupDetails?.moyenne || 0);
  const averageTone = getAverageTone(detailsAverage, t);
  const absenceRate = Number(groupDetails?.absence_rate || 0);
  const absenceTone = getAbsenceTone(absenceRate, t);
  const detailsModules = groupDetails?.modules || [];
  const topStagiaire = groupDetails?.top_stagiaire;

  return (
    <div className={`groupes-page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="groupes-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Icon name="logo" />
          </div>
          {!isSidebarCollapsed && (
            <div>
              <h2>EduManager</h2>
              <p>Gestion Scolaire</p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="dashboard" />
            {!isSidebarCollapsed && <span>{t("common.nav.dashboard")}</span>}
          </NavLink>

          <NavLink to="/stagiaires" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="stagiaires" />
            {!isSidebarCollapsed && <span>{t("common.nav.stagiaires")}</span>}
          </NavLink>

          <NavLink to="/groupes" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="groupes" />
            {!isSidebarCollapsed && <span>{t("common.nav.groupes")}</span>}
            {!isSidebarCollapsed && <span className="sidebar-dot" />}
          </NavLink>

          <NavLink to="/modules" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="modules" />
            {!isSidebarCollapsed && <span>{t("common.nav.modules")}</span>}
          </NavLink>

          <NavLink to="/absences" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="absences" />
            {!isSidebarCollapsed && <span>{t("common.nav.absences")}</span>}
          </NavLink>

          <NavLink to="/notes" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="notes" />
            {!isSidebarCollapsed && <span>{t("common.nav.notes")}</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-collapse" onClick={toggleSidebar}>{isSidebarCollapsed ? ">" : "<"}</button>
        </div>
      </aside>

      <motion.main className="groupes-content" initial={pageMotion.initial} animate={pageMotion.animate} transition={pageMotion.transition}>
        <header className="page-header">
          <div>
            <h1>Groupes</h1>
            <p>Organisation des groupes de formation</p>
          </div>

          <div className="header-actions">
            <div className="user-card">
              <div className="user-avatar">
                <Icon name="user" />
              </div>
              <div>
                <strong>Admin</strong>
                <span>Administrateur</span>
              </div>
            </div>

            <button type="button" className="header-icon-btn logout-btn" onClick={handleLogout}>
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <motion.section className="groupes-body" layout>
          <div className="section-top">
            <div>
              <h2>Groupes</h2>
            </div>

            <motion.button className="primary-btn" onClick={() => setShowForm(true)} whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
              <Icon name="plus" />
              <span>Nouveau groupe</span>
            </motion.button>
          </div>

          <motion.div className="groupes-stats-grid groupes-stats-grid-three" variants={listMotion} initial="hidden" animate="visible" layout>
            {groupesLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <motion.article key={`stats-skeleton-${index}`} className="groupes-stat-card skeleton" variants={rowMotion}>
                    <div className="groupes-stat-skeleton groupes-stat-skeleton-icon" />
                    <div className="groupes-stat-skeleton groupes-stat-skeleton-title" />
                    <div className="groupes-stat-skeleton groupes-stat-skeleton-value" />
                    <div className="groupes-stat-skeleton groupes-stat-skeleton-copy" />
                  </motion.article>
                ))
              : (
                <>
                  <motion.article className="groupes-stat-card" variants={rowMotion} whileHover={{ y: -4, scale: 1.01 }}>
                    <div className="groupes-stat-icon blue">
                      <Icon name="groupes" />
                    </div>
                    <span>Total Groupes</span>
                    <strong><CountUpValue value={groupStats?.total_groupes || 0} /></strong>
                    <p>Nombre total de groupes actifs</p>
                  </motion.article>

                  <motion.article className="groupes-stat-card positive" variants={rowMotion} whileHover={{ y: -4, scale: 1.01 }}>
                    <div className="groupes-stat-icon green">
                      <Icon name="notes" />
                    </div>
                    <span>Groupe le plus rempli</span>
                    <strong>{groupStats?.max_groupe?.nom_groupe || "-"}</strong>
                    <p>{`${groupStats?.max_groupe?.stagiaires_count ?? 0} stagiaire(s)`}</p>
                  </motion.article>

                  <motion.article className="groupes-stat-card negative" variants={rowMotion} whileHover={{ y: -4, scale: 1.01 }}>
                    <div className="groupes-stat-icon red">
                      <Icon name="absences" />
                    </div>
                    <span>Groupe le plus faible</span>
                    <strong>{groupStats?.min_groupe?.nom_groupe || "-"}</strong>
                    <p>{`${groupStats?.min_groupe?.stagiaires_count ?? 0} stagiaire(s)`}</p>
                  </motion.article>
                </>
              )}
          </motion.div>

          <motion.div className="filters-row" layout>
            <div className="search-box">
              <Icon name="search" />
              <input
                type="text"
                placeholder="Rechercher un groupe..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                />
              </div>

            <div className="custom-select filter-select">
              <button
                type="button"
                className={`custom-select-trigger ${isFilterFiliereDropdownOpen ? "open" : ""}`}
                onClick={() => setIsFilterFiliereDropdownOpen((prev) => !prev)}
              >
                <span>{selectedFiliere || t("groupes.allFilieres")}</span>
                <Icon name="chevron" className="custom-select-chevron" />
              </button>

              {isFilterFiliereDropdownOpen && (
                <div className="custom-select-menu">
                  <button
                    type="button"
                    className={`custom-select-option ${selectedFiliere === "" ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedFiliere("");
                      setIsFilterFiliereDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                  >
                    {t("groupes.allFilieres")}
                  </button>
                  {filiereOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`custom-select-option ${selectedFiliere === item ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedFiliere(item);
                        setIsFilterFiliereDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <motion.button className="ghost-btn filter-reset-btn" onClick={resetFilters} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              {t("groupes.reset")}
            </motion.button>
          </motion.div>

          {selectedIds.length > 0 && (
            <motion.div className="bulk-action-bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} layout>
              <div className="bulk-selection-count">
                <span>{t("groupes.selectedCount", { count: selectedIds.length })}</span>
              </div>

              <div className="bulk-action-buttons">
                <motion.button
                  type="button"
                  className="bulk-btn bulk-btn-danger"
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{bulkLoading ? t("groupes.processing") : t("groupes.deleteSelected")}</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          <motion.div className="groupes-chart-card" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="groupes-chart-head">
              <div>
                <h3>{t("groupes.chartTitle")}</h3>
                <p>{t("groupes.chartSubtitle")}</p>
              </div>
            </div>

            <div className="groupes-chart-wrap">
              {groupesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={groupesChartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: chartTickColor, fontSize: 13 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: chartTickColor, fontSize: 13 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: chartCursorFill }}
                      labelStyle={{ color: isDark ? "#f4f7fd" : "#172033" }}
                      itemStyle={{ color: isDark ? "#edf4ff" : "#243044" }}
                      contentStyle={{
                        borderRadius: 14,
                        border: `1px solid ${chartTooltipBorder}`,
                        boxShadow: chartTooltipShadow,
                        background: chartTooltipBackground,
                      }}
                    />
                    <Bar dataKey="stagiaires" fill={chartBarColor} radius={[10, 10, 0, 0]} maxBarSize={54} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="groupes-chart-empty">
                  <p>{t("groupes.chartEmpty")}</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="table-card" layout>
            <motion.table className="groupes-table" layout>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={(event) => handleToggleSelectAll(event.target.checked, visibleIds)}
                    />
                  </th>
                  <th>{t("groupes.code")}</th>
                  <th>{t("groupes.filiere")}</th>
                  <th>{t("groupes.year")}</th>
                  <th>{t("groupes.count")}</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <motion.tbody variants={listMotion} initial="hidden" animate="visible" layout>
                {currentItems.map((g, index) => (
                  <motion.tr
                    key={g.id}
                    variants={rowMotion}
                    transition={{ duration: 0.28, delay: index * 0.02 }}
                    whileHover={{ scale: 1.02, y: -3 }}
                    layout
                    className="group-row"
                    onClick={() => handleOpenDetails(g)}
                  >
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(g.id)}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleSelectedId(g.id)}
                      />
                    </td>
                    <td className="code-cell">
                      <div className="group-name-wrap">
                        <span>{g.nom_groupe}</span>
                        <span className={`groupe-status-badge ${getGroupeStatus(g.stagiaires_count, t).className}`}>
                          {getGroupeStatus(g.stagiaires_count, t).label}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeClass(g.filiere)}`}>{g.filiere}</span>
                    </td>
                    <td className="muted-cell">{getDisplayedYear(g.nom_groupe)}</td>
                    <td>
                      {(() => {
                        const count = Number(g.stagiaires_count || 0);
                        const capacity = 30;
                        const percentage = Math.min((count / capacity) * 100, 100);
                        const tone = getCapacityTone(percentage);

                        return (
                          <div className="effectif-capacity">
                            <div className="effectif-capacity-head">
                              <Icon name="users" className="effectif-icon" />
                              <span>{`${count} / ${capacity} ${t("groupes.studentsWord")}`}</span>
                            </div>
                            <div className="effectif-progress-track">
                              <motion.div
                                className={`effectif-progress-fill ${tone}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <motion.button
                        className="icon-action"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(g.id);
                        }}
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon name="trash" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </motion.table>

            <div className="table-footer">
              <span>{t("groupes.pageOf", { page: currentPage, total: totalPages || 1 })}</span>
              <div className="pagination">
                <motion.button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} whileHover={{ scale: currentPage === 1 ? 1 : 1.06 }} whileTap={{ scale: currentPage === 1 ? 1 : 0.94 }}>
                  {"<"}
                </motion.button>
                <motion.button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  whileHover={{ scale: currentPage === totalPages || totalPages === 0 ? 1 : 1.06 }}
                  whileTap={{ scale: currentPage === totalPages || totalPages === 0 ? 1 : 0.94 }}
                >
                  {">"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <AnimatePresence>
          {showForm && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-card" initial={{ scale: 0.86, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.86, opacity: 0, y: 12 }} transition={{ duration: 0.26, ease: "easeOut" }}>
                <div className="modal-header">
                  <h3>{t("groupes.modalAdd")}</h3>
                  <button className="modal-close" onClick={resetForm}>x</button>
                </div>

                <div className="modal-grid">
                  <div className="modal-field modal-field-full">
                    <label>{t("groupes.codeLabel")}</label>
                    <input type="text" placeholder="ex: DEV203" value={nom} onChange={(e) => setNom(e.target.value)} />
                  </div>

                  <div className="modal-field modal-field-full">
                    <label>{t("groupes.filiere")}</label>
                    <div className="custom-select">
                      <button type="button" className={`custom-select-trigger ${isFiliereDropdownOpen ? "open" : ""}`} onClick={() => setIsFiliereDropdownOpen((prev) => !prev)}>
                        <span>{filiere || t("groupes.selectFiliere")}</span>
                        <Icon name="chevron" className="custom-select-chevron" />
                      </button>

                      {isFiliereDropdownOpen && (
                        <div className="custom-select-menu">
                          {["Developpement Digital", "Infrastructure", "Gestion", "Commerce"].map((item) => (
                            <button
                              key={item}
                              type="button"
                              className={`custom-select-option ${filiere === item ? "selected" : ""}`}
                              onClick={() => {
                                setFiliere(item);
                                setIsFiliereDropdownOpen(false);
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-field modal-field-full">
                    <label>{t("groupes.year")}</label>
                    <div className="custom-select">
                      <button type="button" className={`custom-select-trigger ${isAnneeDropdownOpen ? "open" : ""}`} onClick={() => setIsAnneeDropdownOpen((prev) => !prev)}>
                        <span>{annee || t("groupes.selectYear")}</span>
                        <Icon name="chevron" className="custom-select-chevron" />
                      </button>

                      {isAnneeDropdownOpen && (
                        <div className="custom-select-menu">
                          {[t("groupes.firstYear"), t("groupes.secondYear"), t("groupes.thirdYear")].map((item) => (
                            <button
                              key={item}
                              type="button"
                              className={`custom-select-option ${annee === item ? "selected" : ""}`}
                              onClick={() => {
                                setAnnee(item);
                                setIsAnneeDropdownOpen(false);
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <motion.button className="ghost-btn" onClick={resetForm} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t("common.cancel")}</motion.button>
                  <motion.button className="primary-btn" onClick={handleAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t("common.add")}</motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showDetailsModal && (
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseDetails}>
              <motion.div className="modal-card group-details-modal" initial={{ scale: 0.88, opacity: 0, y: 18 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0, y: 18 }} transition={{ duration: 0.26, ease: "easeOut" }} onClick={(event) => event.stopPropagation()}>
                <div className="modal-header group-details-header">
                  <div>
                    <h3>{t("groupes.detailsTitle")}</h3>
                    <p>{t("groupes.detailsSubtitle")}</p>
                  </div>
                  <button className="modal-close" onClick={handleCloseDetails}>x</button>
                </div>

                {groupDetailsLoading ? (
                  <div className="group-details-loading">
                    <motion.div className="group-details-spinner" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
                    <p>{t("groupes.loadingStats")}</p>
                  </div>
                ) : (
                  <div className="group-details-content">
                    <div className="group-details-grid">
                      <article className="group-details-card info-card">
                        <div className="group-details-card-head">
                          <div className="group-details-icon info"><Icon name="groupes" /></div>
                          <h4>{t("groupes.infoTitle")}</h4>
                        </div>
                        <div className="group-details-info-list">
                          <div>
                            <span>{t("groupes.groupName")}</span>
                            <strong>{selectedGroupe?.nom_groupe || "-"}</strong>
                          </div>
                          <div>
                            <span>{t("groupes.filiere")}</span>
                            <strong>{selectedGroupe?.filiere || "-"}</strong>
                          </div>
                          <div>
                            <span>{t("groupes.year")}</span>
                            <strong>{selectedGroupe ? getDisplayedYear(selectedGroupe.nom_groupe) : "-"}</strong>
                          </div>
                        </div>
                      </article>

                      <article className="group-details-card stat-card">
                        <div className="group-details-card-head">
                          <div className="group-details-icon users"><Icon name="users" /></div>
                          <h4>{t("groupes.trainees")}</h4>
                        </div>
                        <strong className="group-stat-value">{groupDetails?.stagiaires_count ?? 0}</strong>
                        <span className="group-stat-label">{t("groupes.totalGroup")}</span>
                      </article>

                      <article className="group-details-card stat-card modules-card">
                        <div className="group-details-card-head">
                          <div className="group-details-icon modules"><Icon name="modules" /></div>
                          <h4>{t("groupes.modulesTitle")}</h4>
                        </div>
                        {detailsModules.length > 0 ? (
                          <ul className="group-modules-list">
                            {detailsModules.map((moduleName) => (
                              <li key={moduleName}>{moduleName}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="group-empty-copy">{t("groupes.noModules")}</p>
                        )}
                      </article>

                      <article className="group-details-card stat-card">
                        <div className="group-details-card-head">
                          <div className="group-details-icon average"><Icon name="notes" /></div>
                          <h4>{t("groupes.averageTitle")}</h4>
                        </div>
                        <strong className="group-stat-value">{detailsAverage.toFixed(1)} / 20</strong>
                        <span className={`group-tone-badge ${averageTone.className}`}>{averageTone.label}</span>
                      </article>

                      <article className="group-details-card stat-card">
                        <div className="group-details-card-head">
                          <div className={`group-details-icon absence ${absenceTone.className}`}><Icon name="absences" /></div>
                          <h4>{t("groupes.absenceRate")}</h4>
                        </div>
                        <strong className="group-stat-value">{absenceRate.toFixed(1)}%</strong>
                        <span className={`group-tone-badge ${absenceTone.className}`}>{absenceTone.label}</span>
                      </article>

                      <article className="group-details-card top-card">
                        <div className="group-details-card-head">
                          <div className="group-details-icon top"><Icon name="notes" /></div>
                          <h4>{t("groupes.topTrainee")}</h4>
                        </div>
                        {topStagiaire ? (
                          <div className="group-top-stagiaire">
                            <strong>{`${topStagiaire.nom || ""} ${topStagiaire.prenom || ""}`.trim()}</strong>
                            <span>{Number(topStagiaire.average || 0).toFixed(1)} / 20</span>
                          </div>
                        ) : (
                          <p className="group-empty-copy">{t("groupes.noResult")}</p>
                        )}
                      </article>
                    </div>

                    <div className="modal-actions">
                      <motion.button className="ghost-btn" onClick={handleCloseDetails} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        {t("groupes.close")}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default Groupes;

