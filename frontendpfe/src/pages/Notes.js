import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import "./Notes.css";
import { useSettings } from "../context/SettingsContext";
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from "../utils/notifications";
import { clearAuthSession } from "../utils/auth";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

const itemMotion = {
  hidden: { opacity: 0, y: 12 },
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
    medal: (
      <>
        <circle cx="12" cy="10" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.4 14.2 8 20l4-2.2L16 20l-1.4-5.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </>
    ),
    success: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.8 12.2 2.2 2.2 4.4-4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    danger: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="m9 9 6 6M15 9l-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    warning: (
      <>
        <path d="M12 4.8 19.2 18H4.8L12 4.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9.2v4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="15.8" r="1" fill="currentColor" />
      </>
    ),
  };

  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function getFullName(stagiaire) {
  if (!stagiaire) return "";
  return `${stagiaire.nom || ""} ${stagiaire.prenom || ""}`.trim();
}

function getNoteValue(noteItem) {
  const value = Number(noteItem?.note);
  return Number.isFinite(value) ? value : 0;
}

function getCoefficientValue(noteItem) {
  const value = Number(noteItem?.coefficient);
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(5, value));
}

function getNoteTone(value) {
  if (value >= 16) return "success";
  if (value >= 10) return "warning";
  return "danger";
}

function getNoteStatus(value, t) {
  return value >= 10 ? t("notes.validated") : t("notes.retake");
}

function getGlobalPerformance(value, t) {
  if (value >= 16) {
    return { label: t("notes.excellent"), tone: "success" };
  }
  if (value >= 10) {
    return { label: t("notes.averageLevel"), tone: "warning" };
  }
  return { label: t("notes.difficulty"), tone: "danger" };
}

function getModuleName(noteItem) {
  return noteItem?.module?.nom_module || noteItem?.module?.name || "Module";
}

function getStagiaireGroupId(stagiaire) {
  return String(stagiaire?.groupe?.id || stagiaire?.groupe_id || "");
}

function getStagiaireGroupName(stagiaire) {
  return String(stagiaire?.groupe?.nom_groupe || "");
}

function getModulesForStagiaire(stagiaire, modules) {
  if (!stagiaire) return [];

  const groupId = getStagiaireGroupId(stagiaire);
  const groupName = getStagiaireGroupName(stagiaire).toUpperCase();

  const matchedModules = modules.filter((moduleItem) => {
    const moduleGroupId = String(moduleItem?.groupe?.id || moduleItem?.groupe_id || "");
    const moduleGroupName = String(moduleItem?.groupe?.nom_groupe || "").toUpperCase();

    return (
      (groupId && moduleGroupId === groupId) ||
      (groupName && moduleGroupName === groupName)
    );
  });

  return [...new Set(matchedModules.map((moduleItem) => moduleItem?.nom_module).filter(Boolean))];
}

function getModuleObjectForStagiaire(stagiaire, modules, moduleName) {
  if (!stagiaire || !moduleName) return null;

  const groupId = getStagiaireGroupId(stagiaire);
  const groupName = getStagiaireGroupName(stagiaire).toUpperCase();

  return (
    modules.find((moduleItem) => {
      const moduleGroupId = String(moduleItem?.groupe?.id || moduleItem?.groupe_id || "");
      const moduleGroupName = String(moduleItem?.groupe?.nom_groupe || "").toUpperCase();

      return (
        moduleItem?.nom_module === moduleName &&
        (((groupId && moduleGroupId === groupId) || (groupName && moduleGroupName === groupName)))
      );
    }) || null
  );
}

function parseDecimalValue(value) {
  if (value === "" || value === null || value === undefined) return NaN;
  const normalized = String(value).trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getApiErrorMessage(error, fallback = "Erreur") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat().find(Boolean);
    if (typeof firstError === "string" && firstError.trim()) {
      return firstError.trim();
    }
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

function Notes() {
  const navigate = useNavigate();
  const { t, theme } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [notes, setNotes] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedStagiaireId, setSelectedStagiaireId] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const [moduleInputs, setModuleInputs] = useState({});
  const [moduleCoefficients, setModuleCoefficients] = useState({});
  const [savedNotes, setSavedNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchNotes();
    fetchStagiaires();
    fetchModules();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data || []);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "notes-fetch-error" });
    }
  };

  const fetchStagiaires = async () => {
    try {
      const res = await api.get("/stagiaires");
      const data = res.data || [];
      setStagiaires(data);
      if (data.length > 0) {
        setSelectedStagiaireId(String(data[0].id));
      }
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "notes-stagiaires-error" });
    }
  };

  const fetchModules = async () => {
    try {
      const res = await api.get("/modules");
      setModules(res.data || []);
    } catch (err) {
      console.log(err);
      notifyError("Erreur ❌", { toastId: "notes-modules-error" });
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

  const selectedStagiaire = useMemo(() => {
    return stagiaires.find((item) => String(item.id) === String(selectedStagiaireId)) || null;
  }, [stagiaires, selectedStagiaireId]);

  const availableModules = useMemo(() => {
    const modulesFromGroup = getModulesForStagiaire(selectedStagiaire, modules);
    if (modulesFromGroup.length > 0) {
      return modulesFromGroup;
    }

    const modulesFromNotes = notes
      .filter((noteItem) => {
        const noteStagiaireId = String(noteItem?.stagiaire?.id || noteItem?.stagiaire_id || "");
        return selectedStagiaireId && noteStagiaireId === String(selectedStagiaireId);
      })
      .map((noteItem) => getModuleName(noteItem))
      .filter(Boolean);

    return [...new Set(modulesFromNotes)];
  }, [modules, notes, selectedStagiaire, selectedStagiaireId]);

  useEffect(() => {
    if (!selectedStagiaireId) {
      setModuleInputs({});
      setModuleCoefficients({});
      return;
    }

    const manualForStagiaire = savedNotes[selectedStagiaireId] || {};
    const apiNotesForStagiaire = notes.filter((noteItem) => {
      const noteStagiaireId = String(noteItem?.stagiaire?.id || noteItem?.stagiaire_id || "");
      return noteStagiaireId === String(selectedStagiaireId);
    });

    const nextInputs = {};

    availableModules.forEach((moduleName) => {
      if (manualForStagiaire[moduleName] !== undefined) {
        const savedValue = manualForStagiaire[moduleName];
        if (savedValue && typeof savedValue === "object") {
          nextInputs[moduleName] = savedValue.note !== undefined ? String(savedValue.note) : "";
          return;
        }
        nextInputs[moduleName] = String(savedValue);
        return;
      }

      const matchingApiNote = apiNotesForStagiaire.find((noteItem) => getModuleName(noteItem) === moduleName);
      if (matchingApiNote) {
        nextInputs[moduleName] = String(getNoteValue(matchingApiNote));
      } else {
        nextInputs[moduleName] = "";
      }
    });

    setModuleInputs(nextInputs);
    const nextCoefficients = {};

    availableModules.forEach((moduleName) => {
      const savedValue = manualForStagiaire[moduleName];
      if (savedValue && typeof savedValue === "object" && savedValue.coefficient !== undefined) {
        nextCoefficients[moduleName] = String(getCoefficientValue(savedValue));
      } else {
        nextCoefficients[moduleName] = "1";
      }
    });

    setModuleCoefficients(nextCoefficients);
  }, [availableModules, notes, savedNotes, selectedStagiaireId]);

  const displayNotes = useMemo(() => {
    if (!selectedStagiaireId || !selectedStagiaire) return [];

    const manualForStagiaire = savedNotes[selectedStagiaireId];
    if (manualForStagiaire && Object.keys(manualForStagiaire).length > 0) {
      return Object.entries(manualForStagiaire).map(([moduleName, value], index) => {
        const normalizedValue =
          value && typeof value === "object"
            ? { note: Number(value.note), coefficient: getCoefficientValue(value) }
            : { note: Number(value), coefficient: 1 };

        return {
          id: `manual-${selectedStagiaireId}-${moduleName}-${index}`,
          note: normalizedValue.note,
          coefficient: normalizedValue.coefficient,
          stagiaire: selectedStagiaire,
          module: { nom_module: moduleName },
        };
      });
    }

    return notes.filter((noteItem) => {
      const noteStagiaireId = String(noteItem?.stagiaire?.id || noteItem?.stagiaire_id || "");
      return noteStagiaireId === String(selectedStagiaireId);
    });
  }, [notes, savedNotes, selectedStagiaire, selectedStagiaireId]);

  const filteredNotes = useMemo(() => {
    return displayNotes.filter((noteItem) => {
      const moduleName = getModuleName(noteItem);
      return !selectedModule || moduleName === selectedModule;
    });
  }, [displayNotes, selectedModule]);

  const average = useMemo(() => {
    if (!filteredNotes.length) return "0.0";
    const weighted = filteredNotes.reduce(
      (acc, noteItem) => {
        const note = getNoteValue(noteItem);
        const coefficient = getCoefficientValue(noteItem);
        return {
          total: acc.total + note * coefficient,
          coefficients: acc.coefficients + coefficient,
        };
      },
      { total: 0, coefficients: 0 }
    );

    if (!weighted.coefficients) return "0.0";
    return (weighted.total / weighted.coefficients).toFixed(1);
  }, [filteredNotes]);

  const validatedCount = filteredNotes.filter((noteItem) => getNoteValue(noteItem) >= 10).length;
  const retakeCount = filteredNotes.filter((noteItem) => getNoteValue(noteItem) < 10).length;
  const overallRetakeCount = displayNotes.filter((noteItem) => getNoteValue(noteItem) < 10).length;
  const performance = getGlobalPerformance(Number(average), t);

  const ranking = useMemo(() => {
    if (!selectedStagiaireId || (notes.length === 0 && Object.keys(savedNotes).length === 0)) {
      return { position: 0, total: 0 };
    }

    const groupedFromApi = notes.reduce((acc, noteItem) => {
      const stagiaireId = String(noteItem?.stagiaire?.id || noteItem?.stagiaire_id || "");
      if (!stagiaireId) return acc;

      if (!acc[stagiaireId]) {
        acc[stagiaireId] = { total: 0, count: 0 };
      }

      const coefficient = getCoefficientValue(noteItem);
      acc[stagiaireId].total += getNoteValue(noteItem) * coefficient;
      acc[stagiaireId].count += coefficient;
      return acc;
    }, {});

    const grouped = { ...groupedFromApi };

    Object.entries(savedNotes).forEach(([stagiaireId, moduleMap]) => {
      const values = Object.values(moduleMap)
        .map((value) => {
          if (value && typeof value === "object") {
            return {
              note: Number(value.note),
              coefficient: getCoefficientValue(value),
            };
          }
          return {
            note: Number(value),
            coefficient: 1,
          };
        })
        .filter((item) => Number.isFinite(item.note));
      if (values.length === 0) return;

      grouped[stagiaireId] = {
        total: values.reduce((sum, item) => sum + item.note * item.coefficient, 0),
        count: values.reduce((sum, item) => sum + item.coefficient, 0),
      };
    });

    const ranked = Object.entries(grouped)
      .map(([stagiaireId, values]) => ({
        stagiaireId,
        moyenne: values.count > 0 ? values.total / values.count : 0,
      }))
      .sort((a, b) => b.moyenne - a.moyenne);

    const position = ranked.findIndex((item) => item.stagiaireId === String(selectedStagiaireId)) + 1;

    return {
      position,
      total: ranked.length,
    };
  }, [notes, savedNotes, selectedStagiaireId]);

  const handleModuleInputChange = (moduleName, value) => {
    if (value === "") {
      setModuleInputs((current) => ({ ...current, [moduleName]: "" }));
      return;
    }

    const numericValue = parseDecimalValue(value);
    if (!Number.isFinite(numericValue)) return;

    const clamped = Math.max(0, Math.min(20, numericValue));
    setModuleInputs((current) => ({ ...current, [moduleName]: String(clamped) }));
  };

  const handleCoefficientChange = (moduleName, value) => {
    if (value === "") {
      setModuleCoefficients((current) => ({ ...current, [moduleName]: "" }));
      return;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return;

    const clamped = Math.max(1, Math.min(5, Math.round(numericValue)));
    setModuleCoefficients((current) => ({ ...current, [moduleName]: String(clamped) }));
  };

  const handleSaveNotes = async () => {
    if (!selectedStagiaireId) {
      notifyError("Erreur", { toastId: "notes-validation-no-stagiaire" });
      return;
    }

    const nextModuleMap = {};
    availableModules.forEach((moduleName) => {
      const rawValue = moduleInputs[moduleName];
      if (rawValue === "" || rawValue === undefined) return;
      const numericValue = parseDecimalValue(rawValue);
      if (!Number.isFinite(numericValue)) return;
      const rawCoefficient = moduleCoefficients[moduleName];
      const numericCoefficient = Number(rawCoefficient);
      if (!Number.isFinite(numericCoefficient)) return;
      nextModuleMap[moduleName] = {
        note: Math.max(0, Math.min(20, numericValue)),
        coefficient: Math.max(1, Math.min(5, Math.round(numericCoefficient))),
      };
    });

    if (Object.keys(nextModuleMap).length === 0) {
      notifyError("Erreur", { toastId: "notes-validation-empty" });
      return;
    }

    const hadExistingNotes = Boolean(savedNotes[selectedStagiaireId] && Object.keys(savedNotes[selectedStagiaireId]).length);

    try {
      const syncOperations = Object.entries(nextModuleMap).map(async ([moduleName, value]) => {
        const moduleObject = getModuleObjectForStagiaire(selectedStagiaire, modules, moduleName);
        if (!moduleObject?.id) return;

        const existingNote = notes.find((noteItem) => {
          const noteStagiaireId = String(noteItem?.stagiaire?.id || noteItem?.stagiaire_id || "");
          const noteModuleId = String(noteItem?.module?.id || noteItem?.module_id || "");
          return noteStagiaireId === String(selectedStagiaireId) && noteModuleId === String(moduleObject.id);
        });

        const payload = {
          stagiaire_id: Number(selectedStagiaireId),
          module_id: Number(moduleObject.id),
          note: Number(value.note),
        };

        if (existingNote?.id) {
          await api.put(`/notes/${existingNote.id}`, payload);
          return;
        }

        await api.post("/notes", payload);
      });

      await Promise.all(syncOperations);

      const nextSavedNotes = {
        ...savedNotes,
        [selectedStagiaireId]: nextModuleMap,
      };

      setSavedNotes(nextSavedNotes);
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(nextSavedNotes));
      await fetchNotes();

      notifySuccess("Operation reussie", {
        toastId: hadExistingNotes ? "notes-update-success" : "notes-add-success",
      });

      if (Object.values(nextModuleMap).some((entry) => Number(entry.note) < 10)) {
        notifyWarning("Rattrapage necessaire", { toastId: "notes-save-warning" });
      }
    } catch (err) {
      console.log(err);
      notifyError(getApiErrorMessage(err, "Erreur"), {
        toastId: "notes-save-error",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    if (!selectedStagiaire) return;
    notifyInfo("Stagiaire charge", { toastId: `notes-stagiaire-${selectedStagiaireId}` });
  }, [selectedStagiaire, selectedStagiaireId]);

  useEffect(() => {
    if (!selectedStagiaire || displayNotes.length === 0) return;

    if (overallRetakeCount > 0) {
      notifyWarning("Ce stagiaire a des modules en rattrapage", {
        toastId: `notes-smart-warning-${selectedStagiaireId}`,
      });
      return;
    }

    notifySuccess("Tous les modules sont valides", {
      toastId: `notes-smart-success-${selectedStagiaireId}`,
    });
  }, [displayNotes.length, overallRetakeCount, selectedStagiaire, selectedStagiaireId]);

  const handleExportPDF = () => {
    if (!selectedStagiaire || filteredNotes.length === 0) return;

    const doc = new jsPDF();
    const globalStatus = Number(average) >= 10 ? "Valide" : "Rattrapage";
    const statusColor = Number(average) >= 10 ? [46, 155, 97] : [220, 38, 38];
    const exportDate = new Date().toLocaleDateString("fr-FR");

    doc.setFillColor(40, 76, 131);
    doc.roundedRect(14, 12, 16, 16, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("E", 22, 22, { align: "center" });

    doc.setTextColor(23, 32, 51);
    doc.setFontSize(16);
    doc.text("EduManager", 36, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(108, 118, 136);
    doc.text(`Date d'export : ${exportDate}`, 36, 25);

    doc.setTextColor(23, 32, 51);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rapport des notes", 105, 40, { align: "center" });

    doc.setDrawColor(226, 233, 242);
    doc.line(14, 46, 196, 46);

    doc.setFont("helvetica", "normal");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(23, 32, 51);
    doc.text(`Stagiaire : ${getFullName(selectedStagiaire)}`, 14, 56);
    doc.text(`Moyenne generale : ${average}/20`, 14, 64);
    doc.setTextColor(...statusColor);
    doc.text(`Status : ${globalStatus}`, 14, 72);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 82,
      head: [["Module", "Note", "Status"]],
      body: filteredNotes.map((noteItem) => {
        const value = getNoteValue(noteItem);
        return [
          getModuleName(noteItem),
          `${value}/20`,
          value >= 10 ? "Valide" : "Rattrapage",
        ];
      }),
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 4,
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: [40, 76, 131],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: {
        top: 82,
        left: 14,
        right: 14,
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          const isValid = data.cell.raw === "Valide";
          data.cell.styles.textColor = isValid ? [46, 155, 97] : [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    doc.save(`rapport-notes-${getFullName(selectedStagiaire).replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const handleExportExcel = () => {
    if (!selectedStagiaire || filteredNotes.length === 0) return;

    const stagiaireName = getFullName(selectedStagiaire);
    const exportDate = new Date().toLocaleDateString("fr-FR");
    const statusLabel = Number(average) >= 10 ? "Validé" : "Rattrapage";
    const headerRowNumber = 7;

    const rows = [
      ["Rapport des notes", "", "", ""],
      ["Date d'export", exportDate, "", ""],
      ["Stagiaire", stagiaireName, "", ""],
      ["Moyenne générale", `${average}/20`, "", ""],
      ["Status global", statusLabel, "", ""],
      [],
      ["Stagiaire", "Module", "Note", "Status"],
      ...filteredNotes.map((noteItem) => {
        const value = getNoteValue(noteItem);
        return [
          stagiaireName,
          getModuleName(noteItem),
          `${value}/20`,
          value >= 10 ? "Validé" : "Rattrapage",
        ];
      }),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!cols"] = rows[headerRowNumber - 1].map((_, columnIndex) => {
      const width = rows.reduce((maxWidth, row) => {
        const value = row?.[columnIndex] ?? "";
        return Math.max(maxWidth, String(value).length);
      }, 12);

      return { wch: Math.min(Math.max(width + 4, 14), 34) };
    });

    const headerCells = ["A7", "B7", "C7", "D7"];
    headerCells.forEach((cellRef) => {
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "284C83" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "D9E2F1" } },
          bottom: { style: "thin", color: { rgb: "D9E2F1" } },
          left: { style: "thin", color: { rgb: "D9E2F1" } },
          right: { style: "thin", color: { rgb: "D9E2F1" } },
        },
      };
    });

    ["A1", "A2", "A3", "A4", "A5"].forEach((cellRef, index) => {
      if (!worksheet[cellRef]) return;
      worksheet[cellRef].s = {
        font: {
          bold: true,
          sz: index === 0 ? 14 : 11,
          color: { rgb: index === 0 ? "172033" : "284C83" },
        },
      };
    });

    filteredNotes.forEach((noteItem, noteIndex) => {
      const rowNumber = headerRowNumber + 1 + noteIndex;
      const value = getNoteValue(noteItem);
      const isValidated = value >= 10;
      const statusCellRef = `D${rowNumber}`;
      const noteCellRef = `C${rowNumber}`;

      if (worksheet[noteCellRef]) {
        worksheet[noteCellRef].s = {
          alignment: { horizontal: "center", vertical: "center" },
        };
      }

      if (worksheet[statusCellRef]) {
        worksheet[statusCellRef].s = {
          font: {
            bold: true,
            color: { rgb: isValidated ? "2E9B61" : "DC2626" },
          },
          fill: {
            fgColor: { rgb: isValidated ? "EEF8F1" : "FFF1F1" },
          },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Notes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, `rapport-notes-${stagiaireName.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
  };

  const chartData = useMemo(() => {
    const labels = filteredNotes.map((noteItem) => getModuleName(noteItem));
    const values = filteredNotes.map((noteItem) => getNoteValue(noteItem));
    const colors = values.map((value) => {
      if (value >= 16) return "#2e9b61";
      if (value >= 10) return "#d19124";
      return "#dc2626";
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderRadius: 12,
          borderSkipped: false,
          barThickness: 34,
        },
      ],
    };
  }, [filteredNotes]);

  const chartOptions = useMemo(() => {
    const tickColor = theme === "dark" ? "#edf4ff" : "#6b7688";
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.14)" : "#e6edf7";

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: theme === "dark" ? "#0f172a" : "#172033",
          displayColors: false,
          callbacks: {
            label: (context) => `${context.raw}/20`,
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: tickColor,
            font: {
              size: 12,
              weight: 600,
            },
          },
        },
        y: {
          beginAtZero: true,
          max: 20,
          ticks: {
            stepSize: 5,
            color: tickColor,
            font: {
              size: 12,
            },
          },
          grid: {
            color: gridColor,
          },
        },
      },
    };
  }, [theme]);

  return (
    <div className={`notes-page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="notes-sidebar">
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
          </NavLink>

          <NavLink to="/notes" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <Icon name="notes" />
            {!isSidebarCollapsed && <span>{t("common.nav.notes")}</span>}
            {!isSidebarCollapsed && <span className="sidebar-dot" />}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-collapse" onClick={toggleSidebar}>{isSidebarCollapsed ? ">" : "<"}</button>
        </div>
      </aside>

      <motion.main
        className="notes-content"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        transition={pageMotion.transition}
      >
        <header className="page-header">
          <div>
            <h1>{t("notes.pageTitle")}</h1>
            <p>{t("notes.pageSubtitle")}</p>
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

        <motion.section className="notes-body" layout>
          <motion.div className="notes-stage" layout>
            <div className="notes-intro">
              <div>
                <p className="notes-kicker">{t("notes.pageTitle")}</p>
                <h2>{selectedStagiaire ? getFullName(selectedStagiaire) : t("notes.selectPlaceholder")}</h2>
              </div>

              <div className="notes-filters">
                <div className="notes-selector notes-export-slot">
                  <div className="notes-export-actions">
                    <motion.button type="button" className="notes-export-btn notes-export-btn-secondary" onClick={handleExportExcel} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                      {t("notes.exportExcel")}
                    </motion.button>
                    <motion.button type="button" className="notes-export-btn" onClick={handleExportPDF} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                      {t("notes.exportPdf")}
                    </motion.button>
                  </div>
                </div>

                <div className="notes-selector">
                  <label>{t("notes.selectLabel")}</label>
                  <div className="notes-select">
                    <button
                      type="button"
                      className={`notes-select-trigger ${isDropdownOpen ? "open" : ""}`}
                      onClick={() => {
                        setIsDropdownOpen((prev) => !prev);
                        setIsModuleDropdownOpen(false);
                      }}
                    >
                      <span>{selectedStagiaire ? getFullName(selectedStagiaire) : t("notes.selectPlaceholder")}</span>
                      <Icon name="chevron" className="notes-select-chevron" />
                    </button>

                    {isDropdownOpen && (
                      <div className="notes-select-menu">
                        {stagiaires.map((stagiaire) => (
                          <button
                            key={stagiaire.id}
                            type="button"
                            className={`notes-select-option ${String(stagiaire.id) === String(selectedStagiaireId) ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedStagiaireId(String(stagiaire.id));
                              setSelectedModule("");
                              setIsDropdownOpen(false);
                            }}
                          >
                            {getFullName(stagiaire)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="notes-selector">
                  <label>{t("notes.moduleLabel")}</label>
                  <div className="notes-select">
                    <button
                      type="button"
                      className={`notes-select-trigger ${isModuleDropdownOpen ? "open" : ""}`}
                      onClick={() => {
                        setIsModuleDropdownOpen((prev) => !prev);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{selectedModule || t("notes.allModules")}</span>
                      <Icon name="chevron" className="notes-select-chevron" />
                    </button>

                    {isModuleDropdownOpen && (
                      <div className="notes-select-menu">
                        <button
                          type="button"
                          className={`notes-select-option ${selectedModule === "" ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedModule("");
                            setIsModuleDropdownOpen(false);
                          }}
                        >
                          {t("notes.allModules")}
                        </button>

                        {availableModules.map((moduleName) => (
                          <button
                            key={moduleName}
                            type="button"
                            className={`notes-select-option ${selectedModule === moduleName ? "selected" : ""}`}
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
              </div>
            </div>

            {selectedStagiaire && availableModules.length > 0 && (
              <motion.section className="notes-editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} layout>
                <div className="notes-section-head">
                  <h3>{t("notes.notesEntry")}</h3>
                </div>

                <motion.div className="notes-editor-grid" variants={listMotion} initial="hidden" animate="visible" layout>
                  {availableModules.map((moduleName) => (
                    <motion.label key={moduleName} className="notes-editor-field" variants={itemMotion} whileHover={{ y: -2 }}>
                      <span>{moduleName}</span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="0 - 20"
                        value={moduleInputs[moduleName] ?? ""}
                        onChange={(e) => handleModuleInputChange(moduleName, e.target.value)}
                      />
                      <div className="notes-coefficient-block">
                        <small>{t("notes.coefficient")}</small>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          step="1"
                          placeholder="1 - 5"
                          value={moduleCoefficients[moduleName] ?? "1"}
                          onChange={(e) => handleCoefficientChange(moduleName, e.target.value)}
                        />
                      </div>
                    </motion.label>
                  ))}
                </motion.div>

                <div className="notes-editor-actions">
                  <motion.button type="button" className="notes-save-btn" onClick={handleSaveNotes} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                    {t("notes.saveNotes")}
                  </motion.button>
                </div>
              </motion.section>
            )}

            <motion.div className="notes-profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }} layout>
              <div className="notes-profile-copy">
                <span>{t("notes.average")}</span>
                <strong>{average}/20</strong>
                <div className={`notes-performance-badge ${performance.tone}`}>
                  {performance.label}
                </div>
                <p>{t("notes.notesCount", { count: filteredNotes.length })}</p>
              </div>

              <div className={`notes-average-orb ${getNoteTone(Number(average))}`}>
                <Icon name="medal" />
              </div>
            </motion.div>

            {ranking.total > 0 && ranking.position > 0 && (
              <motion.div className="notes-ranking-badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} whileHover={{ y: -2 }}>
                <span className="notes-ranking-icon">🏆</span>
                <span>{t("notes.ranking", { position: ranking.position, total: ranking.total })}</span>
              </motion.div>
            )}

            {retakeCount > 0 && (
              <motion.div className="notes-alert-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} whileHover={{ y: -2 }}>
                <span className="notes-alert-icon">
                  <Icon name="warning" />
                </span>
                <span>{t("notes.retakeAlert", { count: retakeCount })}</span>
              </motion.div>
            )}

            <motion.div className="notes-stats-row" variants={listMotion} initial="hidden" animate="visible" layout>
              <motion.article className="notes-stat-chip success" variants={itemMotion} whileHover={{ y: -3, scale: 1.01 }}>
                <span className="notes-stat-icon">
                  <Icon name="success" />
                </span>
                <div>
                  <strong>{validatedCount}</strong>
                  <span>{t("notes.validatedCount")}</span>
                </div>
              </motion.article>

              <motion.article className="notes-stat-chip danger" variants={itemMotion} whileHover={{ y: -3, scale: 1.01 }}>
                <span className="notes-stat-icon">
                  <Icon name="danger" />
                </span>
                <div>
                  <strong>{retakeCount}</strong>
                  <span>{t("notes.retake")}</span>
                </div>
              </motion.article>

              <motion.article className="notes-stat-chip total" variants={itemMotion} whileHover={{ y: -3, scale: 1.01 }}>
                <span className="notes-stat-icon">
                  <Icon name="modules" />
                </span>
                <div>
                  <strong>{filteredNotes.length}</strong>
                  <span>{t("notes.totalLabel")}</span>
                </div>
              </motion.article>
            </motion.div>

            {!selectedStagiaire && (
              <div className="notes-empty-state">
                <p>{t("notes.empty")}</p>
              </div>
            )}

            {selectedStagiaire && filteredNotes.length === 0 && (
              <div className="notes-empty-state">
                <p>{t("notes.noNotes")}</p>
              </div>
            )}

            {selectedStagiaire && filteredNotes.length > 0 && (
              <>
                <motion.div className="notes-visual-layout" layout>
                  <motion.section className="notes-mini-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} layout>
                    <div className="notes-section-head">
                      <h3>{t("notes.moduleList")}</h3>
                    </div>

                    <motion.div className="notes-list" variants={listMotion} initial="hidden" animate="visible" layout>
                      {filteredNotes.map((noteItem) => {
                        const value = getNoteValue(noteItem);
                        const tone = getNoteTone(value);

                        return (
                          <motion.article key={noteItem.id} className={`notes-line ${tone}`} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} layout>
                            <div className="notes-line-main">
                              <span className="notes-module-name">{getModuleName(noteItem)}</span>
                              <span className={`notes-score ${tone}`}>{t("notes.noteValue", { value })}</span>
                            </div>

                            <span className={`notes-status-badge ${value >= 10 ? "success" : "danger"}`}>
                              {getNoteStatus(value, t)}
                            </span>
                          </motion.article>
                        );
                      })}
                    </motion.div>
                  </motion.section>

                  <motion.section className="notes-performance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }} layout>
                    <div className="notes-section-head">
                      <h3>{t("notes.performance")}</h3>
                    </div>

                    <motion.div className="notes-progress-stack" variants={listMotion} initial="hidden" animate="visible" layout>
                      {filteredNotes.map((noteItem) => {
                        const value = getNoteValue(noteItem);
                        const tone = getNoteTone(value);
                        const width = `${Math.max(0, Math.min((value / 20) * 100, 100))}%`;

                        return (
                          <motion.div key={`progress-${noteItem.id}`} className="notes-progress-row" variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} layout>
                            <div className="notes-progress-head">
                              <span className="notes-module-name">{getModuleName(noteItem)}</span>
                              <div className="notes-progress-meta">
                                <span className={`notes-score ${tone}`}>{t("notes.noteValue", { value })}</span>
                                <span className={`notes-status-badge ${value >= 10 ? "success" : "danger"}`}>
                                  {getNoteStatus(value, t)}
                                </span>
                              </div>
                            </div>

                            <div className="notes-progress-track">
                              <motion.div className={`notes-progress-fill ${tone}`} initial={{ width: 0 }} animate={{ width }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.section>
                </motion.div>

                <motion.section className="notes-chart-section" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }} layout>
                  <div className="notes-section-head">
                    <h3>{t("notes.chartTitle")}</h3>
                  </div>

                  <div className="notes-chart-wrap">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </motion.section>
              </>
            )}
          </motion.div>
        </motion.section>
      </motion.main>
    </div>
  );
}

export default Notes;


