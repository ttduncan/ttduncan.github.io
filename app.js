const statusEl = document.getElementById("status");

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

  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(values => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (values[index] || "").trim();
    });
    return obj;
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

async function loadContent() {
  try {
    const response = await fetch("workouts.csv");
    if (!response.ok) throw new Error("Unable to load workouts.csv");

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (!rows.length) {
      throw new Error("No workouts found");
    }

    const page = document.body.dataset.page;

    if (page === "home") {
      const featured = rows.find(
        row => (row.featured || "").toLowerCase() === "true"
      );
      if (!featured) throw new Error("No featured workout found");

      const todayLabel = document.getElementById("todayLabel");
      todayLabel.textContent = new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric"
      }).toUpperCase();

      document
        .getElementById("workoutContainer")
        .appendChild(buildWorkoutCard(featured));
    } else {
      const container = document.getElementById("libraryContainer");
      const libraryItems = rows.filter(
        row => (row.featured || "").toLowerCase() !== "true"
      );

      libraryItems.forEach(workout => {
        const card = buildWorkoutCard(workout);
        card.classList.add("library-card");
        container.appendChild(card);
      });
    }

    if (statusEl) statusEl.textContent = "";
  } catch (error) {
    console.error(error);
    if (statusEl) statusEl.textContent = "Unable to load workout data.";
  }
}

loadContent();