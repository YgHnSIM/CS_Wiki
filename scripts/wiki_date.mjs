const PROJECT_TIME_ZONE = "Asia/Seoul";

export function runDate(now = new Date()) {
  if (process.env.WIKI_TODAY) return process.env.WIKI_TODAY;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
}
