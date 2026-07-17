function compareText(left, right) {
  const a = String(left);
  const b = String(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

function cleanId(value) {
  return String(value ?? "").trim();
}

function sortedUnique(values = []) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean))].sort(compareText);
}

function learningMapError(message) {
  return new Error(`Learning map: ${message}`);
}

function publicStation(node) {
  return (node.visibility || "public") === "public";
}

/**
 * Derive the compact learning-line payload from the normalized knowledge graph.
 * Learning sequence is editorial: station order within each line is preserved,
 * while line, station, alias, and membership collections use stable IDs for a
 * deterministic serialized result.
 */
export function buildLearningMap(graph = {}) {
  const graphNodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const graphPaths = Array.isArray(graph.paths) ? graph.paths : [];
  const nodesById = new Map();

  for (const node of graphNodes) {
    const id = cleanId(node?.id);
    if (!id) throw learningMapError("a station is missing its stable node ID");
    if (nodesById.has(id)) throw learningMapError(`duplicate station ID '${id}'`);
    nodesById.set(id, node);
  }

  const lineIds = new Set();
  const validatedLines = graphPaths.map((path) => {
    const id = cleanId(path?.id);
    if (!id) throw learningMapError("a learning line is missing its stable line ID");
    if (lineIds.has(id)) throw learningMapError(`duplicate learning line ID '${id}'`);
    lineIds.add(id);

    const nodeIds = (Array.isArray(path.nodeIds) ? path.nodeIds : []).map(cleanId);
    if (nodeIds.length < 2) {
      throw learningMapError(`learning line '${id}' must contain at least 2 stations`);
    }

    const stationsInLine = new Set();
    for (const stationId of nodeIds) {
      if (!stationId) {
        throw learningMapError(`learning line '${id}' contains a station without a stable node ID`);
      }
      if (stationsInLine.has(stationId)) {
        throw learningMapError(`learning line '${id}' contains duplicate station '${stationId}'`);
      }
      stationsInLine.add(stationId);

      const station = nodesById.get(stationId);
      if (!station) {
        throw learningMapError(`learning line '${id}' references missing station '${stationId}'`);
      }
      if (!publicStation(station)) {
        throw learningMapError(`learning line '${id}' references non-public station '${stationId}' (${station.visibility})`);
      }
    }

    return {
      id,
      order: Number.isInteger(path?.order) && path.order >= 0 ? path.order : null,
      title: String(path.title || id),
      description: String(path.description || ""),
      nodeIds
    };
  }).sort((a, b) => {
    if (a.order !== null && b.order !== null) return a.order - b.order || compareText(a.id, b.id);
    if (a.order !== null) return -1;
    if (b.order !== null) return 1;
    return compareText(a.id, b.id);
  });

  const memberships = [];
  const membershipsByStation = new Map();
  for (const line of validatedLines) {
    line.nodeIds.forEach((stationId, index) => {
      const membership = {
        lineId: line.id,
        stationId,
        index,
        step: index + 1,
        total: line.nodeIds.length
      };
      memberships.push(membership);
      if (!membershipsByStation.has(stationId)) membershipsByStation.set(stationId, []);
      membershipsByStation.get(stationId).push(membership);
    });
  }

  const stationIds = [...membershipsByStation.keys()].sort(compareText);
  const stations = stationIds.map((id) => {
    const node = nodesById.get(id);
    return {
      id,
      title: String(node.title || id),
      url: String(node.url || ""),
      category: String(node.category || ""),
      summary: String(node.summary || ""),
      aliases: sortedUnique(node.aliases),
      status: String(node.status || "")
    };
  });

  const lines = validatedLines.map((line) => ({
    ...line,
    stationCount: line.nodeIds.length,
    transferStations: line.nodeIds.filter((id) => membershipsByStation.get(id).length > 1).length
  }));
  const transferMembershipCounts = stationIds
    .map((id) => membershipsByStation.get(id).length)
    .filter((count) => count > 1);

  return {
    schemaVersion: graph.schemaVersion || null,
    contentVersion: graph.contentVersion || null,
    lines,
    stations,
    memberships,
    stats: {
      lines: lines.length,
      stations: stations.length,
      stationOccurrences: memberships.length,
      transferStations: transferMembershipCounts.length,
      maxLineMemberships: transferMembershipCounts.length
        ? Math.max(...transferMembershipCounts)
        : stations.length ? 1 : 0
    }
  };
}

/**
 * Create lookup tables shared by the browser renderer and URL-state resolver.
 */
export function createLearningMapIndex(payload = {}) {
  const lineList = Array.isArray(payload.lines) ? payload.lines : [];
  const stationList = Array.isArray(payload.stations) ? payload.stations : [];
  const membershipList = Array.isArray(payload.memberships) ? payload.memberships : [];
  const lines = new Map();
  const stations = new Map();

  for (const line of lineList) {
    const id = cleanId(line?.id);
    if (!id) throw learningMapError("payload contains a line without an ID");
    if (lines.has(id)) throw learningMapError(`payload contains duplicate line '${id}'`);
    lines.set(id, line);
  }
  for (const station of stationList) {
    const id = cleanId(station?.id);
    if (!id) throw learningMapError("payload contains a station without an ID");
    if (stations.has(id)) throw learningMapError(`payload contains duplicate station '${id}'`);
    stations.set(id, station);
  }

  for (const [lineId, line] of lines) {
    const nodeIds = Array.isArray(line?.nodeIds) ? line.nodeIds.map(cleanId) : [];
    if (nodeIds.length < 2) throw learningMapError(`payload line '${lineId}' must contain at least 2 stations`);
    const seenStations = new Set();
    for (const stationId of nodeIds) {
      if (!stations.has(stationId)) throw learningMapError(`payload line '${lineId}' references missing station '${stationId}'`);
      if (seenStations.has(stationId)) throw learningMapError(`payload line '${lineId}' contains duplicate station '${stationId}'`);
      seenStations.add(stationId);
    }
  }

  const membershipsByStation = new Map([...stations.keys()].map((id) => [id, []]));
  const membershipsByLine = new Map([...lines.keys()].map((id) => [id, []]));
  const membershipKeys = new Set();
  for (const membership of membershipList) {
    const lineId = cleanId(membership?.lineId);
    const stationId = cleanId(membership?.stationId);
    if (!lines.has(lineId)) throw learningMapError(`membership references missing line '${lineId}'`);
    if (!stations.has(stationId)) throw learningMapError(`membership references missing station '${stationId}'`);
    const membershipKey = `${lineId}\u0000${stationId}`;
    if (membershipKeys.has(membershipKey)) throw learningMapError(`duplicate membership for line '${lineId}' and station '${stationId}'`);
    membershipKeys.add(membershipKey);
    const position = Number(membership?.index);
    const lineStations = lines.get(lineId).nodeIds;
    if (!Number.isInteger(position) || position < 0 || cleanId(lineStations[position]) !== stationId) {
      throw learningMapError(`membership for line '${lineId}' and station '${stationId}' has an invalid index`);
    }
    if (Number(membership?.step) !== position + 1 || Number(membership?.total) !== lineStations.length) {
      throw learningMapError(`membership for line '${lineId}' and station '${stationId}' has inconsistent step metadata`);
    }
    membershipsByStation.get(stationId).push(membership);
    membershipsByLine.get(lineId).push(membership);
  }

  for (const [lineId, memberships] of membershipsByLine) {
    if (memberships.length !== lines.get(lineId).nodeIds.length) {
      throw learningMapError(`payload line '${lineId}' has incomplete memberships`);
    }
  }
  for (const [stationId, memberships] of membershipsByStation) {
    if (!memberships.length) throw learningMapError(`payload station '${stationId}' is not assigned to a line`);
  }

  const lineOrder = [...lines.keys()];
  const lineRank = new Map(lineOrder.map((id, position) => [id, position]));
  for (const values of membershipsByStation.values()) {
    values.sort((a, b) => (lineRank.get(a.lineId) ?? Number.MAX_SAFE_INTEGER)
      - (lineRank.get(b.lineId) ?? Number.MAX_SAFE_INTEGER)
      || Number(a.index) - Number(b.index));
  }
  for (const values of membershipsByLine.values()) {
    values.sort((a, b) => Number(a.index) - Number(b.index) || compareText(a.stationId, b.stationId));
  }

  const stationOrder = [...stations.keys()].sort(compareText);
  const defaultLineId = lineOrder[0] || null;
  const defaultStationId = defaultLineId
    ? cleanId(lines.get(defaultLineId)?.nodeIds?.[0]) || membershipsByLine.get(defaultLineId)?.[0]?.stationId || null
    : null;

  return {
    payload,
    lines,
    stations,
    lineOrder,
    stationOrder,
    membershipsByStation,
    membershipsByLine,
    defaultLineId,
    defaultStationId
  };
}

function firstStationOnLine(index, lineId) {
  const fromLine = cleanId(index.lines.get(lineId)?.nodeIds?.[0]);
  return fromLine || index.membershipsByLine.get(lineId)?.[0]?.stationId || null;
}

function firstLineForStation(index, stationId) {
  return index.membershipsByStation.get(stationId)?.[0]?.lineId || null;
}

/**
 * Normalize a linkable learning-map selection. A valid station is the more
 * specific intent, so it wins when a valid line and station do not match.
 */
export function normalizeLearningMapState(index, state = {}) {
  const requestedLine = cleanId(state.line);
  const requestedStation = cleanId(state.station);
  const hasRequestedLine = Boolean(requestedLine);
  const hasRequestedStation = Boolean(requestedStation);
  const lineIsValid = index.lines.has(requestedLine);
  const stationIsValid = index.stations.has(requestedStation);

  if (lineIsValid && stationIsValid) {
    const membership = index.membershipsByStation.get(requestedStation) || [];
    if (membership.some((item) => item.lineId === requestedLine)) {
      return { line: requestedLine, station: requestedStation, corrected: false, reason: "exact" };
    }
    const inferredLine = firstLineForStation(index, requestedStation);
    if (inferredLine) {
      return {
        line: inferredLine,
        station: requestedStation,
        corrected: true,
        reason: "line-station-mismatch"
      };
    }
  }

  if (stationIsValid) {
    const inferredLine = firstLineForStation(index, requestedStation);
    if (inferredLine) {
      return {
        line: inferredLine,
        station: requestedStation,
        corrected: true,
        reason: hasRequestedLine ? "invalid-line" : "station-only"
      };
    }
  }

  if (lineIsValid) {
    return {
      line: requestedLine,
      station: firstStationOnLine(index, requestedLine),
      corrected: true,
      reason: hasRequestedStation ? "invalid-station" : "line-only"
    };
  }

  if (!index.defaultLineId) {
    return { line: null, station: null, corrected: true, reason: "empty-map" };
  }

  let reason = "default";
  if (hasRequestedLine && hasRequestedStation) reason = "invalid-state";
  else if (hasRequestedLine) reason = "invalid-line";
  else if (hasRequestedStation) reason = "invalid-station";
  return {
    line: index.defaultLineId,
    station: index.defaultStationId,
    corrected: true,
    reason
  };
}
