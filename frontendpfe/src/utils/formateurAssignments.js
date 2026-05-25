const MODULES_LOCAL_STORAGE_KEY = "modulesDataLocal";
const MODULE_FORMATEUR_STORAGE_KEY = "moduleFormateurs";

export function normalizePersonName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function readJsonStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
}

function toNumericId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getFormateurLocalAssignmentContext(userName) {
  const normalizedUserName = normalizePersonName(userName);

  if (!normalizedUserName) {
    return {
      hasAssignments: false,
      modules: [],
      groupSummaries: [],
      stats: { modules: 0, stagiaires: 0, notes: 0, absences: 0 },
      queryParams: {},
      queryKey: "",
    };
  }

  const savedModules = readJsonStorage(MODULES_LOCAL_STORAGE_KEY, []);
  const savedFormateurs = readJsonStorage(MODULE_FORMATEUR_STORAGE_KEY, {});

  const matchedModules = (Array.isArray(savedModules) ? savedModules : []).filter((moduleItem) => {
    const trainerName = savedFormateurs?.[moduleItem?.id] ?? moduleItem?.trainer ?? "";
    return normalizePersonName(trainerName) === normalizedUserName;
  });

  const numericModuleIds = matchedModules
    .map((moduleItem) => toNumericId(moduleItem?.id))
    .filter((value) => value !== null);

  const groupsMap = new Map();

  matchedModules.forEach((moduleItem) => {
    const rawGroupId = moduleItem?.groupId ?? moduleItem?.groupe_id ?? moduleItem?.group_id;
    const groupId = rawGroupId ? String(rawGroupId) : moduleItem?.groupCode ?? moduleItem?.groupe ?? `group-${groupsMap.size + 1}`;

    if (!groupsMap.has(groupId)) {
      groupsMap.set(groupId, {
        id: groupId,
        code: moduleItem?.groupCode ?? moduleItem?.groupe ?? moduleItem?.nom_groupe ?? "Sans groupe",
        filiere: moduleItem?.filiere ?? "Non definie",
        stagiairesCount: Number(moduleItem?.studentsCount ?? moduleItem?.stagiaires_count ?? 0) || 0,
      });
    }
  });

  const groupSummaries = Array.from(groupsMap.values());
  const numericGroupIds = groupSummaries
    .map((groupItem) => toNumericId(groupItem.id))
    .filter((value) => value !== null);

  return {
    hasAssignments: matchedModules.length > 0,
    modules: matchedModules,
    groupSummaries,
    stats: {
      modules: matchedModules.length,
      stagiaires: groupSummaries.reduce((total, groupItem) => total + (Number(groupItem.stagiairesCount) || 0), 0),
      notes: 0,
      absences: 0,
    },
    queryParams: {
      ...(numericModuleIds.length ? { module_ids: numericModuleIds } : {}),
      ...(numericGroupIds.length ? { group_ids: numericGroupIds } : {}),
    },
    queryKey: JSON.stringify({
      module_ids: numericModuleIds,
      group_ids: numericGroupIds,
    }),
  };
}
