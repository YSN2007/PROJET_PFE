import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";
import "./Absences.css";
import { useSettings } from "../context/SettingsContext";
import { notifyError, notifySuccess } from "../utils/notifications";
import { clearAuthSession } from "../utils/auth";

const ABSENCE_DURATION_STORAGE_KEY = "absenceDurations";
const ABSENCE_MODULE_STORAGE_KEY = "absenceModules";
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

function CountUpValue({ value, suffix = "" }) {
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
      if (progress < 1) frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return `${Math.round(displayValue)}${suffix}`;
}

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
      <path
        d="m7 10 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    edit: (
      <path d="M5 19l3.5-.7L18 8.8a2.1 2.1 0 1 0-3-3L5.7 15.3 5 19Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
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
    clock: (
      <>
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8.5v4l2.8 1.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

function isJustified(value) {
  return value === true || value === 1 || value === "1";
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return String(dateValue).slice(0, 10);
}

function getFullName(stagiaire) {
  if (!stagiaire) return "Stagiaire inconnu";
  return `${stagiaire.nom || ""} ${stagiaire.prenom || ""}`.trim() || "Stagiaire inconnu";
}

function getStagiaireName(absence, stagiaires) {
  const linkedStagiaire =
    absence.stagiaire ||
    stagiaires.find((item) => String(item.id) === String(absence.stagiaire_id));

  return getFullName(linkedStagiaire);
}

function getGroupName(stagiaire, groupes) {
  if (!stagiaire) return "Sans groupe";
  if (stagiaire.groupe?.nom_groupe) return stagiaire.groupe.nom_groupe;

  const linkedGroup = groupes.find((item) => String(item.id) === String(stagiaire.groupe_id));
  return linkedGroup?.nom_groupe || "Sans groupe";
}

function getGroupId(stagiaire) {
  if (!stagiaire) return "";
  return stagiaire.groupe?.id || stagiaire.groupe_id || "";
}

function escapeCsvValue(value) {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function parseDurationToHours(value) {
  if (value == null) return 0;
  const normalized = String(value).trim().replace(",", ".");
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) || 0 : 0;
}

function truncateText(value, maxLength = 20) {
  const text = String(value ?? "").trim();
  if (!text) return "Aucune raison";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getMonthLabel(dateValue) {
  const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
  const rawDate = String(dateValue || "").slice(0, 10);
  if (!rawDate) return "Inconnu";
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Inconnu";
  return months[date.getMonth()] || "Inconnu";
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, search) {
  const source = String(text ?? "");
  const query = String(search ?? "").trim();

  if (!query) return source;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");

  return source.split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="highlight">
        {part}
      </mark>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    )
  );
}

function FilterSelect({ value, onChange, options, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectedLabel = options.find((option) => option.value === value)?.label || placeholder;

  return (
    <div ref={wrapperRef} className="custom-select filter-custom-select">
      <button
        type="button"
        className={`custom-select-trigger ${open ? "open" : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        disabled={disabled}
      >
        <span>{selectedLabel}</span>
        <Icon name="chevron" className="custom-select-chevron" />
      </button>

      {open && !disabled ? (
        <div className="custom-select-menu">
          {options.map((option) => (
            <button
              key={option.value || option.label}
              type="button"
              className={`custom-select-option ${option.value === value ? "selected" : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
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

function getReferenceModule(index) {
  const referenceModules = [
    "Programmation Java",
    "Base de Donnees",
    "Reseaux Informatiques",
    "Systemes d'Exploitation",
    "Comptabilite Generale",
    "Developpement Web",
    "Marketing Digital",
    "Securite Informatique",
  ];

  return referenceModules[index % referenceModules.length];
}

function getModuleNameByGroup(groupName = "", index = 0) {
  const normalized = String(groupName).trim().toUpperCase();

  const moduleMap = {
    DEV201: "Programmation Java",
    DEV202: "Developpement Web",
    INF101: "Reseaux Informatiques",
    INF102: "Securite Informatique",
    ID201: "Reseaux Informatiques",
    ID202: "Systemes d'Exploitation",
    GES301: "Comptabilite Generale",
    COM101: "Marketing Digital",
  };

  if (moduleMap[normalized]) {
    return moduleMap[normalized];
  }

  if (normalized.startsWith("DEV")) {
    const modules = ["Programmation Java", "Base de Donnees", "Developpement Web"];
    return modules[index % modules.length];
  }

  if (normalized.startsWith("INF") || normalized.startsWith("ID")) {
    const modules = ["Reseaux Informatiques", "Systemes d'Exploitation", "Securite Informatique"];
    return modules[index % modules.length];
  }

  if (normalized.startsWith("GES")) {
    return "Comptabilite Generale";
  }

  if (normalized.startsWith("COM")) {
    return "Marketing Digital";
  }

  return getReferenceModule(index);
}

function getModulesForGroup(stagiaire, groupes, modules) {
  const groupId = String(getGroupId(stagiaire));
  const groupName = getGroupName(stagiaire, groupes);

  const matchedModules = modules.filter((moduleItem) => {
    const moduleGroupId = String(moduleItem.groupe?.id || moduleItem.groupe_id || "");
    const moduleGroupName = String(moduleItem.groupe?.nom_groupe || "");

    return (
      (groupId && moduleGroupId === groupId) ||
      (groupName !== "Sans groupe" && moduleGroupName.toUpperCase() === groupName.toUpperCase())
    );
  });

  return [...new Set(matchedModules.map((moduleItem) => moduleItem.nom_module).filter(Boolean))];
}

function Absences() {
  const navigate = useNavigate();
  const { t, theme } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [absences, setAbsences] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [modules, setModules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    groupe: "",
    module: "",
    dateStart: "",
    dateEnd: "",
    justifie: "",
  });
  const [stagiaireId, setStagiaireId] = useState("");
  const [dateAbsence, setDateAbsence] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [dureeAbsence, setDureeAbsence] = useState("");
  const [raisonAbsence, setRaisonAbsence] = useState("");
  const [justifie, setJustifie] = useState(false);
  const [editId, setEditId] = useState(null);
  const [togglingJustifieIds, setTogglingJustifieIds] = useState({});
  const [justifieFlashIds, setJustifieFlashIds] = useState({});
  const [selectedAbsences, setSelectedAbsences] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState("");
  const [isStagiaireDropdownOpen, setIsStagiaireDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [absenceDurations, setAbsenceDurations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ABSENCE_DURATION_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [absenceModules, setAbsenceModules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ABSENCE_MODULE_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const isDark = theme === "dark";
  const chartGridColor = isDark ? "#31415f" : "#e8edf4";
  const chartAxisColor = isDark ? "#c3d2e7" : "#7f8897";
  const chartTooltipBorder = isDark ? "#375074" : "#e8edf4";
  const chartTooltipBackground = isDark ? "#1b2943" : "#ffffff";
  const chartTooltipShadow = isDark ? "0 18px 32px rgba(2, 8, 20, 0.42)" : "0 18px 32px rgba(15, 23, 42, 0.12)";
  const chartTooltipLabel = isDark ? "#f4f7fd" : "#172033";
  const chartTooltipItem = isDark ? "#edf4ff" : "#243044";
  const barColor = isDark ? "#7fb0ff" : "#284c83";
  const barCursorColor = isDark ? "rgba(157, 195, 255, 0.12)" : "rgba(40, 76, 131, 0.06)";
  const pieLegendColor = isDark ? "#dce8f8" : "#526070";

  useEffect(() => {
    fetchAbsences();
    fetchStagiaires();
    fetchGroupes();
    fetchModules();
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/absences");
      setAbsences(res.data);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-load-error" });
    }
  };

  const fetchStagiaires = async () => {
    try {
      const res = await api.get("/stagiaires");
      setStagiaires(res.data);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-stagiaires-error" });
    }
  };

  const fetchGroupes = async () => {
    try {
      const res = await api.get("/groupes");
      setGroupes(res.data);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-groupes-error" });
    }
  };

  const fetchModules = async () => {
    try {
      const res = await api.get("/modules");
      setModules(res.data);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-modules-error" });
    }
  };

  const resetForm = () => {
    setStagiaireId("");
    setDateAbsence("");
    setSelectedModule("");
    setDureeAbsence("");
    setRaisonAbsence("");
    setJustifie(false);
    setEditId(null);
    setIsStagiaireDropdownOpen(false);
    setIsModuleDropdownOpen(false);
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!stagiaireId || !selectedModule || !dateAbsence || !dureeAbsence) {
      notifyError("Erreur ❌", { toastId: "absences-validation" });
      return;
    }

    try {
      const response = await api.post("/absences", {
        stagiaire_id: parseInt(stagiaireId, 10),
        date_absence: dateAbsence,
        justifie,
        raison: raisonAbsence.trim() || null,
      });

      const createdAbsence = response.data;
      const createdId = createdAbsence?.id;
      if (createdId) {
        const nextDurations = {
          ...absenceDurations,
          [createdId]: dureeAbsence,
        };
        setAbsenceDurations(nextDurations);
        localStorage.setItem(ABSENCE_DURATION_STORAGE_KEY, JSON.stringify(nextDurations));

        const nextModules = {
          ...absenceModules,
          [createdId]: selectedModule,
        };
        setAbsenceModules(nextModules);
        localStorage.setItem(ABSENCE_MODULE_STORAGE_KEY, JSON.stringify(nextModules));
      }

      await fetchAbsences();
      resetForm();
      notifySuccess("Opération réussie ✅", { toastId: "absences-add-success" });
    } catch (err) {
      console.log(err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : "");
      notifyError(errorMessage || "Erreur ❌", { toastId: "absences-add-error" });
    }
  };

  const handleEdit = (absence) => {
    const linkedStagiaire =
      absence.stagiaire ||
      stagiaires.find((item) => String(item.id) === String(absence.stagiaire_id));
    const linkedGroupName = getGroupName(linkedStagiaire, groupes);
    const fallbackModules = getModulesForGroup(linkedStagiaire, groupes, modules);

    setEditId(absence.id);
    setStagiaireId(String(absence.stagiaire?.id || absence.stagiaire_id || ""));
    setDateAbsence(formatDate(absence.date_absence));
    setSelectedModule(
      absenceModules[absence.id] ||
        fallbackModules[0] ||
        getModuleNameByGroup(linkedGroupName, linkedStagiaire?.id || absence.id)
    );
    setDureeAbsence(String(absenceDurations[absence.id] || absence.duree_absence || absence.duree || ""));
    setRaisonAbsence(absence.raison || "");
    setJustifie(isJustified(absence.justifie));
    setIsStagiaireDropdownOpen(false);
    setIsModuleDropdownOpen(false);
    setShowForm(true);
  };

  const handleUpdate = async () => {
    if (!stagiaireId || !selectedModule || !dateAbsence || !dureeAbsence) {
      notifyError("Erreur ❌", { toastId: "absences-update-validation" });
      return;
    }

    try {
      await api.put(`/absences/${editId}`, {
        stagiaire_id: parseInt(stagiaireId, 10),
        date_absence: dateAbsence,
        justifie,
        raison: raisonAbsence.trim() || null,
      });

      const nextDurations = {
        ...absenceDurations,
        [editId]: dureeAbsence,
      };
      setAbsenceDurations(nextDurations);
      localStorage.setItem(ABSENCE_DURATION_STORAGE_KEY, JSON.stringify(nextDurations));

      const nextModules = {
        ...absenceModules,
        [editId]: selectedModule,
      };
      setAbsenceModules(nextModules);
      localStorage.setItem(ABSENCE_MODULE_STORAGE_KEY, JSON.stringify(nextModules));

      await fetchAbsences();
      resetForm();
      notifySuccess("Opération réussie ✅", { toastId: "absences-update-success" });
    } catch (err) {
      console.log(err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : "");
      notifyError(errorMessage || "Erreur ❌", { toastId: "absences-update-error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette absence ?")) return;

    try {
      await api.delete(`/absences/${id}`);

      const nextDurations = { ...absenceDurations };
      delete nextDurations[id];
      setAbsenceDurations(nextDurations);
      localStorage.setItem(ABSENCE_DURATION_STORAGE_KEY, JSON.stringify(nextDurations));

      const nextModules = { ...absenceModules };
      delete nextModules[id];
      setAbsenceModules(nextModules);
      localStorage.setItem(ABSENCE_MODULE_STORAGE_KEY, JSON.stringify(nextModules));

      await fetchAbsences();
      notifySuccess("Opération réussie ✅", { toastId: "absences-delete-success" });
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-delete-error" });
    }
  };

  const handleToggleJustifie = async (absence) => {
    if (togglingJustifieIds[absence.id]) return;

    const nextJustifie = !isJustified(absence.justifie);
    setTogglingJustifieIds((current) => ({ ...current, [absence.id]: true }));

    setAbsences((current) =>
      current.map((item) =>
        item.id === absence.id ? { ...item, justifie: nextJustifie } : item
      )
    );

    try {
      await api.put(`/absences/${absence.id}`, {
        stagiaire_id: absence.stagiaire?.id || absence.stagiaire_id,
        date_absence: formatDate(absence.date_absence),
        justifie: nextJustifie,
      });
      setJustifieFlashIds((current) => ({ ...current, [absence.id]: true }));
      window.setTimeout(() => {
        setJustifieFlashIds((current) => {
          const nextState = { ...current };
          delete nextState[absence.id];
          return nextState;
        });
      }, 320);
    } catch (err) {
      console.log(err);
      setAbsences((current) =>
        current.map((item) =>
          item.id === absence.id ? { ...item, justifie: absence.justifie } : item
        )
      );
      notifyError("Erreur ❌", { toastId: "absences-toggle-error" });
    } finally {
      setTogglingJustifieIds((current) => {
        const nextState = { ...current };
        delete nextState[absence.id];
        return nextState;
      });
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

  const handleExportCsv = () => {
    exportRowsToCsv(displayedAbsences, stagiaires);
  };

  const handleExportSelectedCsv = () => {
    const selectedRows = displayedAbsences.filter(({ absence }) => selectedAbsences.includes(absence.id));
    exportRowsToCsv(selectedRows, stagiaires, "absences-selection.csv");
  };

  const exportRowsToCsv = (rowsToExport, stagiairesList, filename = "absences.csv") => {
    const headers = ["ID", "Stagiaire", "Groupe", "Module", "Duree", "Date", "Justifie", "Raison"];
    const rows = rowsToExport.map(({ absence, groupName, moduleName, duration }) => {
      return [
        absence.id,
        getStagiaireName(absence, stagiairesList),
        groupName,
        moduleName,
        `${duration}h`,
        formatDate(absence.date_absence),
        isJustified(absence.justifie) ? "Oui" : "Non",
        absence.raison || "Aucune raison",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const absenceRows = useMemo(() => {
    const groupOccurrences = {};

    return absences.map((absence, index) => {
      const linkedStagiaire =
        absence.stagiaire ||
        stagiaires.find((item) => String(item.id) === String(absence.stagiaire_id));
      const groupName = getGroupName(linkedStagiaire, groupes);
      const groupModules = getModulesForGroup(linkedStagiaire, groupes, modules);
      const occurrenceIndex = groupOccurrences[groupName] || 0;
      groupOccurrences[groupName] = occurrenceIndex + 1;

      const moduleName =
        absenceModules[absence.id] ||
        (groupModules.length > 0
          ? groupModules[occurrenceIndex % groupModules.length]
          : getModuleNameByGroup(groupName, linkedStagiaire?.id || index));
      const duration = absenceDurations[absence.id] || absence.duree_absence || absence.duree || "1";

      return {
        absence,
        linkedStagiaire,
        stagiaireName: getStagiaireName(absence, stagiaires),
        groupName,
        moduleName,
        duration,
        formattedDate: formatDate(absence.date_absence),
        justified: isJustified(absence.justifie),
        reason: absence.raison || "",
      };
    });
  }, [absences, absenceDurations, absenceModules, groupes, modules, stagiaires]);

  const groupFilterOptions = useMemo(
    () => [...new Set(absenceRows.map((item) => item.groupName).filter((value) => value && value !== "Sans groupe"))].sort((a, b) => a.localeCompare(b)),
    [absenceRows]
  );

  const moduleFilterOptions = useMemo(
    () => [...new Set(absenceRows.map((item) => item.moduleName).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [absenceRows]
  );

  const groupeFilterItems = useMemo(
    () => [{ value: "", label: "Tous les groupes" }, ...groupFilterOptions.map((groupName) => ({ value: groupName, label: groupName }))],
    [groupFilterOptions]
  );

  const moduleFilterItems = useMemo(
    () => [{ value: "", label: "Tous les modules" }, ...moduleFilterOptions.map((moduleName) => ({ value: moduleName, label: moduleName }))],
    [moduleFilterOptions]
  );

  const justifieFilterItems = useMemo(
    () => [
      { value: "", label: "Tous" },
      { value: "justifie", label: "Justifie" },
      { value: "non_justifie", label: "Non justifie" },
    ],
    []
  );

  const filteredAbsences = absenceRows.filter((item) => {
    const query = filters.search.trim().toLowerCase();
    const matchesSearch = !query || item.stagiaireName.toLowerCase().includes(query);
    const matchesGroup = !filters.groupe || item.groupName === filters.groupe;
    const matchesModule = !filters.module || item.moduleName === filters.module;
    const matchesJustifie =
      !filters.justifie ||
      (filters.justifie === "justifie" ? item.justified : !item.justified);
    const matchesStart = !filters.dateStart || item.formattedDate >= filters.dateStart;
    const matchesEnd = !filters.dateEnd || item.formattedDate <= filters.dateEnd;

    return matchesSearch && matchesGroup && matchesModule && matchesJustifie && matchesStart && matchesEnd;
  });

  const displayedAbsences = filteredAbsences;
  const visibleAbsenceIds = displayedAbsences.map(({ absence }) => absence.id);
  const allVisibleSelected = visibleAbsenceIds.length > 0 && visibleAbsenceIds.every((id) => selectedAbsences.includes(id));

  const justifiedCount = displayedAbsences.filter(({ absence }) => isJustified(absence.justifie)).length;
  const unjustifiedCount = displayedAbsences.length - justifiedCount;
  const totalHoursLost = displayedAbsences.reduce((sum, { duration }) => sum + parseDurationToHours(duration), 0);
  const monthlyAbsenceData = useMemo(() => {
    const monthOrder = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
    const counts = displayedAbsences.reduce((accumulator, item) => {
      const month = getMonthLabel(item.absence.date_absence);
      accumulator[month] = (accumulator[month] || 0) + 1;
      return accumulator;
    }, {});

    return monthOrder
      .filter((month) => counts[month])
      .map((month) => ({ month, total: counts[month] }));
  }, [displayedAbsences]);

  const justifieChartData = useMemo(
    () => [
      { name: "Justifie", value: justifiedCount, color: "#2e9b61" },
      { name: "Non justifie", value: unjustifiedCount, color: "#dc2626" },
    ].filter((item) => item.value > 0),
    [justifiedCount, unjustifiedCount]
  );
  const selectedStagiaire = stagiaires.find((item) => String(item.id) === String(stagiaireId));
  const selectedGroupName = getGroupName(selectedStagiaire, groupes);
  const selectedModules = selectedStagiaire ? getModulesForGroup(selectedStagiaire, groupes, modules) : [];
  const selectedModuleName = selectedModule || "";
  const hasAbsences = absences.length > 0;

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      groupe: "",
      module: "",
      dateStart: "",
      dateEnd: "",
      justifie: "",
    });
  };

  const toggleSelectAbsence = (id) => {
    setSelectedAbsences((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleSelectAllVisible = () => {
    setSelectedAbsences((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleAbsenceIds.includes(id));
      }

      return [...new Set([...current, ...visibleAbsenceIds])];
    });
  };

  const clearSelection = () => {
    setSelectedAbsences([]);
  };

  const handleBulkDelete = async () => {
    if (selectedAbsences.length === 0) return;
    if (!window.confirm("Supprimer les absences selectionnees ?")) return;

    setBulkActionLoading("delete");
    try {
      await Promise.all(selectedAbsences.map((id) => api.delete(`/absences/${id}`)));

      const nextDurations = { ...absenceDurations };
      const nextModules = { ...absenceModules };
      selectedAbsences.forEach((id) => {
        delete nextDurations[id];
        delete nextModules[id];
      });

      setAbsenceDurations(nextDurations);
      localStorage.setItem(ABSENCE_DURATION_STORAGE_KEY, JSON.stringify(nextDurations));
      setAbsenceModules(nextModules);
      localStorage.setItem(ABSENCE_MODULE_STORAGE_KEY, JSON.stringify(nextModules));

      await fetchAbsences();
      clearSelection();
      notifySuccess("Operation reussie ✅", { toastId: "absences-bulk-delete-success" });
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "absences-bulk-delete-error" });
    } finally {
      setBulkActionLoading("");
    }
  };

  const handleBulkMarkJustified = async () => {
    if (selectedAbsences.length === 0) return;

    const selectedItems = absences.filter((absence) => selectedAbsences.includes(absence.id));
    setBulkActionLoading("justify");

    const previousAbsences = absences;
    setAbsences((current) =>
      current.map((item) =>
        selectedAbsences.includes(item.id) ? { ...item, justifie: true } : item
      )
    );

    try {
      await Promise.all(
        selectedItems.map((absence) =>
          api.put(`/absences/${absence.id}`, {
            stagiaire_id: absence.stagiaire?.id || absence.stagiaire_id,
            date_absence: formatDate(absence.date_absence),
            justifie: true,
          })
        )
      );
      clearSelection();
      notifySuccess("Operation reussie ✅", { toastId: "absences-bulk-justify-success" });
    } catch (err) {
      console.log(err);
      setAbsences(previousAbsences);
      notifyError("Erreur ❌", { toastId: "absences-bulk-justify-error" });
    } finally {
      setBulkActionLoading("");
    }
  };

  useEffect(() => {
    setSelectedAbsences((current) => current.filter((id) => absences.some((absence) => absence.id === id)));
  }, [absences]);

  return (
    <div className={`absences-page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="absences-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Icon name="logo" />
          </div>
          {!isSidebarCollapsed && <div>
            <h2>EduManager</h2>
            <p>Gestion Scolaire</p>
          </div>}
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
          </NavLink>

          <NavLink to="/modules" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="modules" />
            {!isSidebarCollapsed && <span>{t("common.nav.modules")}</span>}
          </NavLink>

          <NavLink to="/absences" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="absences" />
            {!isSidebarCollapsed && <span>{t("common.nav.absences")}</span>}
            {!isSidebarCollapsed && <span className="sidebar-dot" />}
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

      <motion.main
        className="absences-content"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        transition={pageMotion.transition}
      >
        <header className="page-header">
          <div>
            <h1>{t("absences.pageTitle")}</h1>
            <p>{t("absences.pageSubtitle")}</p>
          </div>

          <div className="header-actions">
            <div className="user-card">
              <div className="user-avatar">
                <Icon name="user" />
              </div>
              <div>
                <strong>{t("common.admin")}</strong>
                <span>{t("common.administrator")}</span>
              </div>
            </div>

            <button type="button" className="header-icon-btn logout-btn" onClick={handleLogout}>
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <motion.section className="absences-body" layout>
          <div className="section-top">
            <div>
              <h2>{t("absences.pageTitle")}</h2>
              <p>{t("absences.found", { count: displayedAbsences.length })}</p>
            </div>

            <div className="section-top-actions">
              <motion.button className="ghost-btn" onClick={handleExportCsv} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                <span>{t("absences.exportCsv")}</span>
              </motion.button>

              <motion.button
                className="primary-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon name="plus" />
                <span>{t("absences.addButton")}</span>
              </motion.button>
            </div>
          </div>

          <motion.div className="filters-row filters-pro" layout>
            <div className="search-box">
              <Icon name="search" />
              <input
                type="text"
                placeholder={t("absences.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                disabled={!hasAbsences}
              />
            </div>

            <div className="filter-select-box">
              <FilterSelect
                value={filters.groupe}
                onChange={(nextValue) => handleFilterChange("groupe", nextValue)}
                options={groupeFilterItems}
                placeholder={t("absences.allGroups")}
                disabled={!hasAbsences}
              />
            </div>

            <div className="filter-select-box">
              <FilterSelect
                value={filters.module}
                onChange={(nextValue) => handleFilterChange("module", nextValue)}
                options={moduleFilterItems}
                placeholder={t("absences.allModules")}
                disabled={!hasAbsences}
              />
            </div>

            <div className="date-filter-box">
              <input
                type="date"
                value={filters.dateStart}
                onChange={(e) => handleFilterChange("dateStart", e.target.value)}
                disabled={!hasAbsences}
                min="2026-01-01"
                max="2026-12-31"
              />
            </div>

            <div className="date-filter-box">
              <input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => handleFilterChange("dateEnd", e.target.value)}
                disabled={!hasAbsences}
                min="2026-01-01"
                max="2026-12-31"
              />
            </div>

            <div className="filter-select-box">
              <FilterSelect
                value={filters.justifie}
                onChange={(nextValue) => handleFilterChange("justifie", nextValue)}
                options={justifieFilterItems}
                placeholder="Tous"
                disabled={!hasAbsences}
              />
            </div>

            <motion.button
              type="button"
              className="ghost-btn filter-reset-btn"
              onClick={handleResetFilters}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              disabled={!hasAbsences}
            >
              {t("absences.resetFilters")}
            </motion.button>
          </motion.div>

          <motion.div className="filters-results-bar" layout>
            <span>{t("absences.found", { count: displayedAbsences.length })}</span>
          </motion.div>

          <AnimatePresence>
            {selectedAbsences.length > 0 ? (
              <motion.div
                className="bulk-actions-bar"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <span className="bulk-actions-count">{t("absences.selectedElements", { count: selectedAbsences.length })}</span>
                <div className="bulk-actions-buttons">
                  <motion.button
                    type="button"
                    className="bulk-action-btn bulk-action-justify"
                    onClick={handleBulkMarkJustified}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={bulkActionLoading !== ""}
                  >
                    {t("absences.markJustified")}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="bulk-action-btn bulk-action-export"
                    onClick={handleExportSelectedCsv}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={bulkActionLoading !== ""}
                  >
                    {t("absences.exportCsv")}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="bulk-action-btn bulk-action-delete"
                    onClick={handleBulkDelete}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={bulkActionLoading !== ""}
                  >
                    {t("absences.deleteSelected")}
                  </motion.button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.div className="absence-stats-grid" variants={listMotion} initial="hidden" animate="visible" layout>
            <motion.article className="absence-stat-card total" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-stat-icon">
                <Icon name="absences" />
              </div>
              <div className="absence-stat-content">
                <span>{t("absences.total")}</span>
                <strong><CountUpValue value={displayedAbsences.length} /></strong>
              </div>
            </motion.article>

            <motion.article className="absence-stat-card justified" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-stat-icon">
                <Icon name="absences" />
              </div>
              <div className="absence-stat-content">
                <span>{t("absences.justifiedCount")}</span>
                <strong><CountUpValue value={justifiedCount} /></strong>
              </div>
            </motion.article>

            <motion.article className="absence-stat-card unjustified" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-stat-icon">
                <Icon name="absences" />
              </div>
              <div className="absence-stat-content">
                <span>{t("absences.unjustifiedCount")}</span>
                <strong><CountUpValue value={unjustifiedCount} /></strong>
              </div>
            </motion.article>

            <motion.article className="absence-stat-card lost-hours" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-stat-icon">
                <Icon name="clock" />
              </div>
              <div className="absence-stat-content">
                <span>{t("absences.lostHours")}</span>
                <strong><CountUpValue value={totalHoursLost} suffix="h" /></strong>
              </div>
            </motion.article>
          </motion.div>

          <motion.div className="absence-charts-grid" variants={listMotion} initial="hidden" animate="visible" layout>
            <motion.article className="absence-chart-card" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-chart-head">
                <h3>{t("absences.monthlyChartTitle")}</h3>
                <p>{t("absences.monthlyChartSubtitle")}</p>
              </div>

              <div className="absence-chart-body">
                {monthlyAbsenceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyAbsenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} vertical={false} />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} stroke={chartAxisColor} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} stroke={chartAxisColor} />
                      <Tooltip
                        cursor={{ fill: barCursorColor }}
                        labelStyle={{ color: chartTooltipLabel }}
                        itemStyle={{ color: chartTooltipItem }}
                        contentStyle={{
                          borderRadius: 14,
                          border: `1px solid ${chartTooltipBorder}`,
                          boxShadow: chartTooltipShadow,
                          background: chartTooltipBackground,
                        }}
                      />
                      <Bar dataKey="total" radius={[10, 10, 0, 0]} fill={barColor} animationDuration={700} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty-state">{t("absences.noData")}</div>
                )}
              </div>
            </motion.article>

            <motion.article className="absence-chart-card" variants={rowMotion} whileHover={{ y: -3, scale: 1.01 }}>
              <div className="absence-chart-head">
                <h3>{t("absences.ratioChartTitle")}</h3>
                <p>{t("absences.ratioChartSubtitle")}</p>
              </div>

              <div className="absence-chart-body">
                {justifieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={justifieChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={58}
                        outerRadius={92}
                        paddingAngle={4}
                        animationDuration={700}
                      >
                        {justifieChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        labelStyle={{ color: chartTooltipLabel }}
                        itemStyle={{ color: chartTooltipItem }}
                        contentStyle={{
                          borderRadius: 14,
                          border: `1px solid ${chartTooltipBorder}`,
                          boxShadow: chartTooltipShadow,
                          background: chartTooltipBackground,
                        }}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: pieLegendColor }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="chart-empty-state">{t("absences.noData")}</div>
                )}
              </div>
            </motion.article>
          </motion.div>

          <motion.div className="table-card" layout>
            <motion.table className="absences-table" layout>
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={handleSelectAllVisible}
                      aria-label="Select all absences"
                    />
                  </th>
                  <th>ID</th>
                  <th>{t("absences.trainee")}</th>
                  <th>{t("absences.group")}</th>
                  <th>{t("absences.module")}</th>
                  <th>{t("absences.duration")}</th>
                  <th>{t("absences.reason")}</th>
                  <th>{t("absences.date")}</th>
                      <th>{t("absences.justified")}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={listMotion} initial="hidden" animate="visible" layout>
                {displayedAbsences.map(({ absence, groupName, moduleName, duration, stagiaireName, justified, reason }, index) => {
                  const isTogglingJustifie = Boolean(togglingJustifieIds[absence.id]);
                  const isJustifieFlashing = Boolean(justifieFlashIds[absence.id]);

                  return (
                    <motion.tr
                      key={absence.id}
                      className={`absence-row ${selectedAbsences.includes(absence.id) ? "selected" : ""}`}
                      variants={rowMotion}
                      transition={{ duration: 0.28, delay: index * 0.02 }}
                      whileHover={{ scale: 1.02, y: -3 }}
                      layout
                    >
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedAbsences.includes(absence.id)}
                          onChange={() => toggleSelectAbsence(absence.id)}
                          aria-label={`Select absence ${absence.id}`}
                        />
                      </td>
                      <td>{absence.id}</td>
                      <td className="absences-name-cell">{highlightText(stagiaireName, filters.search)}</td>
                      <td>
                        <span className="group-pill">{groupName}</span>
                      </td>
                      <td className="absences-module-cell">{moduleName}</td>
                      <td className="absences-duration-cell">{duration}h</td>
                      <td className="absences-reason-cell" title={reason || t("absences.noReason")}>
                        <span className="reason-inline-icon">📝</span>
                        <span>{truncateText(reason, 20)}</span>
                      </td>
                      <td>{formatDate(absence.date_absence)}</td>
                      <td>
                        <motion.button
                          type="button"
                          className={`justifie-badge ${justified ? "yes" : "no"} ${isTogglingJustifie ? "loading" : ""} ${isJustifieFlashing ? "flash" : ""}`}
                          onClick={() => handleToggleJustifie(absence)}
                          whileHover={isTogglingJustifie ? undefined : { scale: 1.05, y: -1 }}
                          whileTap={isTogglingJustifie ? undefined : { scale: [0.95, 1.05, 1] }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          disabled={isTogglingJustifie}
                          title={t("absences.clickToggle")}
                          aria-label={t("absences.clickToggle")}
                        >
                          {isTogglingJustifie ? <span className="justifie-spinner" aria-hidden="true" /> : null}
                          <span>{justified ? `🟢 ${t("absences.yes")}` : `🔴 ${t("absences.unjustifiedOnly")}`}</span>
                        </motion.button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <motion.button className="icon-action" onClick={() => handleEdit(absence)} whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95 }}>
                            <Icon name="edit" />
                          </motion.button>
                          <motion.button className="icon-action" onClick={() => handleDelete(absence.id)} whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95 }}>
                            <Icon name="trash" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </motion.table>

            {displayedAbsences.length === 0 && (
              <div className="empty-state">
                <p>{t("absences.noneFound")}</p>
              </div>
            )}
          </motion.div>
        </motion.section>

        <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card" initial={{ scale: 0.86, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.86, opacity: 0, y: 12 }} transition={{ duration: 0.26, ease: "easeOut" }}>
              <div className="modal-header">
                <h3>{editId ? t("absences.modalEdit") : t("absences.modalAdd")}</h3>
                <motion.button className="modal-close" onClick={resetForm} whileHover={{ scale: 1.08, rotate: 90 }} whileTap={{ scale: 0.94 }}>x</motion.button>
              </div>

              <div className="modal-grid">
                <div className="modal-field modal-field-full">
                  <label>{t("absences.trainee")}</label>
                  <div className="custom-select">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isStagiaireDropdownOpen ? "open" : ""}`}
                      onClick={() => setIsStagiaireDropdownOpen((prev) => !prev)}
                    >
                      <span>
                        {stagiaires.find((item) => String(item.id) === String(stagiaireId))
                          ? getFullName(stagiaires.find((item) => String(item.id) === String(stagiaireId)))
                          : t("absences.selectTrainee")}
                      </span>
                      <Icon name="chevron" className="custom-select-chevron" />
                    </button>

                    {isStagiaireDropdownOpen && (
                      <div className="custom-select-menu">
                        {stagiaires.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className={`custom-select-option ${String(item.id) === String(stagiaireId) ? "selected" : ""}`}
                            onClick={() => {
                              setStagiaireId(String(item.id));
                              setSelectedModule("");
                              setIsStagiaireDropdownOpen(false);
                            }}
                          >
                            {`${item.nom || ""} ${item.prenom || ""}`.trim()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-field">
                  <label>{t("absences.group")}</label>
                  <input type="text" value={selectedGroupName === "Sans groupe" ? "" : selectedGroupName} readOnly />
                </div>

                <div className="modal-field">
                  <label>{t("absences.module")}</label>
                  <div className="custom-select">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isModuleDropdownOpen ? "open" : ""}`}
                      onClick={() => {
                        if (!selectedStagiaire || selectedModules.length === 0) return;
                        setIsModuleDropdownOpen((prev) => !prev);
                      }}
                    >
                      <span>
                        {selectedModuleName || t("absences.selectModule")}
                      </span>
                      <Icon name="chevron" className="custom-select-chevron" />
                    </button>

                    {isModuleDropdownOpen && selectedModules.length > 0 && (
                      <div className="custom-select-menu">
                        {selectedModules.map((moduleName) => (
                          <button
                            key={moduleName}
                            type="button"
                            className={`custom-select-option ${selectedModule === moduleName ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedModule(moduleName);
                              setIsModuleDropdownOpen(false);
                            }}
                          >
                            {moduleName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-field">
                  <label>{t("absences.duration")}</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 2"
                    value={dureeAbsence}
                    onChange={(e) => setDureeAbsence(e.target.value)}
                  />
                </div>

                <div className="modal-field modal-field-full">
                  <label>{t("absences.reason")}</label>
                  <textarea
                    placeholder={t("absences.reasonPlaceholder")}
                    value={raisonAbsence}
                    onChange={(e) => setRaisonAbsence(e.target.value)}
                    maxLength={255}
                  />
                </div>

                <div className="modal-field">
                  <label>{t("absences.date")}</label>
                  <input
                    type="date"
                    value={dateAbsence}
                    onChange={(e) => setDateAbsence(e.target.value)}
                    min="2026-01-01"
                    max="2026-12-31"
                  />
                </div>

                <div className="modal-field">
                  <label>{t("absences.justified")}</label>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      checked={justifie}
                      onChange={(e) => setJustifie(e.target.checked)}
                    />
                    <span>{t("absences.justifiedAbsence")}</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <motion.button className="ghost-btn" onClick={resetForm} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>{t("common.cancel")}</motion.button>
                <motion.button className="primary-btn" onClick={editId ? handleUpdate : handleAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {editId ? t("common.update") : t("common.add")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default Absences;
