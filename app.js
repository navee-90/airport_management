// Airport Management Dashboard JavaScript
const STORAGE_KEY = 'ams_v2';
let flights = [];

const flightsTbody = document.querySelector('#flightsTable tbody');
const openAddFormBtn = document.getElementById('openAddForm');
const flightModal = document.getElementById('flightModal');
const flightForm = document.getElementById('flightForm');
const modalTitle = document.getElementById('modalTitle');
const cancelModalBtn = document.getElementById('cancelModal');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

const passengerModal = document.getElementById('passengerModal');
const passengerForm = document.getElementById('passengerForm');
const passengerTableBody = document.querySelector('#passengerTable tbody');
const passFlightLabel = document.getElementById('passFlightLabel');
const closePassengerModal = document.getElementById('closePassengerModal');

const kpiFlights = document.getElementById('kpiFlights');
const kpiBoarding = document.getElementById('kpiBoarding');
const kpiDeparted = document.getElementById('kpiDeparted');
const kpiChecked = document.getElementById('kpiChecked');

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(flights)); }
function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) flights = JSON.parse(raw);
    else {
        flights = [
            { id: uid(), number: 'AI101', airline: 'Aero India', from: 'BLR', to: 'DEL', departure: new Date(Date.now() + 3600 * 1000).toISOString(), gate: 'A1', status: 'scheduled', passengers: [] },
            { id: uid(), number: '6E202', airline: 'IndiGo', from: 'BOM', to: 'BLR', departure: new Date(Date.now() + 7200 * 1000).toISOString(), gate: 'B3', status: 'boarding', passengers: [{ id: uid(), name: 'Ravi', seat: '12A', checked: true }] }
        ];
        save();
    }
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function renderKPIs() {
    kpiFlights.textContent = flights.length;
    kpiBoarding.textContent = flights.filter(f => f.status === 'boarding').length;
    kpiDeparted.textContent = flights.filter(f => f.status === 'departed').length;
    const checked = flights.reduce((acc, f) => acc + f.passengers.filter(p => p.checked).length, 0);
    kpiChecked.textContent = checked;
}

function render() {
    const q = searchInput.value.trim().toLowerCase();
    const status = statusFilter.value;
    flightsTbody.innerHTML = '';

    const filtered = flights.filter(f => {
        if (status !== 'all' && f.status !== status) return false;
        if (!q) return true;
        return f.number.toLowerCase().includes(q) || f.from.toLowerCase().includes(q) || f.to.toLowerCase().includes(q) || f.to.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        flightsTbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#6b7280;padding:18px">No flights found</td></tr>`;
        renderKPIs();
        return;
    }

    filtered.forEach(f => {
        const tr = document.createElement('tr');
        const dep = new Date(f.departure).toLocaleString();
        tr.innerHTML = `
      <td>${escapeHtml(f.number)}</td>
      <td>${escapeHtml(f.airline)}</td>
      <td>${escapeHtml(f.from)} → ${escapeHtml(f.to)}</td>
      <td>${dep}</td>
      <td>${escapeHtml(f.gate)}</td>
      <td><span class="badge ${f.status}">${capitalize(f.status)}</span></td>
      <td>${f.passengers.length}</td>
      <td class="actions">
        <button class="pass" data-id="${f.id}">Passengers</button>
        <button class="edit" data-id="${f.id}">Edit</button>
        <button class="delete" data-id="${f.id}">Delete</button>
      </td>
    `;
        flightsTbody.appendChild(tr);
    });

    renderKPIs();
}

// Modal controls
function openFlightModal(editId) {
    flightModal.classList.remove('hidden');
    if (editId) {
        modalTitle.textContent = 'Edit Flight';
        const f = flights.find(x => x.id === editId);
        document.getElementById('flightId').value = f.id;
        document.getElementById('flightNumber').value = f.number;
        document.getElementById('airline').value = f.airline;
        document.getElementById('from').value = f.from;
        document.getElementById('to').value = f.to;
        const dt = new Date(f.departure);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById('departure').value = local;
        document.getElementById('gate').value = f.gate;
        document.getElementById('status').value = f.status;
    } else {
        modalTitle.textContent = 'Add Flight';
        flightForm.reset();
        document.getElementById('flightId').value = '';
    }
}
function closeFlightModal() { flightModal.classList.add('hidden'); }

function openPassengerModal(flightId) {
    passengerModal.classList.remove('hidden');
    const f = flights.find(x => x.id === flightId);
    passFlightLabel.textContent = `${f.number} ${f.from} → ${f.to}`;
    document.getElementById('passFlightId').value = flightId;
    renderPassengers(flightId);
}
function closePassenger() { passengerModal.classList.add('hidden'); passengerForm.reset(); }

function renderPassengers(flightId) {
    const f = flights.find(x => x.id === flightId);
    passengerTableBody.innerHTML = '';
    if (!f || f.passengers.length === 0) {
        passengerTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:12px">No passengers</td></tr>`;
        return;
    }
    f.passengers.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.seat)}</td>
      <td>${p.checked ? '<strong style="color:var(--success)">Yes</strong>' : 'No'}</td>
      <td><button data-flight="${f.id}" data-pass="${p.id}" class="toggleCheck">${p.checked ? 'Undo' : 'Check-in'}</button></td>
    `;
        passengerTableBody.appendChild(tr);
    });
}

// Events
openAddFormBtn.addEventListener('click', () => openFlightModal());
cancelModalBtn.addEventListener('click', closeFlightModal);
flightModal.addEventListener('click', e => { if (e.target === flightModal) closeFlightModal(); });

flightForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('flightId').value;
    const number = document.getElementById('flightNumber').value.trim();
    const airline = document.getElementById('airline').value.trim();
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const departure = document.getElementById('departure').value;
    const gate = document.getElementById('gate').value.trim();
    const status = document.getElementById('status').value;
    if (!number || !airline || !from || !to || !departure) return alert('Please fill required fields');
    const iso = new Date(departure).toISOString();
    if (id) {
        const f = flights.find(x => x.id === id);
        Object.assign(f, { number, airline, from, to, departure: iso, gate, status });
    } else {
        flights.push({ id: uid(), number, airline, from, to, departure: iso, gate, status, passengers: [] });
    }
    save(); render(); closeFlightModal();
});

searchInput.addEventListener('input', render);
statusFilter.addEventListener('change', render);

flightsTbody.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('edit')) openFlightModal(id);
    else if (btn.classList.contains('delete')) {
        if (confirm('Delete this flight?')) { flights = flights.filter(f => f.id !== id); save(); render(); }
    } else if (btn.classList.contains('pass')) openPassengerModal(id);
});

passengerForm.addEventListener('submit', e => {
    e.preventDefault();
    const flightId = document.getElementById('passFlightId').value;
    const name = document.getElementById('passName').value.trim();
    const seat = document.getElementById('passSeat').value.trim();
    if (!name || !seat) return;
    const f = flights.find(x => x.id === flightId);
    f.passengers.push({ id: uid(), name, seat, checked: false });
    save(); renderPassengers(flightId); passengerForm.reset(); render();
});

closePassengerModal.addEventListener('click', closePassenger);
passengerModal.addEventListener('click', e => { if (e.target === passengerModal) closePassenger(); });

passengerTableBody.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const flightId = btn.dataset.flight;
    const passId = btn.dataset.pass;
    const f = flights.find(x => x.id === flightId);
    const p = f.passengers.find(x => x.id === passId);
    p.checked = !p.checked;
    save(); renderPassengers(flightId); render();
});

// init
load(); render();