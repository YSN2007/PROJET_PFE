import { useEffect, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import "./Stagiaires.css";
import { useSettings } from "../context/SettingsContext";
import { notifyError, notifySuccess } from "../utils/notifications";
import ProfileModal from "../components/ProfileModal";
import { clearAuthSession } from "../utils/auth";

const STAGIAIRE_FILIERE_STORAGE_KEY = "stagiaireFilieres";
const STAGIAIRE_STATUS_STORAGE_KEY = "stagiaireStatuses";
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
    bell: (
      <>
        <path d="M12 4.8a4.3 4.3 0 0 0-4.3 4.3v2.1c0 .7-.2 1.4-.6 2l-1 1.6h11.8l-1-1.6c-.4-.6-.6-1.3-.6-2V9.1A4.3 4.3 0 0 0 12 4.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.2 17.2a2 2 0 0 0 3.6 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
    filter: (
      <path d="M4.5 6h15l-6 7v4l-3 1v-5l-6-7Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
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

function getInitials(nom, prenom) {
  return `${(nom || "").charAt(0)}${(prenom || "").charAt(0)}`.toUpperCase();
}

function escapeRegExp(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text, searchValue) {
  const safeText = String(text || "");
  const trimmedSearch = String(searchValue || "").trim();

  if (!trimmedSearch) return safeText;

  const regex = new RegExp(`(${escapeRegExp(trimmedSearch)})`, "gi");
  const parts = safeText.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedSearch.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="highlight">
        {part}
      </mark>
    ) : (
      part
    )
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

function getStatusClass(groupeId) {
  return groupeId % 3 === 0 ? "pause" : "active";
}

function getModulesForStagiaireProfile(stagiaire, modules) {
  if (!stagiaire) return [];

  const groupId = String(stagiaire?.groupe?.id || stagiaire?.groupe_id || "");
  const groupName = String(stagiaire?.groupe?.nom_groupe || "").toUpperCase();

  return modules.filter((moduleItem) => {
    const moduleGroupId = String(moduleItem?.groupe?.id || moduleItem?.groupe_id || "");
    const moduleGroupName = String(moduleItem?.groupe?.nom_groupe || "").toUpperCase();

    return (
      (groupId && moduleGroupId === groupId) ||
      (groupName && moduleGroupName === groupName)
    );
  });
}

function Stagiaires() {
  const navigate = useNavigate();
  const { t } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const [searchParams] = useSearchParams();
  const groupeFilter = searchParams.get("groupe");

  const [stagiaires, setStagiaires] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [modules, setModules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const [filiere, setFiliere] = useState("");
  const [statut, setStatut] = useState("");
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isFiliereDropdownOpen, setIsFiliereDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedGroupe, setSelectedGroupe] = useState(groupeFilter || "");
  const [selectedFiliere, setSelectedFiliere] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("");
  const [isAdvancedGroupDropdownOpen, setIsAdvancedGroupDropdownOpen] = useState(false);
  const [isAdvancedFiliereDropdownOpen, setIsAdvancedFiliereDropdownOpen] = useState(false);
  const [isAdvancedStatusDropdownOpen, setIsAdvancedStatusDropdownOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkGroupModal, setShowBulkGroupModal] = useState(false);
  const [bulkGroupeId, setBulkGroupeId] = useState("");
  const [isBulkGroupDropdownOpen, setIsBulkGroupDropdownOpen] = useState(false);
  const [selectedStagiaire, setSelectedStagiaire] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [stagiaireFilieres, setStagiaireFilieres] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STAGIAIRE_FILIERE_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });
  const [stagiaireStatuses, setStagiaireStatuses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STAGIAIRE_STATUS_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchStagiaires();
    fetchGroupes();
    fetchModules();
    setSelectedGroupe(groupeFilter || "");
    setCurrentPage(1);
  }, [groupeFilter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, selectedGroupe, selectedFiliere, selectedStatut, currentPage]);

  const fetchStagiaires = async () => {
    try {
      const res = await api.get("/stagiaires");
      setStagiaires(res.data);
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-fetch-error" });
    }
  };

  const fetchGroupes = async () => {
    try {
      const res = await api.get("/groupes");
      setGroupes(res.data);
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-groupes-error" });
    }
  };

  const fetchModules = async () => {
    try {
      const res = await api.get("/modules");
      setModules(res.data || []);
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-modules-error" });
    }
  };

  const handleAdd = async () => {
    if (!nom || !prenom || !email || !groupeId || !filiere || !statut) {
      notifyError(t("register.error"), { toastId: "stagiaires-validation" });
      return;
    }

    try {
      await api.post("/stagiaires", {
        nom,
        prenom,
        email,
        groupe_id: parseInt(groupeId, 10),
      });

      const nextFilieres = {
        ...stagiaireFilieres,
        [email.trim().toLowerCase()]: filiere,
      };
      setStagiaireFilieres(nextFilieres);
      localStorage.setItem(STAGIAIRE_FILIERE_STORAGE_KEY, JSON.stringify(nextFilieres));

      const nextStatuses = {
        ...stagiaireStatuses,
        [email.trim().toLowerCase()]: statut,
      };
      setStagiaireStatuses(nextStatuses);
      localStorage.setItem(STAGIAIRE_STATUS_STORAGE_KEY, JSON.stringify(nextStatuses));

      fetchStagiaires();
      resetForm();
      notifySuccess("Operation reussie ✅", { toastId: "stagiaires-add-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-add-error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce stagiaire ?")) return;

    const stagiaireToDelete = stagiaires.find((item) => item.id === id);

    try {
      await api.delete(`/stagiaires/${id}`);

      if (stagiaireToDelete?.email) {
        const nextFilieres = { ...stagiaireFilieres };
        delete nextFilieres[stagiaireToDelete.email.trim().toLowerCase()];
        setStagiaireFilieres(nextFilieres);
        localStorage.setItem(STAGIAIRE_FILIERE_STORAGE_KEY, JSON.stringify(nextFilieres));

        const nextStatuses = { ...stagiaireStatuses };
        delete nextStatuses[stagiaireToDelete.email.trim().toLowerCase()];
        setStagiaireStatuses(nextStatuses);
        localStorage.setItem(STAGIAIRE_STATUS_STORAGE_KEY, JSON.stringify(nextStatuses));
      }

      fetchStagiaires();
      notifySuccess("Operation reussie ✅", { toastId: "stagiaires-delete-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-delete-error" });
    }
  };

  const handleEdit = (s) => {
    const grp = groupes.find((g) => g.id === s.groupe_id);
    setNom(s.nom);
    setPrenom(s.prenom);
    setEmail(s.email);
    setGroupeId(s.groupe_id);
    setFiliere(
      stagiaireFilieres[s.email?.trim().toLowerCase()] || grp?.filiere || ""
    );
    setIsFiliereDropdownOpen(false);
    setStatut(
      stagiaireStatuses[s.email?.trim().toLowerCase()] || (getStatusClass(s.groupe_id || 0) === "pause" ? "En pause" : "Actif")
    );
    setIsStatusDropdownOpen(false);
    setEditId(s.id);
    setShowForm(true);
  };

  const handleOpenProfile = async (stagiaire) => {
    setSelectedStagiaire(stagiaire);
    setShowProfileModal(true);
    setProfileLoading(true);
    setProfileData(null);

    try {
      const response = await api.get(`/stagiaires/${stagiaire.id}`);
      const data = response.data || {};
      const currentStagiaire = data.stagiaire || stagiaire;
      const currentModules = getModulesForStagiaireProfile(currentStagiaire, modules);
      const backendNotes = data.notes || [];
      let savedNotes = {};

      try {
        savedNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY) || "{}");
      } catch {
        savedNotes = {};
      }

      const manualNotesForStagiaire = savedNotes[String(stagiaire.id)] || {};
      const mergedNotesFromModules = currentModules.map((moduleItem, index) => {
        const moduleName = moduleItem?.nom_module || `Module ${index + 1}`;
        const manualEntry = manualNotesForStagiaire[moduleName];
        const backendEntry = backendNotes.find((noteItem) => {
          const backendModuleName = noteItem?.module?.nom_module || noteItem?.module?.name || "";
          return backendModuleName === moduleName;
        });

        const manualValue =
          manualEntry && typeof manualEntry === "object"
            ? Number(manualEntry.note)
            : Number(manualEntry);

        const noteValue = Number.isFinite(manualValue)
          ? manualValue
          : Number(backendEntry?.note ?? 0);

        return {
          id: backendEntry?.id || `profile-${stagiaire.id}-${moduleItem.id || moduleName}-${index}`,
          note: Number.isFinite(noteValue) ? noteValue : 0,
          module: {
            ...(backendEntry?.module || {}),
            nom_module: moduleName,
          },
        };
      });
      const mergedNotes = mergedNotesFromModules.length > 0 ? mergedNotesFromModules : backendNotes;

      const statusFallback =
        stagiaireStatuses[stagiaire.email?.trim().toLowerCase()] ||
        (getStatusClass(stagiaire.groupe_id || 0) === "pause" ? "Inactif" : "Actif");

      setProfileData({
        ...data,
        stagiaire: currentStagiaire,
        groupe: data.groupe || currentStagiaire?.groupe,
        notes: mergedNotes,
        statut: data.statut || statusFallback,
      });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaire-profile-error" });
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
    setSelectedStagiaire(null);
    setProfileData(null);
    setProfileLoading(false);
  };

  const handleUpdate = async () => {
    if (!nom || !prenom || !email || !groupeId || !filiere || !statut) {
      notifyError(t("register.error"), { toastId: "stagiaires-update-validation" });
      return;
    }

    try {
      await api.put(`/stagiaires/${editId}`, {
        nom,
        prenom,
        email,
        groupe_id: parseInt(groupeId, 10),
      });

      const nextFilieres = {
        ...stagiaireFilieres,
        [email.trim().toLowerCase()]: filiere,
      };
      setStagiaireFilieres(nextFilieres);
      localStorage.setItem(STAGIAIRE_FILIERE_STORAGE_KEY, JSON.stringify(nextFilieres));

      const nextStatuses = {
        ...stagiaireStatuses,
        [email.trim().toLowerCase()]: statut,
      };
      setStagiaireStatuses(nextStatuses);
      localStorage.setItem(STAGIAIRE_STATUS_STORAGE_KEY, JSON.stringify(nextStatuses));

      fetchStagiaires();
      resetForm();
      notifySuccess("Operation reussie ✅", { toastId: "stagiaires-update-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-update-error" });
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
    if (!window.confirm("Supprimer les stagiaires selectionnes ?")) return;

    setBulkLoading(true);

    try {
      const selectedStagiaires = stagiaires.filter((item) => selectedIds.includes(item.id));

      await api.post("/stagiaires/bulk-delete", {
        ids: selectedIds,
      });

      const nextFilieres = { ...stagiaireFilieres };
      const nextStatuses = { ...stagiaireStatuses };

      selectedStagiaires.forEach((item) => {
        if (!item.email) return;
        delete nextFilieres[item.email.trim().toLowerCase()];
        delete nextStatuses[item.email.trim().toLowerCase()];
      });

      setStagiaireFilieres(nextFilieres);
      localStorage.setItem(STAGIAIRE_FILIERE_STORAGE_KEY, JSON.stringify(nextFilieres));
      setStagiaireStatuses(nextStatuses);
      localStorage.setItem(STAGIAIRE_STATUS_STORAGE_KEY, JSON.stringify(nextStatuses));

      setSelectedIds([]);
      await fetchStagiaires();
      notifySuccess("Operation reussie ✅", { toastId: "stagiaires-bulk-delete-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-bulk-delete-error" });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkGroupUpdate = async () => {
    if (selectedIds.length === 0 || !bulkGroupeId || bulkLoading) {
      notifyError(t("register.error"), { toastId: "stagiaires-bulk-group-validation" });
      return;
    }

    setBulkLoading(true);

    try {
      const targetGroup = groupes.find((item) => String(item.id) === String(bulkGroupeId));
      const targetFiliere = targetGroup?.filiere || "";

      await api.post("/stagiaires/bulk-update-groupe", {
        ids: selectedIds,
        groupe_id: parseInt(bulkGroupeId, 10),
      });

      if (targetFiliere) {
        const nextFilieres = { ...stagiaireFilieres };
        stagiaires
          .filter((item) => selectedIds.includes(item.id))
          .forEach((item) => {
            if (!item.email) return;
            nextFilieres[item.email.trim().toLowerCase()] = targetFiliere;
          });

        setStagiaireFilieres(nextFilieres);
        localStorage.setItem(STAGIAIRE_FILIERE_STORAGE_KEY, JSON.stringify(nextFilieres));
      }

      setSelectedIds([]);
      setBulkGroupeId("");
      setIsBulkGroupDropdownOpen(false);
      setShowBulkGroupModal(false);
      await fetchStagiaires();
      notifySuccess("Operation reussie ✅", { toastId: "stagiaires-bulk-group-success" });
    } catch (err) {
      console.log(err);
      notifyError(t("register.error"), { toastId: "stagiaires-bulk-group-error" });
    } finally {
      setBulkLoading(false);
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
    setPrenom("");
    setEmail("");
    setGroupeId("");
    setFiliere("");
    setStatut("");
    setIsGroupDropdownOpen(false);
    setIsFiliereDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setEditId(null);
    setShowForm(false);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedGroupe("");
    setSelectedFiliere("");
    setSelectedStatut("");
    setIsAdvancedGroupDropdownOpen(false);
    setIsAdvancedFiliereDropdownOpen(false);
    setIsAdvancedStatusDropdownOpen(false);
    setCurrentPage(1);
    if (groupeFilter) {
      navigate("/stagiaires");
    }
  };

  const filtered = stagiaires.filter((s) => {
    const fullName = `${s.nom || ""} ${s.prenom || ""}`.toLowerCase();
    const emailValue = String(s.email || "").toLowerCase();
    const searchValue = search.trim().toLowerCase();
    const grp = groupes.find((g) => g.id === s.groupe_id);
    const displayedFiliere =
      stagiaireFilieres[s.email?.trim().toLowerCase()] || grp?.filiere || "";
    const displayedStatus =
      stagiaireStatuses[s.email?.trim().toLowerCase()] ||
      (getStatusClass(s.groupe_id || 0) === "pause" ? "Inactif" : "Actif");

    const matchesSearch =
      !searchValue ||
      fullName.includes(searchValue) ||
      emailValue.includes(searchValue);
    const matchesGroupe =
      !selectedGroupe || String(s.groupe_id) === String(selectedGroupe);
    const matchesFiliere =
      !selectedFiliere || displayedFiliere.toLowerCase() === selectedFiliere.toLowerCase();
    const matchesStatut =
      !selectedStatut || displayedStatus.toLowerCase() === selectedStatut.toLowerCase();

    return matchesSearch && matchesGroupe && matchesFiliere && matchesStatut;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const visibleIds = currentItems.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const filiereOptions = [...new Set(
    groupes
      .map((g) => g.filiere)
      .filter(Boolean)
  )];

  return (
    <div className={`stagiaires-page ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="stagiaires-sidebar">
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
            {!isSidebarCollapsed && <span className="sidebar-dot" />}
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
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-collapse" onClick={toggleSidebar}>{isSidebarCollapsed ? ">" : "<"}</button>
        </div>
      </aside>

      <motion.main
        className="stagiaires-content"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        transition={pageMotion.transition}
      >
        <header className="page-header">
          <div>
            <h1>{t("stagiaires.pageTitle")}</h1>
            <p>{t("stagiaires.pageSubtitle")}</p>
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

        <motion.section className="stagiaires-body" layout>
          <div className="section-top">
            <div>
              <h2>{t("stagiaires.pageTitle")}</h2>
              <p>{t("stagiaires.found", { count: filtered.length })}</p>
              {search.trim() && (
                <span className="results-counter">{filtered.length} resultat(s) pour "{search.trim()}"</span>
              )}
            </div>

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
              <span>{t("stagiaires.addButton")}</span>
            </motion.button>
          </div>

          <motion.div className="filters-row" layout>
            <div className="search-box">
              <Icon name="search" />
              <input
                type="text"
                placeholder={t("stagiaires.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="filter-box custom-filter-box">
              <Icon name="filter" />
              <div className="custom-select custom-select-filter">
                <button
                  type="button"
                  className={`custom-select-trigger filter-trigger ${isAdvancedGroupDropdownOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsAdvancedGroupDropdownOpen((prev) => !prev);
                    setIsAdvancedFiliereDropdownOpen(false);
                    setIsAdvancedStatusDropdownOpen(false);
                  }}
                >
                  <span>
                    {groupes.find((g) => String(g.id) === String(selectedGroupe))?.nom_groupe || t("stagiaires.allGroups")}
                  </span>
                  <Icon name="chevron" className="custom-select-chevron" />
                </button>

                {isAdvancedGroupDropdownOpen && (
                  <div className="custom-select-menu filter-menu">
                    <button
                      type="button"
                      className={`custom-select-option ${!selectedGroupe ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedGroupe("");
                        setIsAdvancedGroupDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {t("stagiaires.allGroups")}
                    </button>

                    {groupes.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        className={`custom-select-option ${String(g.id) === String(selectedGroupe) ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedGroupe(String(g.id));
                          setIsAdvancedGroupDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {g.nom_groupe}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-box custom-filter-box advanced-filter-box">
              <div className="custom-select custom-select-filter">
                <button
                  type="button"
                  className={`custom-select-trigger filter-trigger ${isAdvancedFiliereDropdownOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsAdvancedFiliereDropdownOpen((prev) => !prev);
                    setIsAdvancedGroupDropdownOpen(false);
                    setIsAdvancedStatusDropdownOpen(false);
                  }}
                >
                  <span>{selectedFiliere || "Toutes les filieres"}</span>
                  <Icon name="chevron" className="custom-select-chevron" />
                </button>

                {isAdvancedFiliereDropdownOpen && (
                  <div className="custom-select-menu filter-menu">
                    <button
                      type="button"
                      className={`custom-select-option ${!selectedFiliere ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedFiliere("");
                        setIsAdvancedFiliereDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      Toutes les filieres
                    </button>

                    {filiereOptions.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`custom-select-option ${selectedFiliere === item ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedFiliere(item);
                          setIsAdvancedFiliereDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-box custom-filter-box advanced-filter-box">
              <div className="custom-select custom-select-filter">
                <button
                  type="button"
                  className={`custom-select-trigger filter-trigger ${isAdvancedStatusDropdownOpen ? "open" : ""}`}
                  onClick={() => {
                    setIsAdvancedStatusDropdownOpen((prev) => !prev);
                    setIsAdvancedGroupDropdownOpen(false);
                    setIsAdvancedFiliereDropdownOpen(false);
                  }}
                >
                  <span>{selectedStatut || t("stagiaires.allStatuses")}</span>
                  <Icon name="chevron" className="custom-select-chevron" />
                </button>

                {isAdvancedStatusDropdownOpen && (
                  <div className="custom-select-menu filter-menu">
                    <button
                      type="button"
                      className={`custom-select-option ${!selectedStatut ? "selected" : ""}`}
                      onClick={() => {
                        setSelectedStatut("");
                        setIsAdvancedStatusDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {t("stagiaires.allStatuses")}
                    </button>

                    {[t("stagiaires.active"), t("stagiaires.inactive")].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`custom-select-option ${selectedStatut === item ? "selected" : ""}`}
                        onClick={() => {
                          setSelectedStatut(item);
                          setIsAdvancedStatusDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <motion.button className="ghost-btn filters-reset-btn" onClick={resetFilters} whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
              {t("stagiaires.reset")}
            </motion.button>
          </motion.div>

          <motion.div className="table-card" layout>
            {selectedIds.length > 0 && (
              <motion.div
                className="bulk-action-bar"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                layout
              >
                <div className="bulk-selection-count">
                  <span>{t("stagiaires.selectedCount", { count: selectedIds.length })}</span>
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
                    <span>{bulkLoading ? t("stagiaires.processing") : t("common.delete")}</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="bulk-btn bulk-btn-primary"
                    onClick={() => setShowBulkGroupModal(true)}
                    disabled={bulkLoading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>{t("stagiaires.changeGroup")}</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {filtered.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">
                  <Icon name="search" />
                </div>
                <h3>{t("stagiaires.noResultsTitle")}</h3>
                <p>{t("stagiaires.noResultsSubtitle")}</p>
              </div>
            ) : (
              <motion.table className="stagiaires-table" layout>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={(event) => handleToggleSelectAll(event.target.checked, visibleIds)}
                      />
                    </th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Groupe</th>
                    <th>Filiere</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <motion.tbody variants={listMotion} initial="hidden" animate="visible" layout>
                  {currentItems.map((s, index) => {
                    const grp = groupes.find((g) => g.id === s.groupe_id);
                    const displayedStatus =
                      stagiaireStatuses[s.email?.trim().toLowerCase()] ||
                      (getStatusClass(s.groupe_id || 0) === "pause" ? "En pause" : "Actif");
                    const statusClass = displayedStatus === "En pause" ? "pause" : "active";
                    const displayedFiliere =
                      stagiaireFilieres[s.email?.trim().toLowerCase()] || grp?.filiere || "Non definie";
                    const isSelected = selectedIds.includes(s.id);

                    return (
                      <motion.tr
                        key={s.id}
                        className={`stagiaire-row ${isSelected ? "selected" : ""}`}
                        onClick={() => handleOpenProfile(s)}
                        variants={rowMotion}
                        transition={{ duration: 0.28, delay: index * 0.02 }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        layout
                      >
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => toggleSelectedId(s.id)}
                          />
                        </td>
                        <td>
                          <div className="name-cell">
                            <div className="avatar-circle">{getInitials(s.nom, s.prenom)}</div>
                            <span className="name-text">
                              {highlightText(`${s.nom} ${s.prenom}`, search)}
                            </span>
                          </div>
                        </td>
                        <td className="email-cell">{highlightText(s.email, search)}</td>
                        <td>
                          <span className="group-pill">{grp?.nom_groupe || "Sans groupe"}</span>
                        </td>
                        <td>
                          <span className={`badge ${getBadgeClass(displayedFiliere)}`}>
                            {displayedFiliere}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            {statusClass === "pause" ? "En pause" : "Actif"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <motion.button className="icon-action" onClick={(event) => {
                              event.stopPropagation();
                              handleEdit(s);
                            }} whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95 }}>
                              <Icon name="edit" />
                            </motion.button>
                            <motion.button className="icon-action" onClick={(event) => {
                              event.stopPropagation();
                              handleDelete(s.id);
                            }} whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.95 }}>
                              <Icon name="trash" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </motion.table>
            )}

            <div className="table-footer">
              <span>{t("stagiaires.pageOf", { page: currentPage, total: totalPages || 1 })}</span>
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
                <h3>{editId ? t("stagiaires.modalEdit") : t("stagiaires.modalAdd")}</h3>
                <button className="modal-close" onClick={resetForm}>x</button>
              </div>

              <div className="modal-grid">
                <div className="modal-field">
                  <label>{t("stagiaires.lastName")}</label>
                  <input type="text" placeholder={t("stagiaires.lastName")} value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>

                <div className="modal-field">
                  <label>{t("stagiaires.firstName")}</label>
                  <input type="text" placeholder={t("stagiaires.firstName")} value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>

                <div className="modal-field modal-field-full">
                  <label>{t("stagiaires.email")}</label>
                  <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="modal-field modal-field-full">
                  <label>{t("stagiaires.group")}</label>
                  <div className="custom-select">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isGroupDropdownOpen ? "open" : ""}`}
                      onClick={() => setIsGroupDropdownOpen((prev) => !prev)}
                    >
                      <span>
                        {groupes.find((g) => String(g.id) === String(groupeId))?.nom_groupe || t("stagiaires.selectGroup")}
                      </span>
                      <Icon name="chevron" className="custom-select-chevron" />
                    </button>

                    {isGroupDropdownOpen && (
                      <div className="custom-select-menu">
                        {groupes.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            className={`custom-select-option ${String(g.id) === String(groupeId) ? "selected" : ""}`}
                            onClick={() => {
                              setGroupeId(String(g.id));
                              setIsGroupDropdownOpen(false);
                            }}
                          >
                            {g.nom_groupe}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-field modal-field-full">
                  <label>{t("stagiaires.filiere")}</label>
                  <div className="custom-select">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isFiliereDropdownOpen ? "open" : ""}`}
                      onClick={() => setIsFiliereDropdownOpen((prev) => !prev)}
                    >
                      <span>{filiere || t("stagiaires.selectFiliere")}</span>
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
                  <label>{t("stagiaires.status")}</label>
                  <div className="custom-select">
                    <button
                      type="button"
                      className={`custom-select-trigger ${isStatusDropdownOpen ? "open" : ""}`}
                      onClick={() => setIsStatusDropdownOpen((prev) => !prev)}
                    >
                      <span>{statut || t("stagiaires.selectStatus")}</span>
                      <Icon name="chevron" className="custom-select-chevron" />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="custom-select-menu">
                        {[t("stagiaires.active"), t("stagiaires.paused")].map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`custom-select-option ${statut === item ? "selected" : ""}`}
                            onClick={() => {
                              setStatut(item);
                              setIsStatusDropdownOpen(false);
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
                <motion.button className="primary-btn" onClick={editId ? handleUpdate : handleAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {editId ? t("common.update") : t("common.add")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
        {showBulkGroupModal && (
          <motion.div className="modal-overlay" onClick={() => {
            if (bulkLoading) return;
            setShowBulkGroupModal(false);
            setBulkGroupeId("");
            setIsBulkGroupDropdownOpen(false);
          }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-card bulk-modal-card" onClick={(event) => event.stopPropagation()} initial={{ scale: 0.86, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.86, opacity: 0, y: 12 }} transition={{ duration: 0.26, ease: "easeOut" }}>
              <div className="modal-header">
                <h3>{t("stagiaires.changeGroupTitle")}</h3>
                <button
                  className="modal-close"
                  onClick={() => {
                    if (bulkLoading) return;
                    setShowBulkGroupModal(false);
                    setBulkGroupeId("");
                    setIsBulkGroupDropdownOpen(false);
                  }}
                >
                  x
                </button>
              </div>

              <div className="modal-field modal-field-full">
                <label>{t("stagiaires.newGroup")}</label>
                <div className="custom-select">
                  <button
                    type="button"
                    className={`custom-select-trigger ${isBulkGroupDropdownOpen ? "open" : ""}`}
                    onClick={() => setIsBulkGroupDropdownOpen((prev) => !prev)}
                  >
                    <span>
                      {groupes.find((g) => String(g.id) === String(bulkGroupeId))?.nom_groupe || t("stagiaires.selectGroup")}
                    </span>
                    <Icon name="chevron" className="custom-select-chevron" />
                  </button>

                  {isBulkGroupDropdownOpen && (
                    <div className="custom-select-menu">
                      {groupes.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          className={`custom-select-option ${String(g.id) === String(bulkGroupeId) ? "selected" : ""}`}
                          onClick={() => {
                            setBulkGroupeId(String(g.id));
                            setIsBulkGroupDropdownOpen(false);
                          }}
                        >
                          {g.nom_groupe}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <motion.button
                  className="ghost-btn"
                  onClick={() => {
                    if (bulkLoading) return;
                    setShowBulkGroupModal(false);
                    setBulkGroupeId("");
                    setIsBulkGroupDropdownOpen(false);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {t("common.cancel")}
                </motion.button>
                <motion.button className="primary-btn" onClick={handleBulkGroupUpdate} disabled={bulkLoading} whileHover={{ scale: bulkLoading ? 1 : 1.03 }} whileTap={{ scale: bulkLoading ? 1 : 0.97 }}>
                  {bulkLoading ? t("stagiaires.processing") : t("stagiaires.validate")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <ProfileModal
          open={showProfileModal}
          loading={profileLoading}
          profileData={profileData || (selectedStagiaire ? { stagiaire: selectedStagiaire } : null)}
          onClose={handleCloseProfile}
        />
      </motion.main>
    </div>
  );
}

export default Stagiaires;



