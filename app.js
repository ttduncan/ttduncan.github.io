const appView = document.getElementById("appView");
const navButtons = document.querySelectorAll(".nav-btn");
const updatedDate = document.getElementById("updatedDate");

let workoutsPromise;

const fallbackWorkout = {
  title: "Everyday Workout",
  category: "Standard",
  duration: "Any day",
  equipment: "Bodyweight",
  summary: "The default workout shown when no matching weekday is scheduled.",
  exercises: "5 Pull Ups|10 Squats|15 Push Ups",
  Day: "0"
};

function getDayNumber(date = new Date()) {
  const jsDay = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  return jsDay === 0 ? 7 : jsDay; // Monday=1 ... Sunday=7
}

function getViewFromQuery() {
  return new URLSearchParams(window.location.search).get("view") === "library"
    ? "library"
    : "home";
}

function setUpdatedDate() {
  if (!updatedDate) return;

  updatedDate.textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"' && inQuotes && text[i + 1] === '"') {
      field += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);

      if (row.some(value => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some(value => value.trim() !== "")) rows.push(row);
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map(header => header.trim());

  return rows.slice(1).map(values => {
    const workout = {};
    headers.forEach((header, index) => {
      workout[header] = (values[index] || "").trim();
    });
    return workout;
  });
}

function loadWorkouts() {
  if (!workoutsPromise) {
    workoutsPromise = fetch("workouts.csv")
      .then(response => {
        if (!response.ok) throw new Error("Unable to load workouts.csv");
        return response.text();
      })
      .then(parseCSV)
      .then(workouts => {
        if (!workouts.length) throw new Error("No workouts found in workouts.csv");
        return workouts;
      })
      .catch(error => {
        console.warn("Using fallback workout:", error);
        return [fallbackWorkout];
      });
  }

  return workoutsPromise;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function buildWorkoutCard(workout) {
  const card = createElement("article", "workout-card");

  const meta = createElement("div", "meta-row");
  meta.append(
    createElement("span", "pill", workout.category || "Workout"),
    createElement("span", "duration", workout.duration || "25 min")
  );

  const title = createElement("h2", "", workout.title || "Workout");
  const summary = createElement(
    "p",
    "summary",
    workout.summary || "Workout."
  );
  const equipment = createElement(
    "p",
    "equipment",
    `Equipment: ${workout.equipment || "Bodyweight"}`
  );

  const label = createElement("div", "section-label", "Exercises");
  const list = document.createElement("ol");

  (workout.exercises || "")
    .split("|")
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(exercise => {
      list.appendChild(createElement("li", "", exercise));
    });

  card.append(meta, title, summary, equipment, label, list);
  return card;
}

function buildHero(eyebrow, title, subtitle) {
  const hero = createElement("section", "page-hero");
  hero.append(
    createElement("p", "eyebrow", eyebrow),
    createElement("h1", "", title),
    createElement("p", "subtitle", subtitle)
  );
  return hero;
}

function getTodayWorkout(rows) {
  if (!rows || !rows.length) return fallbackWorkout;

  const todayNumber = String(getDayNumber());

  const matching = rows.find(
    row => String(row.Day ?? row.day ?? "").trim() === todayNumber
  );

  if (matching) return matching;

  const everyday = rows.find(
    row => String(row.Day ?? row.day ?? "").trim() === "0"
  );

  if (everyday) return everyday;

  return fallbackWorkout;
}

function renderHome(workouts) {
  const selected = getTodayWorkout(workouts);

  appView.replaceChildren();

  appView.appendChild(
    buildHero(
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      }).toUpperCase(),
      "Workout of the Day",
      selected.Day === "0" ? "Everyday Workout" : "Deliberate Reps, No Kipping"
    )
  );

  appView.appendChild(buildWorkoutCard(selected));
}

function renderLibrary(workouts) {
  const list = workouts || [fallbackWorkout];

  appView.replaceChildren();
  appView.appendChild(
    buildHero(
      "Workout Library",
      "Full list of workouts",
      "Adjust for fatigue and daily focus."
    )
  );

  const cardList = createElement("div", "card-list");

  list.forEach(workout => {
    const card = buildWorkoutCard(workout);
    card.classList.add("library-card");
    cardList.appendChild(card);
  });

  appView.appendChild(cardList);
}

function setActiveView(view) {
  navButtons.forEach(button => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

async function renderView(view) {
  setActiveView(view);

  try {
    const workouts = await loadWorkouts();

    if (view === "library") {
      renderLibrary(workouts);
    } else {
      renderHome(workouts);
    }
  } catch (error) {
    console.error(error);
    appView.replaceChildren(
      buildHero(
        "Loading error",
        "Unable to load workouts",
        "Check that workouts.csv is in the same folder as index.html."
      )
    );
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
  renderView(getViewFromQuery());
});

setUpdatedDate();
renderView(getViewFromQuery());