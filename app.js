const statusEl = document.getElementById("status");
const updatedDate = document.getElementById("updatedDate");
const content = document.querySelector("main.page, main.content");
const navigationLinks = document.querySelectorAll(".nav-btn, .nav a");

const fallbackWorkout = {
  title: "5/10/15",
  category: "Standard",
  duration: "1 round",
  equipment: "Pull-up bar",
  summary: "Complete 5 Pull Ups, 10 Squats, and 15 Push Ups.",
  exercises: "5 Pull Ups|10 Squats|15 Push Ups",
  Today: "1"
};

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (ch === '"' && inQuotes && text[i + 1] === '"') {
      field += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      currentRow.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      currentRow.push(field);
      if (currentRow.some(value => value.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length || currentRow.length) {
    currentRow.push(field);
    if (currentRow.some(value => value.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim()
  );

  return rows.slice(1).map(values => {
    const workout = {};
    headers.forEach((header, index) => {
      workout[header] = (values[index] || "").trim();
    });
    return workout;
  });
}

function buildWorkoutCard(workout) {
  const card = document.createElement("article");
  card.className = "workout-card";

  const meta = document.createElement("div");
  meta.className = "meta-row";

  const pill = document.createElement("span");
  pill.className = "pill";
  pill.textContent = workout.category || "Workout";

  const duration = document.createElement("span");
  duration.className = "duration";
  duration.textContent = workout.duration || "25 min";

  meta.append(pill, duration);

  const title = document.createElement("h2");
  title.textContent = workout.title || "Workout";

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = workout.summary || "Daily movement session.";

  const equipment = document.createElement("p");
  equipment.className = "equipment";
  equipment.textContent = `Equipment: ${workout.equipment || "Bodyweight"}`;

  const label = document.createElement("div");
  label.className = "section-label";
  label.textContent = "Exercises";

  const list = document.createElement("ol");
  const exercises = (workout.exercises || "")
    .split("|")
    .map(item => item.trim())
    .filter(Boolean);

  exercises.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });

  card.append(meta, title, summary, equipment, label, list);
  return card;
}

function setUpdatedDate() {
  if (!updatedDate) return;
  updatedDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function isTodayWorkout(workout) {
  return String(workout.Today || workout.today || "").trim() === "1";
}

function renderHero(eyebrow, title, subtitle) {
  const section = document.createElement("section");
  section.className = "hero";

  const eyebrowEl = document.createElement("p");
  eyebrowEl.className = "eyebrow";
  eyebrowEl.textContent = eyebrow;

  const h1 = document.createElement("h1");
  h1.textContent = title;

  const subtitleEl = document.createElement("p");
  subtitleEl.className = "subtitle";
  subtitleEl.textContent = subtitle;

  section.append(eyebrowEl, h1, subtitleEl);
  return section;
}

function renderHome(rows) {
  if (!content) return;

  content.replaceChildren();

  const hero = renderHero(
    new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).toUpperCase(),
    "Workout of the Day",
    "Small effort, steady progress."
  );

  content.appendChild(hero);

  const todayWorkout = rows ? rows.find(isTodayWorkout) || fallbackWorkout : fallbackWorkout;
  content.appendChild(buildWorkoutCard(todayWorkout));
}

function renderLibrary(rows) {
  if (!content) return;

  content.replaceChildren();

  const hero = renderHero(
    "Workout Library",
    "Pick your vibe.",
    "Choose a session that matches your energy."
  );
  content.appendChild(hero);

  const list = document.createElement("section");
  list.className = "card-list";

  const libraryWorkouts = rows
    ? rows.filter(workout => !isTodayWorkout(workout))
    : [fallbackWorkout];

  libraryWorkouts.forEach(workout => {
    const card = buildWorkoutCard(workout);
    card.classList.add("library-card");
    list.appendChild(card);
  });

  content.appendChild(list);
}

function getCurrentView() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  return requested === "library" ? "library" : "home";
}

function setActiveNav(view) {
  navigationLinks.forEach(link => {
    const active = (link.dataset.view || link.getAttribute("href") || "").includes(view);
    link.classList.toggle("active", active);
    if (link.tagName === "A") {
      link.setAttribute("aria-current", active ? "page" : "false");
    }
  });
}

async function loadWorkouts() {
  try {
    const response = await fetch("workouts.csv");
    if (!response.ok) throw new Error(`CSV load failed: ${response.status}`);

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (!rows.length) throw new Error("No CSV rows found");

    return rows;
  } catch (error) {
    console.warn("Using fallback workout:", error);
    return null;
  }
}

async function renderView(view) {
  const rows = await loadWorkouts();

  setActiveNav(view);

  if (view === "library") {
    renderLibrary(rows);
  } else {
    renderHome(rows);
  }

  if (statusEl) {
    statusEl.textContent = rows ? "" : "Showing the standard 5/10/15 workout.";
  }
}

navigationLinks.forEach(link => {
  link.addEventListener("click", event => {
    const view = link.dataset.view || (link.getAttribute("href") || "").includes("workouts") ? "library" : "home";

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("view", view);
    window.history.pushState({}, "", newUrl);
    event.preventDefault();
    renderView(view);
  });
});

window.addEventListener("popstate", () => {
  renderView(getCurrentView());
});

setUpdatedDate();
renderView(getCurrentView());