import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Dashboard.css";
import { useSettings } from "../context/SettingsContext";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { clearAuthSession } from "../utils/auth";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

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
    theme: (
      <>
        <path d="M12 3.8v2.2M12 18v2.2M5.7 5.7l1.5 1.5M16.8 16.8l1.5 1.5M3.8 12H6M18 12h2.2M5.7 18.3l1.5-1.5M16.8 7.2l1.5-1.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </>
    ),
    language: (
      <>
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.8 9.5h14.4M4.8 14.5h14.4M12 4.2c2 2.1 3.2 4.9 3.2 7.8 0 2.9-1.2 5.7-3.2 7.8-2-2.1-3.2-4.9-3.2-7.8 0-2.9 1.2-5.7 3.2-7.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    chevron: (
      <path
        d="m8 10 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
    trend: (
      <path d="M5 16 10 11l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
    alert: (
      <>
        <path d="M12 4.8 4.8 18h14.4L12 4.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 9.6v4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </>
    ),
    activity: (
      <>
        <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4.5l3 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    dot: <circle cx="12" cy="12" r="3.2" fill="currentColor" />,
  };

  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {icons[name]}
    </svg>
  );
}

function getFullName(person) {
  if (!person) return "Element inconnu";
  const name = `${person.prenom || ""} ${person.nom || ""}`.trim();
  return name || person.name || "Element inconnu";
}

function getSafeDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatActivityTime(value) {
  const date = getSafeDate(value);
  if (!date) return "Date inconnue";

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AlertsCard({ alerts }) {
  const { t } = useSettings();
  return (
    <motion.article className="dashboard-info-card alerts-card" variants={itemMotion} whileHover={{ y: -3 }}>
      <div className="dashboard-info-head">
        <div className="dashboard-info-icon alerts">
          <Icon name="alert" />
        </div>
        <div>
          <h3>{t("dashboard.alertsTitle")}</h3>
          <p>{t("dashboard.alertsSubtitle")}</p>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <motion.div
            key={alert.key}
            className={`alert-item ${alert.tone} ${alert.count > 0 ? "active" : ""}`}
            whileHover={{ x: 2 }}
          >
            <span className="alert-item-icon">{alert.icon}</span>
            <div>
              <strong>{alert.count}</strong>
              <p>{alert.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function ActivityCard({ items }) {
  const { t } = useSettings();
  return (
    <motion.article className="dashboard-info-card activity-card" variants={itemMotion} whileHover={{ y: -3 }}>
      <div className="dashboard-info-head">
        <div className="dashboard-info-icon activity">
          <Icon name="activity" />
        </div>
        <div>
          <h3>{t("dashboard.activityTitle")}</h3>
          <p>{t("dashboard.activitySubtitle")}</p>
        </div>
      </div>

      <div className="activity-list">
        {items.length > 0 ? (
          items.map((item) => (
            <motion.div key={item.key} className="activity-item" whileHover={{ x: 2 }}>
              <span className={`activity-dot ${item.type}`}>
                <Icon name="dot" />
              </span>
              <div className="activity-content">
                <strong>{item.title}</strong>
                <p>{item.timeLabel}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="activity-empty">{t("dashboard.activityEmpty")}</div>
        )}
      </div>
    </motion.article>
  );
}

function Dashboard() {
  const [groupStats, setGroupStats] = useState([]);
  const [stats, setStats] = useState({});
  const [notes, setNotes] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
  const languageMenuRef = useRef(null);
  const navigate = useNavigate();
  const { t, theme, toggleTheme, language, setLanguage } = useSettings();

  useEffect(() => {
    fetchStats();
    fetchGroupStats();
    fetchNotes();
    fetchAbsences();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchGroupStats = async () => {
    try {
      const res = await api.get("/groupes");
      setGroupStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchAbsences = async () => {
    try {
      const res = await api.get("/absences");
      setAbsences(res.data || []);
    } catch (err) {
      console.log(err);
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

  const statCards = [
    {
      title: t("dashboard.totalStagiaires"),
      value: stats.stagiaires || 0,
      trend: "+12%",
      trendType: "positive",
      icon: "stagiaires",
      tone: "blue",
    },
    {
      title: t("dashboard.activeGroupes"),
      value: stats.groupes || 0,
      trend: `+${stats.groupes || 0}`,
      trendType: "positive",
      icon: "groupes",
      tone: "green",
    },
    {
      title: t("dashboard.modules"),
      value: stats.modules || 0,
      trend: `+${stats.modules || 0}`,
      trendType: "positive",
      icon: "modules",
      tone: "sky",
    },
    {
      title: t("dashboard.absences"),
      value: stats.absences || 0,
      trend: "-2%",
      trendType: "negative",
      icon: "trend",
      tone: "mint",
    },
  ];

  const chartData = {
    labels: [
      t("common.nav.stagiaires"),
      t("common.nav.groupes"),
      t("common.nav.modules"),
      t("common.nav.absences"),
    ],
    datasets: [
      {
        label: t("dashboard.overview"),
        data: [
          stats.stagiaires || 0,
          stats.groupes || 0,
          stats.modules || 0,
          stats.absences || 0,
        ],
        backgroundColor: theme === "dark" ? "#ffffff" : "#284c83",
        borderRadius: 10,
        barThickness: 54,
      },
    ],
  };

  const groupData = {
    labels: groupStats.map((g) => g.nom_groupe),
    datasets: [
      {
        data: groupStats.map((g) => g.stagiaires_count || 0),
        backgroundColor: ["#284c83", "#35b29c", "#f5a623", "#7f56d9", "#5b8def", "#10b981"],
        borderWidth: 0,
      },
    ],
  };

  const groupChartOptions = {
    onClick: (_, elements) => {
      if (!elements.length) return;
      const selectedGroup = groupStats[elements[0].index];
      if (selectedGroup) {
        navigate(`/stagiaires?groupe=${selectedGroup.id}`);
      }
    },
    cutout: "62%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#0f172a" : "#172033",
      },
    },
    maintainAspectRatio: false,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === "dark" ? "#0f172a" : "#172033",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme === "dark" ? "#ffffff" : "#8c96a7",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.28)" : "#e9edf4",
        },
        ticks: {
          color: theme === "dark" ? "#ffffff" : "#8c96a7",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const rattrapageCount = notes.reduce((count, item) => {
    const noteValue = Number(item.note);
    return !Number.isNaN(noteValue) && noteValue < 10 ? count + 1 : count;
  }, 0);

  const unjustifiedAbsencesCount = absences.reduce(
    (count, item) => (item.justifie === true || item.justifie === 1 || item.justifie === "1" ? count : count + 1),
    0
  );

  const alerts = [
    {
      key: "rattrapage",
      count: rattrapageCount,
      label: t("dashboard.retakeAlert"),
      icon: "❗",
      tone: "danger",
    },
    {
      key: "absences",
      count: unjustifiedAbsencesCount,
      label: t("dashboard.unjustifiedAlert"),
      icon: "⚠️",
      tone: "warning",
    },
  ];

  const recentActivities = [
    ...absences.map((absence) => ({
      key: `absence-${absence.id}`,
      title: t("dashboard.absenceAdded", { name: getFullName(absence.stagiaire) }),
      time: absence.updated_at || absence.created_at || absence.date_absence,
      type: "absence",
    })),
    ...notes.map((note) => ({
      key: `note-${note.id}`,
      title: t("dashboard.noteAdded", { module: note.module?.nom_module || t("dashboard.unknownElement"), note: note.note ?? "-" }),
      time: note.updated_at || note.created_at,
      type: "note",
    })),
    ...groupStats.map((group) => ({
      key: `group-${group.id}`,
      title: t("dashboard.groupCreated", { name: group.nom_groupe }),
      time: group.updated_at || group.created_at,
      type: "group",
    })),
  ]
    .sort((a, b) => {
      const first = getSafeDate(a.time)?.getTime() || 0;
      const second = getSafeDate(b.time)?.getTime() || 0;
      return second - first;
    })
    .slice(0, 5)
    .map((item) => ({
      ...item,
      timeLabel: formatActivityTime(item.time),
    }));

  return (
    <div className={`dashboard-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="dashboard-sidebar">
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
            {!isSidebarCollapsed && <span className="sidebar-dot" />}
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
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="sidebar-collapse" onClick={toggleSidebar}>
            ‹
          </button>
        </div>
      </aside>

      <motion.main
        className="dashboard-content"
        initial={pageMotion.initial}
        animate={pageMotion.animate}
        transition={pageMotion.transition}
      >
        <header className="dashboard-header">
          <div>
            <h1>{t("dashboard.title")}</h1>
            <p>{t("dashboard.subtitle")}</p>
          </div>

          <div className="header-actions">
            <motion.button
              type="button"
              className="header-icon-btn settings-btn theme-toggle-btn"
              title={theme === "light" ? t("common.darkMode") : t("common.lightMode")}
              onClick={toggleTheme}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.96 }}
            >
              <Icon name="theme" />
            </motion.button>

            <div className="dashboard-control dashboard-language" ref={languageMenuRef}>
              <motion.button
                type="button"
                className={`header-icon-btn settings-btn language-menu-btn ${isLanguageMenuOpen ? "open" : ""}`}
                title={t("common.language")}
                onClick={() => {
                  setIsLanguageMenuOpen((prev) => !prev);
                }}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.96 }}
              >
                <Icon name="language" />
              </motion.button>

              {isLanguageMenuOpen && (
                <div className="dashboard-language-menu settings-menu">
                  {[
                    { value: "fr", label: t("common.french") },
                    { value: "en", label: t("common.english") },
                    { value: "ar", label: t("common.arabic") },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`dashboard-language-option ${language === option.value ? "active" : ""}`}
                      onClick={() => {
                        setLanguage(option.value);
                        setIsLanguageMenuOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="user-card">
              <div className="user-avatar">
                <Icon name="user" />
              </div>
              <div>
                <strong>{t("common.admin")}</strong>
                <span>{t("common.administrator")}</span>
              </div>
            </div>

            <motion.button type="button" className="header-icon-btn logout-btn" onClick={handleLogout} whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.96 }}>
              <Icon name="logout" />
            </motion.button>
          </div>
        </header>

        <motion.section className="stats-grid" variants={listMotion} initial="hidden" animate="visible">
          {statCards.map((card) => (
            <motion.article key={card.title} className="stat-card" variants={itemMotion} whileHover={{ y: -4, scale: 1.01 }}>
              <div className={`stat-icon ${card.tone}`}>
                <Icon name={card.icon} />
              </div>

              <div className={`stat-trend ${card.trendType}`}>{card.trend}</div>

              <strong>{card.value}</strong>
              <span>{card.title}</span>
            </motion.article>
          ))}
        </motion.section>

        <motion.section className="dashboard-panels" variants={listMotion} initial="hidden" animate="visible">
          <motion.article className="panel panel-large" variants={itemMotion} whileHover={{ y: -3 }}>
            <div className="panel-header">
              <h3>{t("dashboard.generalStats")}</h3>
            </div>
            <div className="panel-chart panel-chart-bar">
              <Bar data={chartData} options={options} />
            </div>
          </motion.article>

          <motion.article className="panel panel-side" variants={itemMotion} whileHover={{ y: -3 }}>
            <div className="panel-header">
              <h3>{t("dashboard.distribution")}</h3>
            </div>

            <div className="panel-chart panel-chart-donut">
              <Doughnut data={groupData} options={groupChartOptions} />
            </div>

            <div className="legend-list">
              {groupStats.map((group, index) => (
                <motion.button
                  key={group.id}
                  type="button"
                  className="legend-item"
                  onClick={() => navigate(`/stagiaires?groupe=${group.id}`)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    className="legend-color"
                    style={{
                      backgroundColor: ["#284c83", "#35b29c", "#f5a623", "#7f56d9", "#5b8def", "#10b981"][index % 6],
                    }}
                  />
                  <span className="legend-label">{group.nom_groupe}</span>
                  <span className="legend-value">{group.stagiaires_count || 0}</span>
                </motion.button>
              ))}
            </div>
          </motion.article>
        </motion.section>

        <motion.section className="dashboard-insights-grid" variants={listMotion} initial="hidden" animate="visible">
          <AlertsCard alerts={alerts} />
          <ActivityCard items={recentActivities} />
        </motion.section>

        <motion.section className="quick-nav" variants={listMotion} initial="hidden" animate="visible">
          <motion.button type="button" onClick={() => navigate("/stagiaires")} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {t("dashboard.viewStagiaires")}
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/groupes")} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {t("dashboard.viewGroupes")}
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/modules")} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {t("dashboard.viewModules")}
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/absences")} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {t("dashboard.viewAbsences")}
          </motion.button>
          <motion.button type="button" onClick={() => navigate("/notes")} variants={itemMotion} whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {t("dashboard.viewNotes")}
          </motion.button>
        </motion.section>
      </motion.main>
    </div>
  );
}

export default Dashboard;
