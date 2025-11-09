// 15-minute resolution config
export const MINUTES_PER_COLUMN = 15;            // change here if you want 30, 60, etc.
export const COLS_PER_DAY = (24 * 60) / MINUTES_PER_COLUMN;
export const TIME_WIDTH = 72 / (60 / MINUTES_PER_COLUMN); // same idea as your grid

// Day lists + mapping
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAY_TO_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export const DaysList = [
  { label: "Sunday", value: "sun" },
  { label: "Monday", value: "mon" },
  { label: "Tuesday", value: "tue" },
  { label: "Wednesday", value: "wed" },
  { label: "Thursday", value: "thu" },
  { label: "Friday", value: "fri" },
  { label: "Saturday", value: "sat" },
];

// Small helpers
export const pad2 = (n) => String(n).padStart(2, "0");

export const minToHHMM = (mins = 0) => {
  const m = Number.isFinite(mins) ? mins : 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
};

// snap to step (default 15) -> minutes since midnight
export const hhmmToMin = (hhmm, step = MINUTES_PER_COLUMN) => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  const raw = h * 60 + m;
  return Math.round(raw / step) * step;
};

// For "Monday", "Tuesday", ... (used in popover)
const DAY_PREFIXES = {
  mon: "mon",
  tue: "tues",
  wed: "wednes",
  thu: "thurs",
  fri: "fri",
  sat: "satur",
  sun: "sun",
};

export const formatLongDay = (shortCode) => {
  const key = (shortCode || "").toLowerCase();
  const actualDay = DAY_PREFIXES[key] ?? key;
  if (!actualDay) return "";
  return actualDay.charAt(0).toUpperCase() + actualDay.slice(1) + "day";
};
