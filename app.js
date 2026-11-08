const appView = document.getElementById("appView");
const navButtons = document.querySelectorAll(".nav-btn");
const updatedDate = document.getElementById("updatedDate");

let workoutsPromise;

function getViewFromQuery() {
  const view = new URLSearchParams(window.location.search).get("view");
  return view === "library" ? "library" : "home";
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

// Cache the fetch so switching views does not fetch the CSV again.
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
        workoutsPromise = null; // Allow a retry if loading failed.
        throw error;
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
    workout.summary || "Daily movement session."
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

function renderHome(workouts) {
  const featured = workouts.find(
    workout => (workout.featured || "").toLowerCase() === "true"
  );

  appView.replaceChildren();

  appView.appendChild(
    buildHero(
      new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      }).toUpperCase(),
      "Workout of the Day",
      "Small effort, steady progress."
    )
  );

  if (featured) {
    appView.appendChild(buildWorkoutCard(featured));
  } else {
    appView.appendChild(
      createElement("p", "subtitle", "No featured workout is marked in workouts.csv.")
    );
  }
}

function renderLibrary(workouts) {
  const libraryWorkouts = workouts.filter(
    workout => (workout.featured || "").toLowerCase() !== "true"
  );

  appView.replaceChildren();
  appView.appendChild(
    buildHero(
      "Workout Library",
      "Pick your vibe.",
      "Choose a session that matches your energy."
    )
  );

  const cardList = createElement("div", "card-list");

  libraryWorkouts.forEach(workout => {
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
        "Check that workouts.csv is in the same folder as index.html, then try again."
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