document.addEventListener("DOMContentLoaded", () => {
    loadEntries();  // Töltsünk be minden bejegyzést oldal betöltéskor
    document.getElementById("entryForm").addEventListener("submit", handleFormSubmit); // Figyeljük a submit eventet, majd ez alapján meghívjuk a megfelelő funkciót
});

let timeOfDayChart = null;
let editingIndex = null;
let showAll = false;
var dayFilter = document.getElementById("dayFilter");
var weekFilter = document.getElementById("weekFilter");
var monthFilter = document.getElementById("monthFilter");

// A megfelelő funkció meghívása
function handleFormSubmit(event) {
    event.preventDefault();
    if (editingIndex !== null) {
        saveEditedEntry();
    } else {
        addEntry();
    }
}

// Bejegyzés hozzáadása
function addEntry() {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const description = document.getElementById("description").value;
    const tag = document.getElementById("tag").value;

    const entry = { date, startTime, endTime, description, tag };
    const entries = JSON.parse(localStorage.getItem("entries")) || []; // Töltsük be az elemeket
    entries.push(entry); 
    localStorage.setItem("entries", JSON.stringify(entries)); // Adjuk hozzá

    document.getElementById("entryForm").reset();
    showToast("A munkaidő bejegyzés sikeresen hozzáadva.");
    loadEntries();
}


// Bejegyzések betöltése
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem("entries")) || [];
    const filteredEntries = entries.filter(entry => filterEntryBySelectedDate(entry)); // Betöltjük filter alapján az elemeket
    
    const entriesList = document.getElementById("entriesList");
    entriesList.innerHTML = "<h2 class=\"h4\">Bejegyzett időpontok</h2>";

    // Felépítjük a HTML-t és megjelenítjük az elemeket
    filteredEntries.forEach((entry, index) => {
        const entryItem = document.createElement("div");
        entryItem.classList.add("entry-item");

        entryItem.innerHTML = `
            <p><strong>Dátum:</strong> ${entry.date}</p>
            <p><strong>Kezdés:</strong> ${entry.startTime} - <strong>Befejezés:</strong> ${entry.endTime}</p>
            <p><strong>Leírás:</strong> ${entry.description}</p>
            <p><strong>Címke:</strong> ${entry.tag}</p>
            <button class="btn btn-warning" onclick="editEntry(${index})">Szerkesztés</button>
            <button class="btn btn-danger" onclick="deleteEntry(${index})">Törlés</button>
        `;

        entriesList.appendChild(entryItem);
    });

    // Statisztikai adatok frissítése
    updateStatistics(entries);
}

// Bejegyzés törlése
function deleteEntry(index) {
    resetForm(); // Hogy ha rámentünk a szerkesztésre és utánna törlünk ürítsük a formot
    const entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries.splice(index, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    showToast("A munkaidő bejegyzés sikeresen törölve.");
    loadEntries();
}

// Bejegyzés szerkesztése
function editEntry(index) {
    const entries = JSON.parse(localStorage.getItem("entries")) || [];
    const entry = entries[index];

    document.getElementById("date").value = entry.date;
    document.getElementById("startTime").value = entry.startTime;
    document.getElementById("endTime").value = entry.endTime;
    document.getElementById("description").value = entry.description;
    document.getElementById("tag").value = entry.tag;

    editingIndex = index;
    document.getElementById("saveButton").textContent = "Mentés módosítás";
    document.getElementById("cancelEditButton").style.display = "inline";
}

// Szerkesztése kiválasztott bejegyzés mentése
function saveEditedEntry() {
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const description = document.getElementById("description").value;
    const tag = document.getElementById("tag").value;

    const entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries[editingIndex] = { date, startTime, endTime, description, tag };
    localStorage.setItem("entries", JSON.stringify(entries));

    resetForm();
    loadEntries();
    showToast("A munkaidő bejegyzés sikeresen módosítva.");
}

// Bejegyzés hozzáadás/szerkesztés form resetelése
function resetForm() {
    document.getElementById("entryForm").reset();
    editingIndex = null;
    document.getElementById("saveButton").textContent = "Mentés";
    document.getElementById("cancelEditButton").style.display = "none";
}

// A három szűrő
function applyDayFilter() {
    showAll = false; // Szűrés visszakapcsolása
    if (dayFilter !== "") {
        weekFilter.value = "";
        monthFilter.value = "";
    }
    // Újra töltjük az elemeket a szűrés alapján
    loadEntries();
}

function applyWeekFilter() {
    showAll = false;
    if (weekFilter !== "") {
        dayFilter.value = "";
        monthFilter.value = "";
    }
    loadEntries();
}

function applyMonthFilter() {
    showAll = false;
    if (monthFilter !== "") {
        dayFilter.value = "";
        weekFilter.value = "";
    }
    loadEntries();
}

function showAllEntries() {
    showAll = true; // Összes bejegyzés mutatása
    // Ebben az esetben az összes fenti szűrőt reseteljük
    document.getElementById("dayFilter").value = "";
    document.getElementById("weekFilter").value = "";
    document.getElementById("monthFilter").value = "";
    loadEntries();
}

// Szűrés a megadott feltételek alapján
function filterEntryBySelectedDate(entry) {
    if (showAll) return true; // Ha az "Összes bejegyzés" gombot megnyomták, ne szűrjön

    const dayFilter = document.getElementById("dayFilter").value;
    const weekFilter = document.getElementById("weekFilter").value;
    const monthFilter = document.getElementById("monthFilter").value;

    const entryDate = new Date(entry.date);

    if (dayFilter) {
        return entryDate.toISOString().split("T")[0] === dayFilter;
    }

    if (weekFilter) {
        const selectedDate = new Date(weekFilter);
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return entryDate >= weekStart && entryDate <= weekEnd;
    }

    if (monthFilter) {
        const selectedMonth = new Date(monthFilter);
        return (
            entryDate.getFullYear() === selectedMonth.getFullYear() &&
            entryDate.getMonth() === selectedMonth.getMonth()
        );
    }

    return true;
}

// Szerkesztés mégse
function cancelEdit() {
    // Kiürítjük az űrlapot
    document.getElementById('entryForm').reset();
    
    // Visszaállítjuk a gomb feliratát, ha szerkesztés volt folyamatban
    document.getElementById('saveButton').innerText = 'Mentés';
    
    // Elrejtjük a mégse gombot
    document.getElementById('cancelEditButton').style.display = 'none';
    
    // Töröljük az aktuális szerkesztési azonosítót
    currentEditId = null;
}

// Funkció a toast értesítés megjelenítéséhez
function showToast(message, title = "Sikeres művelet") {
    const toast = new bootstrap.Toast(document.getElementById("toast"), {
        delay: 5000 // 5 másodpercig jelenjen meg
    });
    const toastMessage = document.getElementById("toastMessage");
    const toastTitle = document.getElementById("toastTitle");

    // Beállítjuk az üzenetet és a címet
    toastMessage.textContent = message;
    toastTitle.textContent = title;

    // Megjelenítjük a toast értesítést
    toast.show();
}

function getHourFromTime(timeString) {
    // Az időt "óra:perc" formátumból szétszedjük
    const [hour, minute] = timeString.split(':').map(Number);
    return hour; // Visszaadjuk az órát számként
}

// Frissíti a statisztikákat
function updateStatistics(entries) {
    const daysWithEntries = new Set();
    const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0 };

    entries.forEach(entry => {
        const date = new Date(entry.date);
        const day = date.toLocaleDateString();

        daysWithEntries.add(day);

        // Mikor történik a legtöbb bejegyzés? (reggel, délután, este)
        const hours = getHourFromTime(entry.startTime);
        if (hours >= 6 && hours < 12) {
            timeOfDayCounts.morning++;
        } else if (hours >= 12 && hours < 18) {
            timeOfDayCounts.afternoon++;
        } else {
            timeOfDayCounts.evening++;
        }
    });

    // Kiírjuk hány napon van bejegyzés
    document.getElementById("totalDays").textContent = daysWithEntries.size;

    // Kördiagram frissítése
    updateChart(timeOfDayCounts);
}

// Kördiagram frissítése
function updateChart(timeOfDayCounts) {
    const ctx = document.getElementById('timeOfDayChart').getContext('2d');

    // Kördiagram törlése
    if (timeOfDayChart) {
        timeOfDayChart.destroy();
    }

    // Új kördiagram létrehozása
    timeOfDayChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Reggel', 'Délután', 'Este'],
            datasets: [{
                data: [timeOfDayCounts.morning, timeOfDayCounts.afternoon, timeOfDayCounts.evening],
                backgroundColor: ['#ff9999', '#66b3ff', '#99ff99'],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
}