const state = {
  section: "Dashboard",
  notifications: 3,
  bookings: JSON.parse(localStorage.getItem("stayflow_bookings") || "null") || [
    {id:"BK-1042",guest:"Olivia Carter",room:"Deluxe 204",checkIn:"Today",checkOut:"Oct 10",status:"Checked in",amount:"$540"},
    {id:"BK-1041",guest:"Noah Williams",room:"Suite 508",checkIn:"Today",checkOut:"Oct 12",status:"Reserved",amount:"$920"},
    {id:"BK-1039",guest:"Emma Johnson",room:"Classic 118",checkIn:"Oct 7",checkOut:"Oct 9",status:"Checked out",amount:"$310"},
    {id:"BK-1038",guest:"Liam Brown",room:"Deluxe 302",checkIn:"Oct 6",checkOut:"Oct 8",status:"Reserved",amount:"$460"}
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
    {room:"204",task:"Turnover cleaning",assignee:"Maria",status:"In progress"},
    {room:"302",task:"Deep cleaning",assignee:"James",status:"Pending"},
    {room:"118",task:"Restock minibar",assignee:"Ava",status:"Completed"}
  ]
};

const $ = (selector) => document.querySelector(selector);
const save = () => localStorage.setItem("stayflow_bookings", JSON.stringify(state.bookings));
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));
const badge = (value) => {
  const safe = esc(value);
  const cls = String(value).toLowerCase().replaceAll(" ","-");
  return '<span class="status status-' + cls + '">' + safe + '</span>';
};

function shell(title, subtitle, body) {
  $("#pageTitle").textContent = title;
  $("#pageSubtitle").textContent = subtitle;
  $("#workspace").innerHTML = body;
  document.querySelectorAll("[data-section]").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === title);
  });
}

function bookingPanel() {
  return '<section class="panel bookings-panel"><div class="panel-head"><div><h3>Recent reservations</h3><p>Latest booking activity</p></div><div class="panel-tools"><input id="bookingSearch" placeholder="Search reservations..." aria-label="Search reservations"><a href="#" data-section="Reservations">View all →</a></div></div><div class="table-wrap"><table><thead><tr><th>Booking</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Amount</th></tr></thead><tbody id="bookingRows"></tbody></table></div></section>';
}

function renderBookings(filter = "") {
  const el = $("#bookingRows");
  if (!el) return;
  const query = filter.toLowerCase();
  const rows = state.bookings.filter((booking) =>
    Object.values(booking).join(" ").toLowerCase().includes(query)
  );
  el.innerHTML = rows.map((booking) =>
    "<tr><td><strong>" + esc(booking.id) + "</strong></td><td>" + esc(booking.guest) +
    "</td><td>" + esc(booking.room) + "</td><td>" + esc(booking.checkIn) +
    "</td><td>" + esc(booking.checkOut) + "</td><td>" + badge(booking.status) +
    "</td><td><strong>" + esc(booking.amount) + "</strong></td></tr>"
  ).join("") || '<tr><td colspan="7" class="empty">No bookings found.</td></tr>';
}

function dashboard() {
  shell("Dashboard", "Overview of today's hotel operations",
    '<div class="welcome-row"><div><h2>Good morning, Alex</h2><p>Here\'s what is happening at Grand Aurora today.</p></div><button class="primary" data-action="new-booking">＋ New reservation</button></div>' +
    '<div class="stats-grid">' +
    '<article class="stat-card"><div class="stat-top"><span>Occupancy</span><span class="trend up">↗ 8.2%</span></div><strong>78.4%</strong><small>vs. 72.5% last week</small><div class="mini-chart"><i style="height:35%"></i><i style="height:52%"></i><i style="height:42%"></i><i style="height:67%"></i><i style="height:58%"></i><i style="height:78%"></i><i style="height:86%"></i></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Today\'s revenue</span><span class="trend up">↗ 12.4%</span></div><strong>$12,840</strong><small>vs. $11,420 yesterday</small><div class="mini-chart"><i style="height:28%"></i><i style="height:48%"></i><i style="height:43%"></i><i style="height:62%"></i><i style="height:55%"></i><i style="height:72%"></i><i style="height:90%"></i></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Arrivals</span><span class="neutral">Today</span></div><strong>24</strong><small>18 rooms ready</small><div class="progress"><span style="width:72%"></span></div></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Departures</span><span class="neutral">Today</span></div><strong>17</strong><small>12 rooms cleared</small><div class="progress warning"><span style="width:42%"></span></div></article></div>' +
    '<div class="grid-two"><section class="panel occupancy-panel"><div class="panel-head"><div><h3>Occupancy overview</h3><p>Room occupancy over the last 7 days</p></div><select aria-label="Occupancy period"><option>Last 7 days</option><option>Last 30 days</option></select></div><div class="bar-chart">' +
    [54,68,61,76,71,84,78].map((height, i) => '<div><span style="height:' + height + '%"></span><label>' + ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i] + "</label></div>").join("") +
    '</div></section><section class="panel room-panel"><div class="panel-head"><div><h3>Room status</h3><p>Current room inventory</p></div><a href="#" data-section="Rooms">View all →</a></div><div class="room-list"><div><span class="room-dot occupied"></span><span>Occupied</span><strong>86</strong></div><div><span class="room-dot available"></span><span>Available</span><strong>28</strong></div><div><span class="room-dot cleaning"></span><span>Cleaning</span><strong>12</strong></div><div><span class="room-dot maintenance"></span><span>Maintenance</span><strong>4</strong></div></div><div class="donut"><div><strong>130</strong><small>Total rooms</small></div></div></section></div>' +
    bookingPanel()
  );
  renderBookings();
  const search = $("#bookingSearch");
  if (search) search.oninput = (event) => renderBookings(event.target.value);
}

function reservations() {
  shell("Reservations", "Manage bookings and guest stays",
    '<div class="welcome-row"><div><h2>Reservations</h2><p>Create, search and monitor every booking.</p></div><button class="primary" data-action="new-booking">＋ New reservation</button></div>' + bookingPanel()
  );
  renderBookings();
  const search = $("#bookingSearch");
  if (search) search.oninput = (event) => renderBookings(event.target.value);
}

function tablePage(title, subtitle, headers, rows) {
  shell(title, subtitle,
    '<div class="welcome-row"><div><h2>' + title + '</h2><p>' + subtitle + '.</p></div></div><section class="panel"><div class="table-wrap"><table><thead><tr>' +
    headers.map((header) => "<th>" + header + "</th>").join("") +
    "</tr></thead><tbody>" + rows.join("") + "</tbody></table></div></section>"
  );
}

function rooms() {
  tablePage("Rooms", "Manage room inventory and availability",
    ["Room","Type","Floor","Status","Nightly rate"],
    state.rooms.map((room) => "<tr><td><strong>" + esc(room.id) + "</strong></td><td>" + esc(room.type) + "</td><td>" + esc(room.floor) + "</td><td>" + badge(room.status) + "</td><td><strong>" + esc(room.rate) + "</strong></td></tr>")
  );
}

function guests() {
  tablePage("Guests", "Manage guest profiles and stay history",
    ["Guest","Bookings","Current status"],
    state.guests.map((guest) => {
      const booking = state.bookings.find((item) => item.guest === guest);
      return "<tr><td><strong>" + esc(guest) + "</strong></td><td>" + state.bookings.filter((item) => item.guest === guest).length + "</td><td>" + badge(booking?.status || "No active stay") + "</td></tr>";
    })
  );
}

function housekeeping() {
  tablePage("Housekeeping", "Track cleaning and room service tasks",
    ["Room","Task","Assignee","Status"],
    state.tasks.map((task) => "<tr><td><strong>" + esc(task.room) + "</strong></td><td>" + esc(task.task) + "</td><td>" + esc(task.assignee) + "</td><td>" + badge(task.status) + "</td></tr>")
  );
}

function payments() {
  tablePage("Payments", "Track charges and payment status",
    ["Booking","Guest","Amount","Status"],
    state.bookings.map((booking) => "<tr><td><strong>" + esc(booking.id) + "</strong></td><td>" + esc(booking.guest) + "</td><td>" + esc(booking.amount) + "</td><td>" + badge(booking.status === "Checked out" ? "Paid" : "Pending") + "</td></tr>")
  );
}

function reports() {
  const revenue = state.bookings.reduce((sum, booking) =>
    sum + (parseFloat(String(booking.amount).replace(/[^0-9.]/g, "")) || 0), 0
  );
  shell("Reports", "Review operational performance",
    '<div class="welcome-row"><div><h2>Performance reports</h2><p>Live calculations from the current browser dataset.</p></div></div>' +
    '<div class="stats-grid">' +
    '<article class="stat-card"><div class="stat-top"><span>Bookings</span></div><strong>' + state.bookings.length + '</strong><small>Current records</small></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Booking value</span></div><strong>$' + revenue.toLocaleString() + '</strong><small>Current reservation value</small></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Rooms</span></div><strong>' + state.rooms.length + '</strong><small>Inventory sample</small></article>' +
    '<article class="stat-card"><div class="stat-top"><span>Tasks</span></div><strong>' + state.tasks.length + '</strong><small>Housekeeping tasks</small></article></div>'
  );
}

function simple(title) {
  shell(title, "Manage " + title.toLowerCase() + " and operational activity",
    '<div class="welcome-row"><div><h2>' + title + '</h2><p>Operational workspace ready for backend integration.</p></div></div><section class="panel"><h3>' + title + ' workspace</h3><p>Interface, navigation and responsive layout are implemented. Connect a production API/database for persistent multi-user data.</p></section>'
  );
}

function setSection(section) {
  state.section = section;
  const pages = {Dashboard:dashboard, Reservations:reservations, Rooms:rooms, Guests:guests, Housekeeping:housekeeping, Payments:payments, Reports:reports};
  (pages[section] || (() => simple(section)))();
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-section]");
  if (nav) {
    event.preventDefault();
    setSection(nav.dataset.section);
    return;
  }
  if (event.target.closest('[data-action="new-booking"]')) {
    const modal = $("#bookingModal");
    if (modal?.showModal) modal.showModal();
  }
  if (event.target.closest('[data-action="close-modal"]')) {
    $("#bookingModal")?.close();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "newBookingForm") return;
  event.preventDefault();
  const data = new FormData(event.target);
  state.bookings.unshift({
    id: "BK-" + (1043 + state.bookings.length),
    guest: data.get("guest"),
    room: data.get("room"),
    checkIn: data.get("checkin"),
    checkOut: data.get("checkout"),
    status: "Reserved",
    amount: data.get("amount") || "$0"
  });
  save();
  $("#bookingModal")?.close();
  setSection("Reservations");
});

document.addEventListener("DOMContentLoaded", () => {
  const year = $("#yearLabel");
  if (year) year.textContent = new Date().getFullYear();

  const notificationBtn = $("#notificationBtn");
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      state.notifications = 0;
      const count = $("#notificationCount");
      if (count) count.textContent = "0";
      notificationBtn.setAttribute("aria-label", "No unread notifications");
    });
  }

  dashboard();
});