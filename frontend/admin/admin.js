const API_URL = "http://localhost:4000/rooms";

const roomsContainer = document.getElementById("roomsContainer");
const overviewBookingsContainer = document.getElementById("overviewBookingsContainer");
const bookingsContainer = document.getElementById("bookingsContainer");
const roomForm = document.getElementById("roomForm");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");

// --- Tab Navigation ---
function switchTab(tabId, element) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  } else {
    const defaultNav = document.querySelector(`.nav-item[onclick="switchTab('${tabId}', this)"]`);
    if(defaultNav) defaultNav.classList.add('active');
  }

  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  
  const titles = {
    'overview': 'Dashboard Overview',
    'rooms': 'Manage Rooms',
    'bookings': 'Booking Requests'
  };
  document.getElementById('pageTitle').textContent = titles[tabId] || titles['overview'];
}

// --- Modal Control ---
function openRoomModal() {
  document.getElementById("roomModal").classList.add("show");
}

function closeRoomModal() {
  document.getElementById("roomModal").classList.remove("show");
  clearForm();
}

function getGuestText(capacity) {
  return capacity === 1 ? "guest" : "guests";
}

// --- Rooms Logic ---
async function loadRooms() {
  const response = await fetch(API_URL);
  const rooms = await response.json();

  roomsContainer.innerHTML = "";
  
  let totalRoomsCount = rooms.length;
  let occupiedRoomsCount = rooms.filter(r => r.status === 'Occupied').length;

  document.getElementById("statTotalRooms").textContent = totalRoomsCount;
  document.getElementById("statOccupiedRooms").textContent = occupiedRoomsCount;

  rooms.forEach(function (room) {
    const card = document.createElement("div");
    card.className = "room-card";

    let badgeClass = "badge"; 
    if (room.status === "Occupied") badgeClass = "badge badge-denied"; 
    if (room.status === "Maintenance") badgeClass = "badge badge-pending"; 

    card.innerHTML = `
      <span class="${badgeClass}">${room.status}</span>
      <h3>${room.title}</h3>
      <p><strong>Room:</strong> ${room.roomNumber}</p>
      <p><strong>Type:</strong> ${room.type}</p>
      <p><strong>Capacity:</strong> ${room.capacity} ${getGuestText(room.capacity)}</p>
      <p><strong>Price:</strong> ${room.pricePerNight} RON / night</p>
      <p><strong>Floor:</strong> ${room.floor}</p>
      <p><strong>Balcony:</strong> ${room.hasBalcony ? "Yes" : "No"}</p>
      <p><strong>Amenities:</strong> ${room.amenities ? room.amenities.join(", ") : "No amenities listed"}</p>
      <p>${room.description}</p>

      <div class="card-actions">
        <button class="btn-edit" onclick="editRoom(${room.id})"><i class="bi bi-pencil"></i> Edit</button>
        <button class="btn-delete" onclick="deleteRoom(${room.id})"><i class="bi bi-trash"></i> Delete</button>
      </div>
    `;

    roomsContainer.appendChild(card);
  });
}

function getFormData() {
  return {
    roomNumber: document.getElementById("roomNumber").value,
    title: document.getElementById("title").value,
    type: document.getElementById("type").value,
    capacity: Number(document.getElementById("capacity").value),
    pricePerNight: Number(document.getElementById("pricePerNight").value),
    floor: Number(document.getElementById("floor").value),
    status: document.getElementById("status").value,
    hasBalcony: document.getElementById("hasBalcony").value === "true",
    amenities: document.getElementById("amenities").value.split(",").map(item => item.trim()),
    description: document.getElementById("description").value
  };
}

function clearForm() {
  roomForm.reset();
  document.getElementById("roomId").value = "";
  formTitle.textContent = "Add New Room";
  submitButton.textContent = "Save Room";
}

roomForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const roomId = document.getElementById("roomId").value;
  const roomData = getFormData();

  if (roomId) {
    await fetch(`${API_URL}/${roomId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData)
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(roomData)
    });
  }

  closeRoomModal();
  loadRooms();
});

async function editRoom(id) {
  const response = await fetch(`${API_URL}/${id}`);
  const room = await response.json();

  document.getElementById("roomId").value = room.id;
  document.getElementById("roomNumber").value = room.roomNumber;
  document.getElementById("title").value = room.title;
  document.getElementById("type").value = room.type;
  document.getElementById("capacity").value = room.capacity;
  document.getElementById("pricePerNight").value = room.pricePerNight;
  document.getElementById("floor").value = room.floor;
  document.getElementById("status").value = room.status;
  document.getElementById("hasBalcony").value = String(room.hasBalcony);
  document.getElementById("amenities").value = room.amenities ? room.amenities.join(", ") : "";
  document.getElementById("description").value = room.description;

  formTitle.textContent = "Edit Room";
  submitButton.textContent = "Update Room";

  openRoomModal();
}

async function deleteRoom(id) {
  const confirmDelete = confirm("Are you sure you want to delete this room?");
  if (!confirmDelete) return;

  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadRooms();
}

// --- Bookings Logic ---
async function loadBookings() {
  const response = await fetch("http://localhost:4000/bookings");
  const bookings = await response.json();

  bookingsContainer.innerHTML = "";
  overviewBookingsContainer.innerHTML = "";
  
  let pendingBookings = bookings.filter(b => b.status === "pending");
  document.getElementById("statPendingBookings").textContent = pendingBookings.length;

  bookings.forEach(function (booking) {
    const card = document.createElement("div");
    card.className = "booking-card";

    let badgeClass = "badge-pending";
    if (booking.status === "approved") badgeClass = "badge-approved";
    if (booking.status === "denied") badgeClass = "badge-denied";

    let actionsHtml = "";
    if (booking.status === "pending") {
      actionsHtml = `
        <div class="card-actions">
          <button class="approve-btn" onclick="updateBookingStatus(${booking.id}, 'approved')"><i class="bi bi-check-lg"></i> Approve</button>
          <button class="btn-delete" onclick="updateBookingStatus(${booking.id}, 'denied')"><i class="bi bi-x-lg"></i> Deny</button>
        </div>
      `;
    }

    card.innerHTML = `
      <span class="booking-badge ${badgeClass}">${booking.status.toUpperCase()}</span>
      <h3>${booking.clientName}</h3>
      <p><strong>Email:</strong> ${booking.clientEmail}</p>
      <p><strong>Room ID:</strong> ${booking.roomId}</p>
      <p><strong>Check-in:</strong> ${booking.checkInDate}</p>
      <p><strong>Check-out:</strong> ${booking.checkOutDate}</p>
      ${actionsHtml}
    `;

    bookingsContainer.appendChild(card);
    
    if (booking.status === "pending") {
      const overviewCard = card.cloneNode(true);
      overviewBookingsContainer.appendChild(overviewCard);
    }
  });
  
  if (pendingBookings.length === 0) {
    overviewBookingsContainer.innerHTML = "<p style='color: #8395a7'>No pending requests at the moment.</p>";
  }
}

async function updateBookingStatus(id, status) {
  const confirmUpdate = confirm(`Are you sure you want to mark this booking as ${status}?`);
  if (!confirmUpdate) return;

  await fetch(`http://localhost:4000/bookings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  loadBookings();
  loadRooms();
}

// --- Initialization ---
loadRooms();
loadBookings();