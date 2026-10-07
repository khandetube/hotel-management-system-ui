const STORAGE = {
  bookings: "stayflow_bookings",
  rooms: "stayflow_rooms",
  tasks: "stayflow_tasks",
  guests: "stayflow_guests",
  hotel: "stayflow_hotel",
  theme: "stayflow_theme"
};

const defaults = {
  bookings: [
    {id:"BK-1042",guest:"Olivia Carter",room:"Deluxe 204",checkIn:"Today",checkOut:"Oct 10",status:"Checked in",amount:"$540",paymentStatus:"Paid",paymentMethod:"Card"},
    {id:"BK-1041",guest:"Noah Williams",room:"Suite 508",checkIn:"Today",checkOut:"Oct 12",status:"Reserved",amount:"$920",paymentStatus:"Pending",paymentMethod:"Crypto / USDT"},
    {id:"BK-1039",guest:"Emma Johnson",room:"Classic 118",checkIn:"Oct 7",checkOut:"Oct 9",status:"Checked out",amount:"$310",paymentStatus:"Paid",paymentMethod:"Card"},
    {id:"BK-1038",guest:"Liam Brown",room:"Deluxe 302",checkIn:"Oct 6",checkOut:"Oct 8",status:"Reserved",amount:"$460",paymentStatus:"Pending",paymentMethod:"Bank transfer"}
  ],
  rooms: [
    {id:"101",type:"Classic",floor:"1",status:"Available",rate:"$120"},
    {id:"118",type:"Classic",floor:"1",status:"Checked in",rate:"$155"},
    {id:"204",type:"Deluxe",floor:"2",status:"Checked in",rate:"$180"},
    {id:"302",type:"Deluxe",floor:"3",status:"Cleaning",rate:"$180"},
    {id:"402",type:"Suite",floor:"4",status:"Available",rate:"$290"},
    {id:"508",type:"Suite",floor:"5",status:"Maintenance",rate:"$340"}
  ],
  guests: ["Olivia Carter","Noah Williams","Emma Johnson","Liam Brown"],
  tasks: [
    {id:"HK-01",room:"204",task:"Turnover cleaning",assignee:"Maria",status:"In progress"},
    {id:"HK-02",room:"302",task:"Deep cleaning",assignee:"James",status:"Pending"},
    {id:"HK-03",room:"118",task:"Restock minibar",assignee:"Ava",status:"Completed"}
  ]
};

const state = {
  section:"Dashboard",
  notifications:3,
  action:null,
  bookings:load(STORAGE.bookings, defaults.bookings),
  rooms:load(STORAGE.rooms, defaults.rooms),
  guests:load(STORAGE.guests, defaults.guests),
  tasks:load(STORAGE.tasks, defaults.tasks)
};
state.bookings = Array.isArray(state.bookings) ? state.bookings : JSON.parse(JSON.stringify(defaults.bookings));
state.rooms = Array.isArray(state.rooms) ? state.rooms : JSON.parse(JSON.stringify(defaults.rooms));
state.guests = Array.isArray(state.guests) ? state.guests : JSON.parse(JSON.stringify(defaults.guests));
state.tasks = Array.isArray(state.tasks) ? state.tasks : JSON.parse(JSON.stringify(defaults.tasks));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
  } catch (_) {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function saveAll() {
  localStorage.setItem(STORAGE.bookings, JSON.stringify(state.bookings));
  localStorage.setItem(STORAGE.rooms, JSON.stringify(state.rooms));
  localStorage.setItem(STORAGE.guests, JSON.stringify(state.guests));
  localStorage.setItem(STORAGE.tasks, JSON.stringify(state.tasks));
}

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const money = (value) => {
  const n = parseFloat(String(value).replace(/[^0-9.]/g,"")) || 0;
  return "$" + n.toLocaleString();
};
const badge = (value) => {
  const cls = String(value).toLowerCase().replaceAll(" ","-");
  return '<span class="status status-' + cls + '">' + esc(value) + '</span>';
};

function shell(title, subtitle, body) {
  state.section = title;
  const pageTitle = $("#pageTitle");
  const pageSubtitle = $("#pageSubtitle");
  const workspace = $("#workspace");
  if (!pageTitle || !pageSubtitle || !workspace) throw new Error("StayFlow shell elements are missing.");
  pageTitle.textContent = title;
  pageSubtitle.textContent = subtitle;
  workspace.innerHTML = body;
  document.querySelectorAll("[data-section]").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === title);
  });
}

function totals() {
  const total = state.rooms.length;
  const occupied = state.rooms.filter(r => r.status === "Checked in").length;
  const cleaning = state.rooms.filter(r => r.status === "Cleaning").length;
  const maintenance = state.rooms.filter(r => r.status === "Maintenance").length;
  const available = state.rooms.filter(r => r.status === "Available").length;
  const revenue = state.bookings.reduce((s,b) => s + (parseFloat(String(b.amount).replace(/[^0-9.]/g,"")) || 0), 0);
  return {total, occupied, cleaning, maintenance, available, revenue, occupancy: total ? Math.round(occupied/total*100) : 0};
}

function dashboard() {
  const t = totals();
  shell("Dashboard","Overview of today's hotel operations",
    '<div class="welcome-row"><div><h2>Good morning, Alex</h2><p>Live browser-based hotel operations prototype.</p></div><button class="primary" data-action="new-booking">＋ New reservation</button></div>' +
    '<div class="stats-grid">' +
    '<article class="stat-card"><div class="stat-top"><span>Occupancy</span><span class="trend up">Live</span></div><strong>' + t.occupancy + '%</strong><small>' + t.occupied + ' occupied of ' + t.total + ' rooms</small><div class="progress"><span style="width:' + t.occupancy + '%"></span></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Booking value</span><span class="trend up">Live</span></div><strong>' + money(t.revenue) + '</strong><small>' + state.bookings.length + ' reservation records</small><div class="mini-chart"><i style="height:38%"></i><i style="height:54%"></i><i style="height:47%"></i><i style="height:70%"></i><i style="height:62%"></i><i style="height:82%"></i><i style="height:91%"></i></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Arrivals</span><span class="neutral">Today</span></div><strong>' + state.bookings.filter(b => b.checkIn === "Today" && b.status !== "Checked out").length + '</strong><small>Guests expected today</small><div class="progress"><span style="width:68%"></span></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Room readiness</span><span class="neutral">Live</span></div><strong>' + t.available + '</strong><small>' + t.cleaning + ' cleaning · ' + t.maintenance + ' maintenance</small><div class="progress warning"><span style="width:' + (t.total ? Math.round(t.available/t.total*100) : 0) + '%"></span></div></article></div>' +
    '<div class="grid-two"><section class="panel"><div class="panel-head"><div><h3>Room status</h3><p>Click a room in the Rooms module to change its operational state.</p></div><a href="#" data-section="Rooms">Manage rooms →</a></div>' +
    '<div class="room-list room-list-wide"><div><span class="room-dot occupied"></span><span>Occupied</span><strong>' + t.occupied + '</strong></div><div><span class="room-dot available"></span><span>Available</span><strong>' + t.available + '</strong></div><div><span class="room-dot cleaning"></span><span>Cleaning</span><strong>' + t.cleaning + '</strong></div><div><span class="room-dot maintenance"></span><span>Maintenance</span><strong>' + t.maintenance + '</strong></div></div></section>' +
    '<section class="panel"><div class="panel-head"><div><h3>Housekeeping queue</h3><p>Operational tasks requiring attention.</p></div><a href="#" data-section="Housekeeping">Open queue →</a></div><div class="task-summary">' + state.tasks.map(task => '<div><span>' + esc(task.room) + '</span><div><strong>' + esc(task.task) + '</strong><small>' + esc(task.assignee) + ' · ' + badge(task.status) + '</small></div></div>').join("") + '</div></section></div>' +
    bookingPanel()
  );
  bindBookingSearch();
}

function bookingPanel() {
  return '<section class="panel bookings-panel"><div class="panel-head"><div><h3>Recent reservations</h3><p>Search and operate each reservation.</p></div><div class="panel-tools"><input id="bookingSearch" placeholder="Search reservations..." aria-label="Search reservations"><a href="#" data-section="Reservations">View all →</a></div></div><div class="table-wrap"><table><thead><tr><th>Booking</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Amount</th><th>Actions</th></tr></thead><tbody id="bookingRows"></tbody></table></div></section>';
}

function bindBookingSearch() {
  renderBookings();
  const input = $("#bookingSearch");
  if (input) input.oninput = (e) => renderBookings(e.target.value);
}

function renderBookings(filter) {
  const el = $("#bookingRows");
  if (!el) return;
  const q = String(filter || "").toLowerCase();
  const rows = state.bookings.filter(b => Object.values(b).join(" ").toLowerCase().includes(q));
  el.innerHTML = rows.map(b =>
    '<tr><td><strong>' + esc(b.id) + '</strong></td><td>' + esc(b.guest) + '</td><td>' + esc(b.room) + '</td><td>' + esc(b.checkIn) + '</td><td>' + esc(b.checkOut) + '</td><td>' + badge(b.status) + '</td><td><strong>' + esc(b.amount) + '</strong><br><small>' + badge(b.paymentStatus || "Pending") + '</small></td><td><div class="row-actions"><button type="button" data-action="checkin" data-id="' + esc(b.id) + '">Check-in</button><button type="button" data-action="checkout" data-id="' + esc(b.id) + '">Check-out</button><button type="button" data-action="payment" data-id="' + esc(b.id) + '">Payment</button></div></td></tr>'
  ).join("") || '<tr><td colspan="8" class="empty">No bookings found.</td></tr>';
}

function reservations() {
  shell("Reservations","Manage bookings and guest stays",
    '<div class="welcome-row"><div><h2>Reservations</h2><p>Create, search and update every stay.</p></div><button class="primary" data-action="new-booking">＋ New reservation</button></div>' + bookingPanel());
  bindBookingSearch();
}

function rooms() {
  shell("Rooms","Manage room inventory and availability",
    '<div class="welcome-row"><div><h2>Rooms</h2><p>Use the action buttons to operate the room inventory.</p></div><button class="primary" data-action="add-room">＋ Add room</button></div>' +
    '<section class="panel"><div class="filter-row"><select id="roomFilter"><option>All</option><option>Available</option><option>Checked in</option><option>Cleaning</option><option>Maintenance</option></select><span>' + state.rooms.length + ' rooms in browser storage</span></div><div class="table-wrap"><table><thead><tr><th>Room</th><th>Type</th><th>Floor</th><th>Status</th><th>Rate</th><th>Action</th></tr></thead><tbody id="roomRows"></tbody></table></div></section>');
  renderRooms();
  $("#roomFilter").onchange = (e) => renderRooms(e.target.value);
}

function renderRooms(filter) {
  const f = filter || "All";
  const rows = state.rooms.filter(r => f === "All" || r.status === f);
  $("#roomRows").innerHTML = rows.map(r => '<tr><td><strong>' + esc(r.id) + '</strong></td><td>' + esc(r.type) + '</td><td>' + esc(r.floor) + '</td><td>' + badge(r.status) + '</td><td><strong>' + esc(r.rate) + '</strong></td><td><button class="table-action" data-action="room-status" data-id="' + esc(r.id) + '">Change status</button></td></tr>').join("") || '<tr><td colspan="6" class="empty">No rooms match this filter.</td></tr>';
}

function guests() {
  const rows = state.guests.map(g => {
    const bookings = state.bookings.filter(b => b.guest === g);
    const active = bookings.find(b => b.status !== "Checked out");
    return '<tr><td><strong>' + esc(g) + '</strong></td><td>' + bookings.length + '</td><td>' + badge(active?.status || "No active stay") + '</td><td><button class="table-action" data-action="guest-view" data-guest="' + esc(g) + '">View profile</button></td></tr>';
  });
  shell("Guests","Manage guest profiles and stay history",
    '<div class="welcome-row"><div><h2>Guests</h2><p>Guest records are linked to reservations in this prototype.</p></div><button class="primary" data-action="add-guest">＋ Add guest</button></div>' +
    '<section class="panel"><div class="table-wrap"><table><thead><tr><th>Guest</th><th>Bookings</th><th>Current status</th><th>Action</th></tr></thead><tbody>' + rows.join("") + '</tbody></table></div></section>');
}

function housekeeping() {
  shell("Housekeeping","Track cleaning and room service tasks",
    '<div class="welcome-row"><div><h2>Housekeeping</h2><p>Move tasks through Pending, In progress and Completed.</p></div><button class="primary" data-action="add-task">＋ New task</button></div>' +
    '<section class="panel"><div class="table-wrap"><table><thead><tr><th>Room</th><th>Task</th><th>Assignee</th><th>Status</th><th>Action</th></tr></thead><tbody>' +
    state.tasks.map(t => '<tr><td><strong>' + esc(t.room) + '</strong></td><td>' + esc(t.task) + '</td><td>' + esc(t.assignee) + '</td><td>' + badge(t.status) + '</td><td><button class="table-action" data-action="task-status" data-id="' + esc(t.id) + '">Advance status</button></td></tr>').join("") +
    '</tbody></table></div></section>');
}

function payments() {
  const paid = state.bookings.filter(b => (b.paymentStatus || "Pending") === "Paid").length;
  const pending = state.bookings.filter(b => (b.paymentStatus || "Pending") === "Pending").length;
  shell("Payments","Track charges and payment status",
    '<div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Paid</span></div><strong>' + paid + '</strong><small>Settled reservations</small></article><article class="stat-card"><div class="stat-top"><span>Pending</span></div><strong>' + pending + '</strong><small>Awaiting payment</small></article><article class="stat-card"><div class="stat-top"><span>Total value</span></div><strong>' + money(totals().revenue) + '</strong><small>Current reservation value</small></article><article class="stat-card"><div class="stat-top"><span>Crypto support</span></div><strong>USDT</strong><small>Available in payment action</small></article></div>' +
    '<section class="panel bookings-panel"><div class="table-wrap"><table><thead><tr><th>Booking</th><th>Guest</th><th>Amount</th><th>Status</th><th>Method</th><th>Action</th></tr></thead><tbody>' +
    state.bookings.map(b => '<tr><td><strong>' + esc(b.id) + '</strong></td><td>' + esc(b.guest) + '</td><td>' + esc(b.amount) + '</td><td>' + badge(b.paymentStatus || "Pending") + '</td><td>' + esc(b.paymentMethod || "—") + '</td><td><button class="table-action" data-action="payment" data-id="' + esc(b.id) + '">Update payment</button></td></tr>').join("") +
    '</tbody></table></div></section>');
}

function reports() {
  const t = totals();
  const paidValue = state.bookings.filter(b => (b.paymentStatus || "Pending") === "Paid").reduce((s,b) => s + (parseFloat(String(b.amount).replace(/[^0-9.]/g,"")) || 0),0);
  shell("Reports","Review operational performance",
    '<div class="welcome-row"><div><h2>Performance reports</h2><p>These metrics recalculate immediately after every operational change.</p></div><button class="primary" data-action="export-report">Export summary</button></div>' +
    '<div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Occupancy</span></div><strong>' + t.occupancy + '%</strong><small>Based on current room states</small></article><article class="stat-card"><div class="stat-top"><span>Revenue</span></div><strong>' + money(t.revenue) + '</strong><small>Reservation value</small></article><article class="stat-card"><div class="stat-top"><span>Paid value</span></div><strong>' + money(paidValue) + '</strong><small>Settled payment value</small></article><article class="stat-card"><div class="stat-top"><span>Task completion</span></div><strong>' + (state.tasks.length ? Math.round(state.tasks.filter(x => x.status === "Completed").length/state.tasks.length*100) : 0) + '%</strong><small>Housekeeping completion</small></article></div>' +
    '<section class="panel report-bars"><h3>Operational breakdown</h3><div class="report-row"><span>Available rooms</span><div><i style="width:' + (t.total ? t.available/t.total*100 : 0) + '%"></i></div><strong>' + t.available + '</strong></div><div class="report-row"><span>Occupied rooms</span><div><i style="width:' + (t.total ? t.occupied/t.total*100 : 0) + '%"></i></div><strong>' + t.occupied + '</strong></div><div class="report-row"><span>Cleaning rooms</span><div><i style="width:' + (t.total ? t.cleaning/t.total*100 : 0) + '%"></i></div><strong>' + t.cleaning + '</strong></div></section>');
}

function settings() {
  const hotel = localStorage.getItem(STORAGE.hotel) || "Grand Aurora";
  const theme = localStorage.getItem(STORAGE.theme) || "light";
  shell("Settings","Configure the StayFlow workspace",
    '<div class="welcome-row"><div><h2>System settings</h2><p>Preferences persist in this browser.</p></div><button class="primary" data-action="save-settings">Save changes</button></div>' +
    '<section class="panel"><div class="form-row"><label>Hotel name<input id="hotelName" value="' + esc(hotel) + '"></label><label>Interface theme<select id="themeSelect"><option value="light"' + (theme === "light" ? " selected" : "") + '>Light</option><option value="compact"' + (theme === "compact" ? " selected" : "") + '>Compact</option><option value="dark"' + (theme === "dark" ? " selected" : "") + '>Dark</option></select></label></div><div class="settings-grid"><div><strong>Reservation records</strong><span>' + state.bookings.length + '</span></div><div><strong>Rooms</strong><span>' + state.rooms.length + '</span></div><div><strong>Guests</strong><span>' + state.guests.length + '</span></div><div><strong>Housekeeping tasks</strong><span>' + state.tasks.length + '</span></div></div></section>');
}

function openAction(type, id) {
  state.action = {type,id};
  const booking = state.bookings.find(b => b.id === id);
  const room = state.rooms.find(r => r.id === id);
  const task = state.tasks.find(t => t.id === id);
  const guest = type === "guest-view" ? id : null;
  let title = "Operational action";
  let subtitle = "";
  let fields = "";
  if (type === "checkin" || type === "checkout") {
    title = type === "checkin" ? "Check-in guest" : "Check-out guest";
    subtitle = booking.guest + " · " + booking.room;
    fields = '<label>Room<input name="room" value="' + esc(booking.room) + '" required></label><label>Notes<textarea name="notes" rows="3" placeholder="Optional operational note"></textarea></label>';
  } else if (type === "payment") {
    title = "Update payment";
    subtitle = booking.guest + " · " + booking.id;
    fields = '<label>Payment status<select name="status"><option' + (booking.paymentStatus === "Paid" ? " selected" : "") + '>Paid</option><option' + (booking.paymentStatus === "Pending" ? " selected" : "") + '>Pending</option><option' + (booking.paymentStatus === "Refunded" ? " selected" : "") + '>Refunded</option></select></label><label>Payment method<select name="method"><option>Card</option><option>Cash</option><option>Bank transfer</option><option>Crypto / USDT</option></select></label>';
  } else if (type === "room-status") {
    title = id === "__new__" ? "Add room" : "Change room status";
    subtitle = id === "__new__" ? "Create a new room in the inventory" : "Room " + room.id + " · " + room.type;
    fields = id === "__new__" ? '<p class="modal-note">You will enter the room details after saving this action.</p>' : '<label>Status<select name="status"><option>Available</option><option>Checked in</option><option>Cleaning</option><option>Maintenance</option></select></label>';
  } else if (type === "task-status") {
    title = "Advance housekeeping task";
    subtitle = "Room " + task.room + " · " + task.task;
    fields = '<label>Status<select name="status"><option>Pending</option><option>In progress</option><option>Completed</option></select></label>';
  } else if (type === "guest-view") {
    const records = state.bookings.filter(b => b.guest === guest);
    title = "Guest profile";
    subtitle = guest;
    fields = '<div class="profile-card"><strong>' + esc(guest) + '</strong><span>' + records.length + ' reservation(s)</span><span>' + (records.map(r => r.id + " · " + r.room + " · " + r.status).join("<br>") || "No reservation history") + '</span></div>';
  }
  $("#actionTitle").textContent = title;
  $("#actionSubtitle").textContent = subtitle;
  $("#actionFields").innerHTML = fields;
  $("#actionModal").showModal();
}

function newBooking() {
  $("#bookingModal").showModal();
}

function globalSearch(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return;
  if (state.bookings.some(b => Object.values(b).join(" ").toLowerCase().includes(q))) {
    setSection("Reservations");
    const input = $("#bookingSearch");
    if (input) { input.value = query; renderBookings(query); }
    return;
  }
  if (state.rooms.some(r => Object.values(r).join(" ").toLowerCase().includes(q))) { setSection("Rooms"); return; }
  if (state.guests.some(g => g.toLowerCase().includes(q))) { setSection("Guests"); return; }
  alert("No matching records found.");
}

function applyTheme() {
  const theme = localStorage.getItem(STORAGE.theme) || "light";
  document.body.classList.toggle("compact-theme", theme === "compact");
  document.body.classList.toggle("dark-theme", theme === "dark");
}

function setSection(section) {
  const pages = {Dashboard:dashboard,Reservations:reservations,Rooms:rooms,Guests:guests,Housekeeping:housekeeping,Payments:payments,Reports:reports,Settings:settings};
  (pages[section] || dashboard)();
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-section]");
  if (nav) {
    event.preventDefault();
    const targetSection = nav.dataset.section;
    if (targetSection === "Dashboard") {
      // Home is a real navigation action: always rebuild the dashboard,
      // even when Dashboard is already selected.
      dashboard();
      window.scrollTo({top:0, left:0, behavior:"smooth"});
    } else {
      setSection(targetSection);
      window.scrollTo({top:0, left:0, behavior:"smooth"});
    }
    return;
  }
  const action = event.target.closest("[data-action]");
  if (!action) return;
  event.preventDefault();
  const type = action.dataset.action;
  if (type === "new-booking") return newBooking();
  if (["checkin","checkout","payment","room-status","task-status","guest-view"].includes(type)) return openAction(type, action.dataset.id || action.dataset.guest);
  if (type === "add-room") return openAction("room-status","__new__");
  if (type === "add-guest") {
    const name = prompt("Guest name");
    if (name && name.trim()) { state.guests.push(name.trim()); saveAll(); setSection("Guests"); }
    return;
  }
  if (type === "add-task") {
    const room = prompt("Room number");
    const task = prompt("Task");
    const assignee = prompt("Assignee");
    if (room && task && assignee) { state.tasks.push({id:"HK-"+Date.now(),room,task,assignee,status:"Pending"}); saveAll(); setSection("Housekeeping"); }
    return;
  }
  if (type === "save-settings") {
    const hotel = $("#hotelName").value.trim();
    const theme = $("#themeSelect").value;
    if (hotel) { localStorage.setItem(STORAGE.hotel,hotel); document.querySelector(".hotel-switcher strong").textContent = hotel; }
    localStorage.setItem(STORAGE.theme,theme);
    applyTheme();
    alert("Settings saved.");
    return;
  }
  if (type === "export-report") {
    const t = totals();
    const report = "StayFlow Report\nOccupancy: " + t.occupancy + "%\nRooms: " + t.total + "\nBookings: " + state.bookings.length + "\nBooking value: " + money(t.revenue);
    const blob = new Blob([report],{type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="stayflow-report.txt"; a.click(); URL.revokeObjectURL(url);
  }
  if (type === "close-action") $("#actionModal").close();
  if (type === "close-modal") $("#bookingModal").close();
  if (type === "support") alert("Support center: demo mode. Connect this action to your production support channel.");
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "actionForm") {
    event.preventDefault();
    const data = new FormData(event.target);
    const a = state.action;
    if (!a) return;
    if (a.type === "checkin" || a.type === "checkout") {
      const b = state.bookings.find(x => x.id === a.id);
      if (b) {
        b.status = a.type === "checkin" ? "Checked in" : "Checked out";
        const roomId = String(b.room).match(/\d+/)?.[0];
        const room = state.rooms.find(x => x.id === roomId);
        if (room) room.status = a.type === "checkin" ? "Checked in" : "Cleaning";
      }
    }
    if (a.type === "payment") {
      const b = state.bookings.find(x => x.id === a.id);
      if (b) { b.paymentStatus = data.get("status"); b.paymentMethod = data.get("method"); }
    }
    if (a.type === "room-status") {
      if (a.id === "__new__") {
        const id = prompt("Room number");
        const type = prompt("Room type","Deluxe");
        const floor = prompt("Floor","1");
        const rate = prompt("Nightly rate","$180");
        if (id && type && floor && rate) state.rooms.push({id,type,floor,status:"Available",rate});
      } else {
        const r = state.rooms.find(x => x.id === a.id);
        if (r) r.status = data.get("status");
      }
    }
    if (a.type === "task-status") {
      const t = state.tasks.find(x => x.id === a.id);
      if (t) t.status = data.get("status");
    }
    saveAll();
    $("#actionModal").close();
    setSection(state.section);
    return;
  }
  if (event.target.id === "newBookingForm") {
    event.preventDefault();
    const data = new FormData(event.target);
    const guest = String(data.get("guest") || "").trim();
    const room = String(data.get("room") || "").trim();
    const checkIn = String(data.get("checkin") || "");
    const checkOut = String(data.get("checkout") || "");
    if (!guest || !room || !checkIn || !checkOut || checkOut < checkIn) {
      alert("Please enter valid reservation dates.");
      return;
    }
    if (!state.guests.includes(guest)) state.guests.push(guest);
    state.bookings.unshift({id:"BK-" + (1043 + state.bookings.length + Date.now()%100),guest,room,checkIn,checkOut,status:"Reserved",amount:data.get("amount") || "$0",paymentStatus:"Pending",paymentMethod:"Card"});
    saveAll();
    $("#bookingModal").close();
    setSection("Reservations");
  }
});

document.addEventListener("keydown",(event) => {
  if (event.key === "Enter" && event.target.matches(".search input")) {
    event.preventDefault();
    globalSearch(event.target.value);
  }
});

function bootStayFlow() {
  try {
    const year = $("#yearLabel");
    if (year) year.textContent = new Date().getFullYear();
    const savedHotel = localStorage.getItem(STORAGE.hotel);
    const hotelName = document.querySelector(".hotel-switcher strong");
    if (savedHotel && hotelName) hotelName.textContent = savedHotel;
    const notificationBtn = $("#notificationBtn");
    if (notificationBtn) notificationBtn.addEventListener("click",() => {
      state.notifications = 0;
      const count = $("#notificationCount");
      if (count) count.textContent = "0";
    });
    const support = document.querySelector(".support-card button");
    if (support) support.dataset.action = "support";
    applyTheme();
    dashboard();
  } catch (error) {
    console.error("StayFlow boot failed:", error);
    const workspace = $("#workspace");
    if (workspace) workspace.innerHTML =
      '<section class="panel boot-error"><div class="panel-head"><div><h3>StayFlow could not initialize</h3><p>The page loaded, but the interactive layer hit a runtime error.</p></div></div><p class="boot-error-text">' + esc(error && error.message ? error.message : error) + '</p><button class="primary" data-action="reset-demo">Reset demo data</button></section>';
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootStayFlow, {once:true});
} else {
  bootStayFlow();
}

// --- Modern command palette + quick actions layer ---
function openCommandPalette(){
  const existing=document.getElementById('commandPalette');
  if(existing){ existing.classList.add('open'); existing.querySelector('input')?.focus(); return; }
  const el=document.createElement('div');
  el.id='commandPalette'; el.className='command-palette open';
  el.innerHTML=`<div class="palette-backdrop" data-close-palette></div><div class="palette-panel">
    <div class="palette-head"><div><strong>Quick Actions</strong><small>Navigate and manage StayFlow</small></div><button type="button" data-close-palette>Esc</button></div>
    <div class="palette-search"><span>⌕</span><input id="paletteInput" placeholder="Search pages or actions..." autocomplete="off"></div>
    <div class="palette-list" id="paletteList"></div>
  </div>`;
  document.body.appendChild(el);
  const items=[
    ['Dashboard','Open dashboard','Dashboard'],['Reservations','Manage reservations','Reservations'],['Rooms','Room inventory & status','Rooms'],['Guests','Guest profiles','Guests'],['Housekeeping','Cleaning operations','Housekeeping'],['Payments','Payments & transactions','Payments'],['Reports','Analytics & reports','Reports'],['Settings','System settings','Settings']
  ];
  const list=el.querySelector('#paletteList'), input=el.querySelector('#paletteInput');
  const render=(q='')=>{list.innerHTML=items.filter(x=>(x[0]+' '+x[1]).toLowerCase().includes(q.toLowerCase())).map(x=>`<button class="palette-item" data-section="${x[2]}"><span class="palette-dot"></span><span><b>${x[0]}</b><small>${x[1]}</small></span><kbd>↵</kbd></button>`).join('')||'<div class="palette-empty">No matching actions</div>';};
  render(); input.addEventListener('input',e=>render(e.target.value));
  list.addEventListener('click',e=>{const b=e.target.closest('[data-section]');if(b){el.remove();document.querySelector(`[data-section="${b.dataset.section}"]`)?.click();}});
  el.addEventListener('click',e=>{if(e.target.closest('[data-close-palette]'))el.remove();});
}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommandPalette();}if(e.key==='Escape')document.getElementById('commandPalette')?.remove();});


/* =========================================================
   STAYFLOW PRO OPERATIONS LAYER
   Adds operational PMS workflows without requiring a backend.
   Data is persisted locally so the portfolio demo remains usable.
   ========================================================= */
const PRO_STORAGE = {
  preferences:"stayflow_pro_preferences",
  notes:"stayflow_guest_notes",
  audit:"stayflow_audit_log",
  payments:"stayflow_transactions"
};
const proLoad=(k,f)=>load(k,f);
const proSave=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const proData={
  prefs:proLoad(PRO_STORAGE.preferences,{dateRange:"today",currency:"USD",autoRefresh:true}),
  notes:proLoad(PRO_STORAGE.notes,{}),
  audit:proLoad(PRO_STORAGE.audit,[]),
  transactions:proLoad(PRO_STORAGE.payments,[])
};
function proAudit(action,detail){
  proData.audit.unshift({at:new Date().toISOString(),action,detail});
  proData.audit=proData.audit.slice(0,100);
  proSave(PRO_STORAGE.audit,proData.audit);
}
function proId(prefix){return prefix+"-"+Date.now().toString(36).toUpperCase();}
function proAppend(id,html){
  if(document.getElementById(id)) return;
  $("#workspace")?.insertAdjacentHTML("beforeend",html);
}
function proMoney(v){return money(v);}
function proDateLabel(v){
  if(!v) return "—";
  const d=new Date(v+"T00:00:00");
  return isNaN(d) ? v : d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
}
function proRoomNumber(room){return String(room||"").match(/\d+/)?.[0]||String(room||"");}
function proBooking(id){return state.bookings.find(b=>b.id===id);}
function proOpen(title,subtitle,fields,onSave){
  let d=document.getElementById("proModal");
  if(!d){
    d=document.createElement("dialog");d.id="proModal";
    d.innerHTML='<form method="dialog" class="pro-modal-form"><div class="modal-head"><div><h3 id="proTitle"></h3><p id="proSubtitle"></p></div><button type="button" class="close" data-pro-close>×</button></div><div id="proFields"></div><div class="pro-modal-actions"><button type="button" class="secondary" data-pro-close>Cancel</button><button class="primary" type="submit">Save</button></div></form>';
    document.body.appendChild(d);
    d.addEventListener("click",e=>{if(e.target.closest("[data-pro-close]")) d.close();});
    d.addEventListener("submit",e=>{e.preventDefault();const fn=d._save;if(fn&&fn(new FormData(e.target))!==false)d.close();});
  }
  $("#proTitle").textContent=title;$("#proSubtitle").textContent=subtitle;$("#proFields").innerHTML=fields;d._save=onSave;d.showModal();
}
function proStat(label,value,meta,cls=""){
  return '<article class="stat-card pro-stat '+cls+'"><div class="stat-top"><span>'+esc(label)+'</span><span class="neutral">Live</span></div><strong>'+esc(value)+'</strong><small>'+esc(meta)+'</small></article>';
}
function proDashboard(){
  proAppend("proDashboard",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Front Desk Command Center</h3><p>Live operational controls for arrivals, departures, room readiness and exceptions.</p></div><div class="pro-toolbar"><select id="proRange"><option value="today">Today</option><option value="7">Next 7 days</option><option value="30">Next 30 days</option></select><button class="secondary" data-pro-action="refresh">Refresh</button></div></div>'+
    '<div class="stats-grid pro-kpis" id="proKpis"></div>'+
    '<div class="pro-grid-3"><div class="pro-card"><h4>Arrivals</h4><div id="proArrivals"></div></div><div class="pro-card"><h4>Departures</h4><div id="proDepartures"></div></div><div class="pro-card"><h4>Exceptions</h4><div id="proExceptions"></div></div></div>'+
    '<div class="pro-grid-2"><div class="pro-card"><h4>Occupancy by room type</h4><div id="proOccupancy"></div></div><div class="pro-card"><h4>Activity audit</h4><div id="proAudit"></div></div></div></section>');
  const t=totals(),paid=state.bookings.filter(b=>b.paymentStatus==="Paid").reduce((s,b)=>s+(parseFloat(String(b.amount).replace(/[^0-9.]/g,""))||0),0);
  const arrivals=state.bookings.filter(b=>b.status==="Reserved"&&b.checkIn==="Today");
  const departures=state.bookings.filter(b=>b.status==="Checked in"&&b.checkOut);
  const exceptions=state.rooms.filter(r=>["Maintenance","Cleaning"].includes(r.status));
  $("#proKpis").innerHTML=proStat("Occupancy",t.occupancy+"%",t.occupied+" of "+t.total+" rooms")+proStat("Available",String(t.available),t.available+" rooms ready")+proStat("Unsettled",proMoney(t.revenue-paid),state.bookings.length+" reservations")+proStat("Exceptions",String(exceptions.length),t.maintenance+" maintenance · "+t.cleaning+" cleaning");
  const line=(b,action,label)=>'<div class="pro-line"><div><strong>'+esc(b.guest)+'</strong><small>'+esc(b.room)+' · '+esc(b.checkOut||b.checkIn||"")+'</small></div><button class="table-action" data-pro-action="'+action+'" data-id="'+esc(b.id)+'">'+label+'</button></div>';
  $("#proArrivals").innerHTML=arrivals.length?arrivals.map(b=>line(b,"checkin","Check in")).join(""):'<span class="pro-muted">No scheduled arrivals.</span>';
  $("#proDepartures").innerHTML=departures.length?departures.map(b=>line(b,"checkout","Check out")).join(""):'<span class="pro-muted">No scheduled departures.</span>';
  $("#proExceptions").innerHTML=exceptions.length?exceptions.map(r=>'<div class="pro-line"><div><strong>Room '+esc(r.id)+'</strong><small>'+esc(r.type)+' · '+esc(r.status)+'</small></div><button class="table-action" data-pro-action="room" data-id="'+esc(r.id)+'">Manage</button></div>').join(""):'<span class="pro-muted">No exceptions.</span>';
  const types=[...new Set(state.rooms.map(r=>r.type))];
  $("#proOccupancy").innerHTML=types.map(type=>{const rs=state.rooms.filter(r=>r.type===type),o=rs.filter(r=>r.status==="Checked in").length,p=rs.length?Math.round(o/rs.length*100):0;return '<div class="pro-bar"><span>'+esc(type)+'</span><div><i style="width:'+p+'%"></i></div><strong>'+p+'%</strong></div>';}).join("");
  $("#proAudit").innerHTML=proData.audit.slice(0,5).map(x=>'<div class="pro-audit"><strong>'+esc(x.action)+'</strong><small>'+esc(x.detail)+' · '+new Date(x.at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</small></div>').join("")||'<span class="pro-muted">No activity yet.</span>';
}
function proReservations(){
  proAppend("proReservations",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Reservation Operations</h3><p>Filter by stay state and open the complete operational record.</p></div><div class="pro-toolbar"><select id="reservationStateFilter"><option value="All">All statuses</option><option>Reserved</option><option>Checked in</option><option>Checked out</option></select><select id="reservationPaymentFilter"><option value="All">All payments</option><option>Paid</option><option>Pending</option><option>Refunded</option></select></div></div><div class="table-wrap"><table><thead><tr><th>Guest</th><th>Stay</th><th>Room</th><th>Payment</th><th>Actions</th></tr></thead><tbody id="proReservationRows"></tbody></table></div></section>');
  function render(){
    const sf=$("#reservationStateFilter").value,pf=$("#reservationPaymentFilter").value;
    const rows=state.bookings.filter(b=>(sf==="All"||b.status===sf)&&(pf==="All"||(b.paymentStatus||"Pending")===pf));
    $("#proReservationRows").innerHTML=rows.map(b=>'<tr><td><strong>'+esc(b.guest)+'</strong><br><small>'+esc(b.id)+'</small></td><td>'+esc(b.checkIn)+' → '+esc(b.checkOut)+'</td><td>'+esc(b.room)+'</td><td>'+badge(b.paymentStatus||"Pending")+'<br><small>'+esc(b.paymentMethod||"—")+'</small></td><td><div class="row-actions"><button data-pro-action="details" data-id="'+esc(b.id)+'">Details</button><button data-pro-action="edit-booking" data-id="'+esc(b.id)+'">Edit</button></div></td></tr>').join("")||'<tr><td colspan="5" class="empty">No reservations match the filters.</td></tr>';
  }
  $("#reservationStateFilter").onchange=render;$("#reservationPaymentFilter").onchange=render;render();
}
function proRooms(){
  proAppend("proRooms",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Room Control Board</h3><p>Operational state, rate and service readiness at a glance.</p></div><div class="pro-toolbar"><button class="secondary" data-pro-action="bulk-clean">Create cleaning tasks</button></div></div><div class="pro-room-grid" id="proRoomGrid"></div></section>');
  $("#proRoomGrid").innerHTML=state.rooms.map(r=>'<button class="pro-room-card room-'+r.status.toLowerCase().replaceAll(" ","-")+'" data-pro-action="room" data-id="'+esc(r.id)+'"><strong>'+esc(r.id)+'</strong><span>'+esc(r.type)+'</span><b>'+esc(r.status)+'</b><small>'+esc(r.rate)+'/night</small></button>').join("");
}
function proGuests(){
  proAppend("proGuests",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Guest Intelligence</h3><p>Stay history, preferences and operational notes.</p></div><input class="pro-inline-search" id="guestProSearch" placeholder="Search guest..."></div><div class="pro-guest-grid" id="proGuestGrid"></div></section>');
  function render(q=""){const list=state.guests.filter(g=>g.toLowerCase().includes(q.toLowerCase()));$("#proGuestGrid").innerHTML=list.map(g=>{const bs=state.bookings.filter(b=>b.guest===g),active=bs.find(b=>b.status!=="Checked out");return '<article class="pro-guest"><div class="avatar">'+esc(g.split(" ").map(x=>x[0]).join("").slice(0,2))+'</div><div><strong>'+esc(g)+'</strong><small>'+bs.length+' stay(s) · '+esc(active?.status||"No active stay")+'</small><p>'+esc(proData.notes[g]||"No guest notes")+'</p><button class="table-action" data-pro-action="guest-note" data-guest="'+esc(g)+'">Update notes</button></div></article>';}).join("")||'<span class="pro-muted">No guests found.</span>'}
  $("#guestProSearch").oninput=e=>render(e.target.value);render();
}
function proHousekeeping(){
  proAppend("proHousekeeping",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Housekeeping Control</h3><p>Prioritize turnover, assign work and close completed tasks.</p></div><div class="pro-toolbar"><select id="hkFilter"><option>All</option><option>Pending</option><option>In progress</option><option>Completed</option></select><button class="secondary" data-pro-action="auto-hk">Auto-create turnover</button></div></div><div id="proHkBoard"></div></section>');
  function render(){const f=$("#hkFilter").value,ts=state.tasks.filter(t=>f==="All"||t.status===f);$("#proHkBoard").innerHTML='<div class="pro-task-grid">'+ts.map(t=>'<article class="pro-task"><div><strong>Room '+esc(t.room)+'</strong>'+badge(t.status)+'</div><h4>'+esc(t.task)+'</h4><small>Assigned to '+esc(t.assignee)+'</small><button class="table-action" data-pro-action="task" data-id="'+esc(t.id)+'">Update task</button></article>').join("")+'</div>'}
  $("#hkFilter").onchange=render;render();
}
function proPayments(){
  proAppend("proPayments",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Payment Ledger</h3><p>Track settlement state, method and transaction references.</p></div><button class="secondary" data-pro-action="reconcile">Reconcile ledger</button></div><div class="table-wrap"><table><thead><tr><th>Reference</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody id="proPaymentRows"></tbody></table></div></section>');
  $("#proPaymentRows").innerHTML=state.bookings.map(b=>{let tx=proData.transactions.find(x=>x.bookingId===b.id);return '<tr><td><strong>'+esc(tx?.id||"Not recorded")+'</strong></td><td>'+esc(b.id)+' · '+esc(b.guest)+'</td><td>'+esc(b.amount)+'</td><td>'+esc(b.paymentMethod||"—")+'</td><td>'+badge(b.paymentStatus||"Pending")+'</td></tr>'}).join("");
}
function proReports(){
  proAppend("proReports",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Management Analytics</h3><p>Operational KPIs and exportable data for decision making.</p></div><div class="pro-toolbar"><button class="secondary" data-pro-action="export-csv">Export CSV</button><button class="secondary" data-pro-action="backup">Backup data</button></div></div><div class="pro-grid-2"><div class="pro-card"><h4>Reservation mix</h4><div id="proMix"></div></div><div class="pro-card"><h4>Housekeeping performance</h4><div id="proHkReport"></div></div></div></section>');
  const counts={Reserved:0,"Checked in":0,"Checked out":0};state.bookings.forEach(b=>counts[b.status]=(counts[b.status]||0)+1);
  $("#proMix").innerHTML=Object.entries(counts).map(([k,v])=>'<div class="pro-bar"><span>'+esc(k)+'</span><div><i style="width:'+Math.round(v/Math.max(state.bookings.length,1)*100)+'%"></i></div><strong>'+v+'</strong></div>').join("");
  const done=state.tasks.filter(t=>t.status==="Completed").length,total=state.tasks.length;
  $("#proHkReport").innerHTML='<div class="pro-big-number">'+(total?Math.round(done/total*100):0)+'%</div><small>'+done+' of '+total+' tasks completed</small><div class="pro-bar"><span>Completion</span><div><i style="width:'+(total?done/total*100:0)+'%"></i></div><strong>'+done+'</strong></div>';
}
function proSettings(){
  proAppend("proSettings",
    '<section class="panel pro-operations"><div class="panel-head"><div><h3>Operational Controls</h3><p>Protect, export and restore the local demo dataset.</p></div></div><div class="settings-grid"><button class="pro-setting-action" data-pro-action="backup"><strong>Export backup</strong><span>Download all current records as JSON</span></button><button class="pro-setting-action" data-pro-action="restore"><strong>Restore demo data</strong><span>Reset the browser dataset to the original sample</span></button><button class="pro-setting-action" data-pro-action="clear-audit"><strong>Clear audit log</strong><span>Remove locally stored activity history</span></button><button class="pro-setting-action" data-pro-action="compact"><strong>Compact workspace</strong><span>Toggle dense operational layout</span></button></div></section>');
}
const _dashboard=dashboard,_reservations=reservations,_rooms=rooms,_guests=guests,_housekeeping=housekeeping,_payments=payments,_reports=reports,_settings=settings;
dashboard=function(){_dashboard();proDashboard();};
reservations=function(){_reservations();proReservations();};
rooms=function(){_rooms();proRooms();};
guests=function(){_guests();proGuests();};
housekeeping=function(){_housekeeping();proHousekeeping();};
payments=function(){_payments();proPayments();};
reports=function(){_reports();proReports();};
settings=function(){_settings();proSettings();};

document.addEventListener("change",e=>{
  if(e.target.id==="proRange"){proDashboard();}
});
document.addEventListener("click",e=>{
  const a=e.target.closest("[data-pro-action]");if(!a)return;
  const type=a.dataset.proAction,id=a.dataset.id,guest=a.dataset.guest;
  if(type==="refresh"){setSection(state.section);return;}
  if(type==="checkin"||type==="checkout"){openAction(type,id);return;}
  if(type==="payment"){openAction("payment",id);return;}
  if(type==="details"){
    const b=proBooking(id);if(!b)return;
    proOpen("Reservation "+b.id,"Complete reservation record",
      '<div class="pro-detail-grid"><div><small>Guest</small><strong>'+esc(b.guest)+'</strong></div><div><small>Room</small><strong>'+esc(b.room)+'</strong></div><div><small>Check-in</small><strong>'+esc(b.checkIn)+'</strong></div><div><small>Check-out</small><strong>'+esc(b.checkOut)+'</strong></div><div><small>Amount</small><strong>'+esc(b.amount)+'</strong></div><div><small>Status</small><strong>'+esc(b.status)+'</strong></div></div>',
      ()=>true);return;
  }
  if(type==="edit-booking"){
    const b=proBooking(id);if(!b)return;
    proOpen("Edit reservation","Update stay dates and room",
      '<label>Guest<input name="guest" value="'+esc(b.guest)+'" required></label><div class="form-row"><label>Check-in<input type="date" name="checkIn" value="'+esc(b.checkIn) +'"></label><label>Check-out<input type="date" name="checkOut" value="'+esc(b.checkOut)+'"></label></div><label>Room<input name="room" value="'+esc(b.room)+'"></label><label>Amount<input name="amount" value="'+esc(b.amount)+'"></label>',
      d=>{b.guest=String(d.get("guest"));b.checkIn=String(d.get("checkIn"));b.checkOut=String(d.get("checkOut"));b.room=String(d.get("room"));b.amount=String(d.get("amount"));saveAll();proAudit("Reservation updated",b.id);setSection("Reservations");});return;
  }
  if(type==="room"){
    const r=state.rooms.find(x=>x.id===id);if(!r)return;
    proOpen("Room "+r.id,"Change operational status and rate",
      '<label>Status<select name="status">'+["Available","Checked in","Cleaning","Maintenance"].map(s=>'<option '+(r.status===s?"selected":"")+'>'+s+'</option>').join("")+'</select></label><label>Nightly rate<input name="rate" value="'+esc(r.rate)+'"></label>',
      d=>{r.status=String(d.get("status"));r.rate=String(d.get("rate"));saveAll();proAudit("Room updated","Room "+r.id+" → "+r.status);setSection("Rooms");});return;
  }
  if(type==="task"){
    const t=state.tasks.find(x=>x.id===id);if(!t)return;
    proOpen("Housekeeping task","Update assignment and status",
      '<label>Task<input name="task" value="'+esc(t.task)+'"></label><label>Assignee<input name="assignee" value="'+esc(t.assignee)+'"></label><label>Status<select name="status">'+["Pending","In progress","Completed"].map(s=>'<option '+(t.status===s?"selected":"")+'>'+s+'</option>').join("")+'</select></label>',
      d=>{t.task=String(d.get("task"));t.assignee=String(d.get("assignee"));t.status=String(d.get("status"));saveAll();proAudit("Housekeeping updated","Room "+t.room+" → "+t.status);setSection("Housekeeping");});return;
  }
  if(type==="guest-note"){
    const g=guest;proOpen("Guest notes",g,'<label>Operational note<textarea name="note" rows="5">'+esc(proData.notes[g]||"")+'</textarea></label>',d=>{proData.notes[g]=String(d.get("note")||"");proSave(PRO_STORAGE.notes,proData.notes);proAudit("Guest note updated",g);setSection("Guests");});return;
  }
  if(type==="bulk-clean"){
    const candidates=state.rooms.filter(r=>r.status==="Cleaning");
    candidates.forEach(r=>{if(!state.tasks.some(t=>t.room===r.id&&t.status!=="Completed"))state.tasks.push({id:proId("HK"),room:r.id,task:"Turnover cleaning",assignee:"Unassigned",status:"Pending"});});
    saveAll();proAudit("Cleaning tasks created",candidates.length+" rooms");setSection("Rooms");return;
  }
  if(type==="auto-hk"){
    state.rooms.filter(r=>r.status==="Cleaning").forEach(r=>{if(!state.tasks.some(t=>t.room===r.id&&t.status!=="Completed"))state.tasks.push({id:proId("HK"),room:r.id,task:"Turnover cleaning",assignee:"Housekeeping",status:"Pending"});});
    saveAll();proAudit("Turnover tasks generated","Cleaning rooms");setSection("Housekeeping");return;
  }
  if(type==="reconcile"){
    state.bookings.forEach(b=>{if(!proData.transactions.some(x=>x.bookingId===b.id))proData.transactions.push({id:proId("TX"),bookingId:b.id,amount:b.amount,method:b.paymentMethod||"Card",status:b.paymentStatus||"Pending"});});
    proSave(PRO_STORAGE.payments,proData.transactions);proAudit("Ledger reconciled",state.bookings.length+" reservations");setSection("Payments");return;
  }
  if(type==="export-csv"){
    const header="Booking,Guest,Room,CheckIn,CheckOut,Status,Amount,PaymentStatus,PaymentMethod";
    const rows=state.bookings.map(b=>[b.id,b.guest,b.room,b.checkIn,b.checkOut,b.status,b.amount,b.paymentStatus,b.paymentMethod].map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(","));
    const blob=new Blob([[header].concat(rows).join("\n")],{type:"text/csv;charset=utf-8"});const u=URL.createObjectURL(blob);const x=document.createElement("a");x.href=u;x.download="stayflow-reservations.csv";x.click();URL.revokeObjectURL(u);proAudit("CSV exported","Reservations");
    return;
  }
  if(type==="backup"){
    const payload={version:1,exportedAt:new Date().toISOString(),bookings:state.bookings,rooms:state.rooms,guests:state.guests,tasks:state.tasks,notes:proData.notes,transactions:proData.transactions,audit:proData.audit};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const u=URL.createObjectURL(blob);const x=document.createElement("a");x.href=u;x.download="stayflow-backup.json";x.click();URL.revokeObjectURL(u);proAudit("Backup exported","Complete local dataset");return;
  }
  if(type==="restore"){
    if(confirm("Restore the original StayFlow demo data? Current local changes will be replaced.")){Object.keys(STORAGE).forEach(k=>{try{localStorage.removeItem(STORAGE[k]);}catch(_){}});location.reload();}return;
  }
  if(type==="clear-audit"){proData.audit=[];proSave(PRO_STORAGE.audit,[]);setSection(state.section);return;}
  if(type==="compact"){document.body.classList.toggle("compact-theme");return;}
});

/* --- StayFlow hardening + advanced operations v2 --- */
(function(){
const todayISO=()=>{const d=new Date();d.setHours(0,0,0,0);return d.toISOString().slice(0,10)};
const parseStayDate=(v,offset=0)=>{if(!v)return"";const s=String(v).trim();if(/^\\d{4}-\\d{2}-\\d{2}$/.test(s))return s;if(/^Today$/i.test(s)){const d=new Date();d.setDate(d.getDate()+offset);return d.toISOString().slice(0,10)}const m=s.match(/^([A-Za-z]{3,9})\\s+(\\d{1,2})$/);if(m){const d=new Date(),months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],mi=months.findIndex(x=>m[1].toLowerCase().startsWith(x.toLowerCase()));if(mi>=0){d.setMonth(mi);d.setDate(Number(m[2]));if(d.getTime()<Date.now()-86400000)d.setFullYear(d.getFullYear()+1);return d.toISOString().slice(0,10)}}const d=new Date(s);return isNaN(d)?"":new Date(d.getTime()+offset*86400000).toISOString().slice(0,10)};
const validDate=s=>/^\\d{4}-\\d{2}-\\d{2}$/.test(s)&&!isNaN(new Date(s+"T00:00:00").getTime());
const roomNo=v=>String(v||"").match(/\\d+/)?.[0]||String(v||"");
const notify=(msg,type="success")=>{let n=document.getElementById("sfToast");if(!n){n=document.createElement("div");n.id="sfToast";document.body.appendChild(n)}n.className="sf-toast "+type;n.textContent=msg;n.classList.add("show");clearTimeout(n._t);n._t=setTimeout(()=>n.classList.remove("show"),2800)};
const audit=(a,d)=>{if(typeof proAudit==="function")proAudit(a,d)};
const syncTx=b=>{if(!window.proData)return;let tx=proData.transactions.find(x=>x.bookingId===b.id);if(!tx){tx={id:proId("TX"),bookingId:b.id};proData.transactions.push(tx)}Object.assign(tx,{amount:b.amount,method:b.paymentMethod||"Card",status:b.paymentStatus||"Pending"});proSave(PRO_STORAGE.payments,proData.transactions)};
const saveSafe=()=>{saveAll();state.bookings.forEach(syncTx)};
const overlap=(b,room,ignore)=>{const s=parseStayDate(b.checkIn),e=parseStayDate(b.checkOut);if(!validDate(s)||!validDate(e)||e<=s)return true;return state.bookings.some(x=>x.id!==ignore&&roomNo(x.room)===roomNo(room)&&x.status!=="Checked out"&&parseStayDate(x.checkIn)<e&&parseStayDate(x.checkOut)>s)};
function normalize(){let changed=false;state.bookings.forEach(b=>{let ci=parseStayDate(b.checkIn),co=parseStayDate(b.checkOut);if(validDate(ci)&&b.checkIn!==ci){b.checkIn=ci;changed=true}if(validDate(co)&&b.checkOut!==co){b.checkOut=co;changed=true}if(!b.paymentStatus){b.paymentStatus="Pending";changed=true}if(!b.paymentMethod){b.paymentMethod="Card";changed=true}});if(changed)saveAll()}
function addCalendarNav(){if(document.querySelector('[data-section="Calendar"]'))return;const nav=document.querySelector(".nav"),r=nav?.querySelector('[data-section="Reservations"]');if(!r)return;const a=document.createElement("a");a.href="#";a.dataset.section="Calendar";a.innerHTML='<span class="nav-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M7 2v4M17 2v4M3 9h18M7 13h3M13 13h4M7 17h4"/></svg></span><span>Calendar</span>';r.after(a)}
function calendarPage(){shell("Calendar","Room diary, occupancy and reservation movement",'<div class="welcome-row sf-hero"><div><span class="eyebrow">OPERATIONS</span><h2>Reservation Calendar</h2><p>Room inventory, stays and availability on one timeline.</p></div><div class="sf-actions"><button class="secondary" data-sf-action="prev">‹</button><button class="secondary" data-sf-action="today">Today</button><button class="secondary" data-sf-action="next">›</button><button class="primary" data-action="new-booking">＋ New reservation</button></div></div><section class="panel sf-calendar-panel"><div class="sf-calendar-toolbar"><label>Days<select id="sfCalendarDays"><option>7</option><option selected>14</option><option>21</option></select></label><label>Room type<select id="sfCalendarType"><option>All</option></select></label><span id="sfCalendarMeta"></span></div><div id="sfCalendar"></div></section>');if(!window.sfCalendarStart)window.sfCalendarStart=new Date();renderCalendar()}
function renderCalendar(){const host=document.getElementById("sfCalendar");if(!host)return;const days=Number(document.getElementById("sfCalendarDays")?.value||14),type=document.getElementById("sfCalendarType")?.value||"All",start=new Date(window.sfCalendarStart);start.setHours(0,0,0,0),rooms=state.rooms.filter(r=>type==="All"||r.type===type),dates=Array.from({length:days},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d});const heads=dates.map(d=>'<div class="sf-cal-day"><b>'+d.toLocaleDateString(undefined,{weekday:"short"})+'</b><span>'+d.getDate()+' '+d.toLocaleDateString(undefined,{month:"short"})+'</span></div>').join("");const rows=rooms.map(r=>{const blocks=state.bookings.filter(b=>roomNo(b.room)===roomNo(r.id)&&b.status!=="Checked out").map(b=>{const bs=parseStayDate(b.checkIn),be=parseStayDate(b.checkOut);if(!bs||!be)return"";const si=Math.max(0,Math.round((new Date(bs)-start)/86400000)),ei=Math.min(days,Math.round((new Date(be)-start)/86400000));if(ei<=0||si>=days)return"";const left=si*100/days,width=Math.max(5,(ei-si)*100/days-.6);return'<button class="sf-booking-block status-'+String(b.status).toLowerCase().replaceAll(" ","-")+'" draggable="true" data-sf-booking="'+esc(b.id)+'" style="left:'+left+'%;width:'+width+'%"><strong>'+esc(b.guest)+'</strong><small>'+esc(b.id)+'</small></button>'}).join("");return'<div class="sf-cal-row"><div class="sf-room-label"><strong>'+esc(r.id)+'</strong><span>'+esc(r.type)+' · '+esc(r.status)+'</span></div><div class="sf-cal-track">'+dates.map(()=>'<i></i>').join("")+blocks+'</div></div>'}).join("");host.innerHTML='<div class="sf-calendar-grid"><div class="sf-cal-head"><div class="sf-room-label"><strong>Room</strong><span>Type · status</span></div>'+heads+'</div>'+rows+'</div>';const ts=document.getElementById("sfCalendarType");if(ts&&ts.options.length===1)[...new Set(state.rooms.map(r=>r.type))].forEach(t=>ts.insertAdjacentHTML("beforeend",'<option>'+esc(t)+'</option>'));const meta=document.getElementById("sfCalendarMeta");if(meta)meta.textContent=rooms.length+" rooms · "+days+" days"));
host.querySelectorAll("[data-sf-booking]").forEach(el=>{el.addEventListener("click",()=>{const b=state.bookings.find(x=>x.id===el.dataset.sfBooking);if(b)proOpen("Reservation "+b.id,"Calendar record",'<div class="pro-detail-grid"><div><small>Guest</small><strong>'+esc(b.guest)+'</strong></div><div><small>Room</small><strong>'+esc(b.room)+'</strong></div><div><small>Stay</small><strong>'+esc(b.checkIn)+' → '+esc(b.checkOut)+'</strong></div></div>',()=>true)});el.addEventListener("dragstart",e=>e.dataTransfer.setData("text/plain",btoa(el.dataset.sfBooking))) });
host.querySelectorAll(".sf-cal-track").forEach(track=>{track.addEventListener("dragover",e=>e.preventDefault());track.addEventListener("drop",e=>{e.preventDefault();let id;try{id=atob(e.dataTransfer.getData("text/plain"))}catch(_){return}const b=state.bookings.find(x=>x.id===id),row=track.closest(".sf-cal-row"),room=row?.querySelector(".sf-room-label strong")?.textContent;if(!b||!room)return;const rect=track.getBoundingClientRect(),x=Math.max(0,Math.min(rect.width,e.clientX-rect.left)),offset=Math.floor(x/(rect.width/days)),ns=new Date(start);ns.setDate(ns.getDate()+offset);const oe=new Date(parseStayDate(b.checkOut)),os=new Date(parseStayDate(b.checkIn)),nights=Math.max(1,Math.round((oe-os)/86400000)),ne=new Date(ns);ne.setDate(ne.getDate()+nights);const candidate={...b,room,checkIn:ns.toISOString().slice(0,10),checkOut:ne.toISOString().slice(0,10)};if(overlap(candidate,room,b.id)){notify("Move blocked: room is already booked.","error");return}Object.assign(b,{room,checkIn:candidate.checkIn,checkOut:candidate.checkOut});saveSafe();audit("Reservation moved",b.id+" → room "+room);notify("Reservation moved successfully");renderCalendar()})})}
function replacePrompts(){const old=window.openAction;window.openAction=function(type,id){if(type==="checkin"){const b=state.bookings.find(x=>x.id===id),room=state.rooms.find(r=>r.id===roomNo(b?.room));if(!b||!room)return;if(room.status==="Maintenance"){notify("Cannot check in a maintenance room.","error");return}proOpen("Check-in guest","3-step front desk verification",'<div class="wizard-step"><span>01</span><div><strong>Guest & stay</strong><small>'+esc(b.guest)+' · '+esc(b.checkIn)+' → '+esc(b.checkOut)+'</small></div></div><div class="wizard-step"><span>02</span><div><strong>Room</strong><small>'+esc(room.id)+' · '+esc(room.type)+' · '+esc(room.status)+'</small></div></div><div class="wizard-step"><span>03</span><div><strong>Settlement</strong><small>'+esc(b.paymentStatus||"Pending")+' · '+esc(b.paymentMethod||"Card")+'</small></div></div><label>Arrival note<textarea name="note" rows="3"></textarea></label>',d=>{if(b.status==="Checked in")return false;b.status="Checked in";room.status="Checked in";saveSafe();audit("Guest checked in",b.id);setSection("Dashboard");notify("Check-in completed")});return}if(type==="room-status"&&id==="__new__"){proOpen("Add room","Create inventory without browser prompts",'<div class="form-row"><label>Room number<input name="id" required></label><label>Floor<input name="floor" required></label></div><div class="form-row"><label>Type<select name="type"><option>Classic</option><option>Deluxe</option><option>Suite</option><option>Presidential</option></select></label><label>Nightly rate<input name="rate" value="$180" required></label></div>',d=>{const rid=String(d.get("id")).trim();if(state.rooms.some(r=>r.id===rid)){notify("Room number already exists.","error");return false}state.rooms.push({id:rid,type:String(d.get("type")),floor:String(d.get("floor")),status:"Available",rate:String(d.get("rate"))});saveAll();audit("Room created","Room "+rid);setSection("Rooms");notify("Room added")});return}return old(type,id)}}
const oldSet=window.setSection;window.setSection=function(section){if(section==="Calendar"){calendarPage();return}oldSet(section);if(section==="Dashboard")setTimeout(()=>document.querySelector(".pro-operations")?.scrollIntoView({block:"start"}),0)};
document.addEventListener("click",e=>{const a=e.target.closest("[data-sf-action]");if(!a)return;const n=Number(document.getElementById("sfCalendarDays")?.value||14);if(a.dataset.sfAction==="prev"){window.sfCalendarStart=new Date(window.sfCalendarStart);sfCalendarStart.setDate(sfCalendarStart.getDate()-n);renderCalendar()}if(a.dataset.sfAction==="next"){window.sfCalendarStart=new Date(window.sfCalendarStart);sfCalendarStart.setDate(sfCalendarStart.getDate()+n);renderCalendar()}if(a.dataset.sfAction==="today"){window.sfCalendarStart=new Date();renderCalendar()}});
document.addEventListener("change",e=>{if(e.target.id==="sfCalendarDays"||e.target.id==="sfCalendarType")renderCalendar()});
normalize();addCalendarNav();replacePrompts();window.__stayflowV2={parseStayDate};setTimeout(()=>{try{window.setSection("Dashboard")}catch(e){console.error(e)}},0)
})();
