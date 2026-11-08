const content = document.querySelector("main.content");
const navButtons = document.querySelectorAll(".nav-btn");
const updatedDate = document.getElementById("updatedDate");

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
      if (currentRow.some(value => value.trim() !== "")) rows.push(currentRow);
      currentRow = [];
      field = "";
    } else {
      field += ch;
    }
  }

  if (field.length || currentRow.length) {
    currentRow.push(field);
    if (currentRow.some(value => value.trim() !== "")) rows.push(currentRow);
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

function renderHero(eyebrow, title, subtitle) {
  const section = document.createElement("section");
  section.className = "page-hero";

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

function isTodayWorkout(workout) {
  return String(workout.Today || workout.today || "").trim() === "1";
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

  const list = document.createElement("div");
  list.className = "card-list";

  const workoutList = rows ? rows.filter(workout => !isTodayWorkout(workout)) : [fallbackWorkout];

  workoutList.forEach(workout => {
    const card = buildWorkoutCard(workout);
    card.classList.add("library-card");
    list.appendChild(card);
  });

  content.appendChild(list);
}

async function loadWorkouts() {
  try {
    const response = await fetch("workouts.csv");
    if (!response.ok) throw new Error("CSV load failed");

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (!rows.length) throw new Error("No workouts found");

    return rows;
  } catch (error) {
    console.warn("Using fallback workout:", error);
    return null;
  }
}

function currentView() {
  const params = new URLSearchParams(window.location.search);
  return params.get("view") === "library" ? "library" : "home";
}

function setActiveNav(view) {
  navButtons.forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
  });
}

async function renderView(view) {
  const rows = await loadWorkouts();

  setActiveNav(view);

  if (view === "library") {
    renderLibrary(rows);
  } else {
    renderHome(rows);
  }
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.pushState({}, "", url);
    renderView(view);
  });
});

window.addEventListener("popstate", () => {
  renderView(currentView());
});

if (updatedDate) {
  updatedDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

renderView(currentView());