const calendarMonth = document.getElementById("calendar-month");
const calendarGrid = document.querySelector(".calendar-grid");
const prevBtn = document.querySelector(".calendar-nav.prev");
const nextBtn = document.querySelector(".calendar-nav.next");
const moodBarContainer = document.getElementById("mood-bar-vertical");
const dateInfo = document.getElementById("date-info");
const currentMoodDisplay = document.getElementById("current-mood-display");
const moodLabel = document.getElementById("mood-label");
const moodOptions = document.getElementById("mood-options");
const deleteButton = document.getElementById("delete-entry");
const saveButton = document.getElementById("save-entry");
const noDateSelected = document.getElementById("no-date-selected");
const currentMoodSection = document.getElementById("current-mood");
const journalText = document.getElementById("journal-text");
const deleteMonthButton = document.getElementById("delete-month");
const monthJournalEntries = document.getElementById("month-journal-entries");
const currentMonthName = document.getElementById("current-month-name");
const donutCenter = document.getElementById("donut-center");
const donutLegend = document.getElementById("donut-legend");
const highsLowsContent = document.getElementById("highs-lows-content");
const highsContent = document.getElementById("highs-content");
const lowsContent = document.getElementById("lows-content");
const donutChart = document.querySelector(".donut-chart");

const moodEmojis = ["😄", "😐", "😢", "😡", "😴", "🤩", "😭"];
const moodLabels = {
  "😄": "Happy",
  "😐": "Neutral",
  "😢": "Sad",
  "😡": "Angry",
  "😴": "Sleepy",
  "🤩": "Excited",
  "😭": "Crying",
};
const moodColors = {
  "😄": "#c1ffbf",
  "😐": "#fff7bf",
  "😢": "#cfecff",
  "😡": "#ffbfbf",
  "😴": "#ffbdf1",
  "🤩": "#bdbfff",
  "😭": "#7dd3fc",
};
const moodValues = {
  "😄": 1,
  "😐": 0.5,
  "😢": -0.5,
  "😡": -1,
  "😴": 0.3,
  "🤩": 0.8,
  "😭": -0.8,
};

let moodData = JSON.parse(localStorage.getItem("moodData")) || {};
let journalData = JSON.parse(localStorage.getItem("journalData")) || {};
let currentDate = new Date();
let selectedDateKey = "";
let selectedMood = "";
let selectedCell = null;

// Initialize mood options
moodEmojis.forEach((mood) => {
  const option = document.createElement("div");
  option.className = "mood-option";
  option.textContent = mood;
  option.title = moodLabels[mood];
  option.onclick = () => {
    selectedMood = mood;
    currentMoodDisplay.textContent = mood;
    moodLabel.textContent = moodLabels[mood];
  };
  moodOptions.appendChild(option);
});

function isFutureDate(dateKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare just dates

  const dateParts = dateKey.split("-").map(Number);
  const cellDate = new Date(dateParts[0], dateParts[1], dateParts[2]);

  return cellDate > today;
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString("default", { month: "long" });

  calendarMonth.textContent = `${monthName} ${year}`;
  currentMonthName.textContent = `${monthName} ${year}`;

  const oldCells = Array.from(calendarGrid.children).slice(7);
  oldCells.forEach((cell) => cell.remove());

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  for (let d = 1; d <= totalDays; d++) {
    const key = `${year}-${month}-${d}`;
    const cell = document.createElement("div");
    cell.dataset.date = key;

    // Mark future dates
    if (isFutureDate(key)) {
      cell.classList.add("future-date");
    }

    const mood = moodData[key] || "";
    cell.innerHTML = `${d}<br>${mood}`;
    if (mood && moodColors[mood]) {
      cell.style.backgroundColor = moodColors[mood];
      cell.style.color = "white";
      cell.style.border = "2px solid white";
    }

    if (isCurrentMonth && d === today.getDate()) {
      cell.classList.add("today-cell");
    }

    cell.onclick = () => selectDate(key, cell);
    calendarGrid.appendChild(cell);
  }

  renderMoodBar();
  renderMonthJournalEntries();
  renderDonutChart();
  renderHighsAndLows();

  if (isCurrentMonth) {
    const todayKey = `${year}-${month}-${today.getDate()}`;
    const todayCell = document.querySelector(`[data-date="${todayKey}"]`);
    if (todayCell) {
      selectDate(todayKey, todayCell);
    }
  }

  if (selectedDateKey) {
    const [selectedYear, selectedMonth] = selectedDateKey
      .split("-")
      .map(Number);
    if (selectedYear === year && selectedMonth === month) {
      const selectedDay = selectedDateKey.split("-")[2];
      const cell = document.querySelector(
        `[data-date="${selectedYear}-${selectedMonth}-${selectedDay}"]`
      );
      if (cell) {
        cell.classList.add("selected-cell");
        selectedCell = cell;
      }
    }
  }
}

function renderMonthJournalEntries() {
  monthJournalEntries.innerHTML = "";

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  let hasEntries = false;

  const entries = [];
  for (let d = 1; d <= 31; d++) {
    const key = `${currentYear}-${currentMonth}-${d}`;
    if (journalData[key] && journalData[key].trim()) {
      entries.push({
        date: new Date(currentYear, currentMonth, d),
        text: journalData[key],
        mood: moodData[key] || "",
      });
      hasEntries = true;
    }
  }

  if (!hasEntries) {
    monthJournalEntries.innerHTML =
      '<div class="no-entries-message">No journal entries for this month yet</div>';
    return;
  }

  entries.sort((a, b) => b.date - a.date);

  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "journal-entry-card";

    const dateStr = entry.date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    card.innerHTML = `
          <div class="journal-entry-date">
            ${dateStr} 
            ${
              entry.mood
                ? `<span style="margin-left: 0.5rem;">${entry.mood}</span>`
                : ""
            }
          </div>
          <div class="journal-entry-text">${entry.text}</div>
        `;

    monthJournalEntries.appendChild(card);
  });
}

function renderDonutChart() {
  donutLegend.innerHTML = "";

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const moodCount = {};
  moodEmojis.forEach((mood) => {
    moodCount[mood] = 0;
  });

  Object.keys(moodData).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (year === currentYear && month === currentMonth) {
      const mood = moodData[key];
      if (moodEmojis.includes(mood)) {
        moodCount[mood]++;
      }
    }
  });

  const total = Object.values(moodCount).reduce((a, b) => a + b, 0);

  if (total === 0) {
    donutCenter.textContent = "No data";
    donutChart.style.background = "#f0f0f0";
    return;
  }

  donutCenter.textContent = `${total} days`;

  let conicGradientParts = [];
  let accumulatedPercent = 0;

  const activeMoods = moodEmojis
    .filter((mood) => moodCount[mood] > 0)
    .sort((a, b) => moodCount[b] - moodCount[a]);

  activeMoods.forEach((mood, index) => {
    const percent = (moodCount[mood] / total) * 100;
    const start = accumulatedPercent;
    const end = accumulatedPercent + percent;

    conicGradientParts.push(`${moodColors[mood]} ${start}% ${end}%`);
    accumulatedPercent = end;
  });

  donutChart.style.background = `conic-gradient(${conicGradientParts.join(
    ", "
  )})`;

  activeMoods.forEach((mood) => {
    const count = moodCount[mood];
    const percent = Math.round((count / total) * 100);

    const legendItem = document.createElement("div");
    legendItem.className = "legend-item";

    const colorBox = document.createElement("div");
    colorBox.className = "legend-color";
    colorBox.style.backgroundColor = moodColors[mood];

    const label = document.createTextNode(
      `${mood} ${moodLabels[mood]}: ${percent}% (${count})`
    );

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    donutLegend.appendChild(legendItem);
  });
}

function renderHighsAndLows() {
  highsContent.innerHTML = "";
  lowsContent.innerHTML = "";

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get all happy (😄) and crying (😭) days
  const happyDays = [];
  const cryingDays = [];

  for (let d = 1; d <= 31; d++) {
    const key = `${currentYear}-${currentMonth}-${d}`;
    if (moodData[key]) {
      const entry = {
        date: new Date(currentYear, currentMonth, d),
        mood: moodData[key],
        note: journalData[key] || "No notes for this day",
      };

      if (moodData[key] === "😄") {
        happyDays.push(entry);
      } else if (moodData[key] === "😭") {
        cryingDays.push(entry);
      }
    }
  }

  // Sort entries by date (newest first)
  happyDays.sort((a, b) => b.date - a.date);
  cryingDays.sort((a, b) => b.date - a.date);

  // Show happy days (highs)
  if (happyDays.length > 0) {
    highsContent.innerHTML = "";

    happyDays.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "high-low-card";

      const dateStr = entry.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      card.innerHTML = `
            <div class="high-low-date">${dateStr} ${entry.mood}</div>
            <div class="high-low-text">${entry.note}</div>
          `;

      highsContent.appendChild(card);
    });
  } else {
    highsContent.innerHTML =
      '<div class="no-entries-message">No happy days recorded this month</div>';
  }

  // Show crying days (lows)
  if (cryingDays.length > 0) {
    lowsContent.innerHTML = "";

    cryingDays.forEach((entry) => {
      const card = document.createElement("div");
      card.className = "high-low-card";

      const dateStr = entry.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      card.innerHTML = `
            <div class="high-low-date">${dateStr} ${entry.mood}</div>
            <div class="high-low-text">${entry.note}</div>
          `;

      lowsContent.appendChild(card);
    });
  } else {
    lowsContent.innerHTML =
      '<div class="no-entries-message">No difficult days recorded this month</div>';
  }
}

function selectDate(dateKey, cell) {
  // Prevent selection of future dates
  if (isFutureDate(dateKey)) {
    alert("You can only log data for today or past dates.");
    return;
  }

  if (selectedCell) {
    selectedCell.classList.remove("selected-cell");
  }

  cell.classList.add("selected-cell");
  selectedCell = cell;

  selectedDateKey = dateKey;
  const dateParts = dateKey.split("-");
  const displayDate = new Date(dateParts[0], dateParts[1], dateParts[2]);

  dateInfo.textContent = displayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  selectedMood = moodData[dateKey] || "";
  currentMoodDisplay.textContent = selectedMood || "-";
  moodLabel.textContent = selectedMood ? moodLabels[selectedMood] : "";

  journalText.value = journalData[dateKey] || "";

  noDateSelected.style.display = "none";
  currentMoodSection.style.display = "block";
  moodOptions.style.display = "flex";
  document.querySelector(".mood-actions").style.display = "flex";
  document.querySelector(".journal-section").style.display = "flex";
}

function saveEntry() {
  if (!selectedDateKey) return;

  // Prevent saving to future dates
  if (isFutureDate(selectedDateKey)) {
    alert("You can only save data for today or past dates.");
    return;
  }

  if (selectedMood) {
    moodData[selectedDateKey] = selectedMood;
  } else {
    delete moodData[selectedDateKey];
  }

  if (journalText.value.trim()) {
    journalData[selectedDateKey] = journalText.value.trim();
  } else {
    delete journalData[selectedDateKey];
  }

  localStorage.setItem("moodData", JSON.stringify(moodData));
  localStorage.setItem("journalData", JSON.stringify(journalData));

  renderCalendar(currentDate);

  const originalText = saveButton.textContent;
  saveButton.textContent = "Saved!";
  setTimeout(() => {
    saveButton.textContent = originalText;
  }, 1000);
}

function deleteEntry() {
  if (!selectedDateKey) return;

  // Prevent deleting from future dates (though they shouldn't have data anyway)
  if (isFutureDate(selectedDateKey)) {
    alert("Cannot delete data from future dates.");
    return;
  }

  if (moodData[selectedDateKey]) {
    delete moodData[selectedDateKey];
  }

  if (journalData[selectedDateKey]) {
    delete journalData[selectedDateKey];
  }

  localStorage.setItem("moodData", JSON.stringify(moodData));
  localStorage.setItem("journalData", JSON.stringify(journalData));

  renderCalendar(currentDate);

  currentMoodDisplay.textContent = "-";
  moodLabel.textContent = "";
  selectedMood = "";
  journalText.value = "";
}

function deleteMonthLogs() {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  if (
    !confirm(
      `Are you sure you want to delete all entries for ${monthName} ${currentYear}? This cannot be undone.`
    )
  ) {
    return;
  }

  let deletedCount = 0;

  Object.keys(moodData).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (year === currentYear && month === currentMonth) {
      delete moodData[key];
      deletedCount++;
    }
  });

  Object.keys(journalData).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (year === currentYear && month === currentMonth) {
      delete journalData[key];
    }
  });

  localStorage.setItem("moodData", JSON.stringify(moodData));
  localStorage.setItem("journalData", JSON.stringify(journalData));

  renderCalendar(currentDate);
  renderMoodBar();
  resetPanel();

  alert(`Deleted ${deletedCount} entries for ${monthName} ${currentYear}.`);
}

function renderMoodBar() {
  moodBarContainer.innerHTML = "";
  const moodCount = Array(moodEmojis.length).fill(0);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  Object.keys(moodData).forEach((key) => {
    const [year, month] = key.split("-").map(Number);
    if (year === currentYear && month === currentMonth) {
      const mood = moodData[key];
      const i = moodEmojis.indexOf(mood);
      if (i !== -1) moodCount[i]++;
    }
  });

  const total = moodCount.reduce((a, b) => a + b, 0);

  moodEmojis.forEach((emoji, i) => {
    const percent = total ? (moodCount[i] / total) * 100 : 0;

    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${percent * 2}px`;
    bar.style.backgroundColor = moodColors[emoji];

    const percentLabel = document.createElement("div");
    percentLabel.className = "bar-percent";
    percentLabel.textContent = `${Math.round(percent)}%`;

    const wrapper = document.createElement("div");
    wrapper.className = "bar-wrapper";
    wrapper.appendChild(percentLabel);
    wrapper.appendChild(bar);

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = emoji;
    label.title = moodLabels[emoji];
    wrapper.appendChild(label);

    moodBarContainer.appendChild(wrapper);
  });
}

prevBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
  resetPanel();
};

nextBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
  resetPanel();
};

deleteButton.onclick = deleteEntry;
saveButton.onclick = saveEntry;
deleteMonthButton.onclick = deleteMonthLogs;

function resetPanel() {
  selectedDateKey = "";
  selectedMood = "";
  dateInfo.textContent = "No date selected";
  currentMoodDisplay.textContent = "-";
  moodLabel.textContent = "";
  journalText.value = "";
  noDateSelected.style.display = "block";
  currentMoodSection.style.display = "none";
  moodOptions.style.display = "none";
  document.querySelector(".mood-actions").style.display = "none";
  document.querySelector(".journal-section").style.display = "none";

  if (selectedCell) {
    selectedCell.classList.remove("selected-cell");
    selectedCell = null;
  }
}

// Initialize the calendar and automatically select today's date
renderCalendar(currentDate);
