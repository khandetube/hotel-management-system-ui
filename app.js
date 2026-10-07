const state = {
  section: "Dashboard",
  notifications: 3,
  bookings: [
    { id: "BK-1042", guest: "Olivia Carter", room: "Deluxe 204", checkIn: "Today", checkOut: "Oct 10", status: "Checked in", amount: "$540" },
    { id: "BK-1041", guest: "Noah Williams", room: "Suite 508", checkIn: "Today", checkOut: "Oct 12", status: "Reserved", amount: "$920" },
    { id: "BK-1039", guest: "Emma Johnson", room: "Classic 118", checkIn: "Oct 7", checkOut: "Oct 9", status: "Checked out", amount: "$310" },
    { id: "BK-1038", guest: "Liam Brown", room: "Deluxe 302", checkIn: "Oct 6", checkOut: "Oct 8", status: "Reserved", amount: "$460" }
  ]
};

const $ = (selector) => document.querySelector(selector);

function renderBookings(filter = "") {
  const rows = state.bookings
    .filter((b) => Object.values(b).join(" ").toLowerCase().includes(filter.toLowerCase()))
    .map((b) => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td>${b.guest}</td>
        <td>${b.room}</td>
        <td>${b.checkIn}</td>
        <td>${b.checkOut}</td>
        <td><span class="status status-${b.status.toLowerCase().replaceAll(" ", "-")}">${b.status}</span></td>
        <td><strong>${b.amount}</strong></td>
      </tr>
    `).join("");

  $("#bookingRows").innerHTML = rows || '<tr><td colspan="7" class="empty">No bookings found.</td></tr>';
}

function setSection(section) {
  state.section = section;
  document.querySelectorAll("[data-section]").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === section);
  });
  $("#pageTitle").textContent = section;
  $("#pageSubtitle").textContent = section === "Dashboard"
    ? "Overview of today's hotel operations"
    : `Manage ${section.toLowerCase()} and operational activity`;
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-section]");
  if (nav) {
    event.preventDefault();
    setSection(nav.dataset.section);
  }

  const action = event.target.closest("[data-action]");
  if (action?.dataset.action === "new-booking") {
    $("#bookingModal").showModal();
  }

  if (action?.dataset.action === "close-modal") {
    $("#bookingModal").close();
  }
});

$("#bookingSearch").addEventListener("input", (event) => renderBookings(event.target.value));

$("#newBookingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  state.bookings.unshift({
    id: `BK-${1043 + state.bookings.length}`,
    guest: data.get("guest"),
    room: data.get("room"),
    checkIn: data.get("checkin"),
    checkOut: data.get("checkout"),
    status: "Reserved",
    amount: data.get("amount") || "$0"
  });
  renderBookings($("#bookingSearch").value);
  event.currentTarget.reset();
  $("#bookingModal").close();
});

$("#yearLabel").textContent = new Date().getFullYear();
renderBookings();
