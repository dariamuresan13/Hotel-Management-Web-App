const API_URL = "http://localhost:4000/rooms";

const roomsContainer = document.getElementById("roomsContainer");
const roomForm = document.getElementById("roomForm");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");

function getGuestText(capacity) {
  return capacity === 1 ? "guest" : "guests";
}

async function loadRooms() {
  const response = await fetch(API_URL);
  const rooms = await response.json();

  roomsContainer.innerHTML = "";

  rooms.forEach(function (room) {
    const card = document.createElement("div");
    card.className = "room-card";

card.innerHTML = `
  <span class="badge">${room.status}</span>
  <h3>${room.title}</h3>
  <p><strong>Room:</strong> ${room.roomNumber}</p>
  <p><strong>Type:</strong> ${room.type}</p>
  <p><strong>Capacity:</strong> ${room.capacity} ${getGuestText(room.capacity)}</p>  <p><strong>Price:</strong> ${room.pricePerNight} RON / night</p>
  <p><strong>Floor:</strong> ${room.floor}</p>
  <p><strong>Balcony:</strong> ${room.hasBalcony ? "Yes" : "No"}</p>
  <p><strong>Amenities:</strong> ${room.amenities ? room.amenities.join(", ") : "No amenities listed"}</p>
  <p>${room.description}</p>

  <div class="card-actions">
    <button onclick="editRoom(${room.id})">Edit</button>
    <button class="delete-btn" onclick="deleteRoom(${room.id})">Delete</button>
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
    amenities: document.getElementById("amenities").value.split(",").map(function (item) {
  return item.trim();
}),
    description: document.getElementById("description").value
  };
}

function clearForm() {
  roomForm.reset();
  document.getElementById("roomId").value = "";
  formTitle.textContent = "Add New Room";
  submitButton.textContent = "Add Room";
}

roomForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const roomId = document.getElementById("roomId").value;
  const roomData = getFormData();

  if (roomId) {
    await fetch(`${API_URL}/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(roomData)
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(roomData)
    });
  }

  clearForm();
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
  document.getElementById("amenities").value = room.amenities.join(", ");
  document.getElementById("description").value = room.description;

  formTitle.textContent = "Edit Room";
  submitButton.textContent = "Update Room";

  window.scrollTo({
    top: 250,
    behavior: "smooth"
  });
}

async function deleteRoom(id) {
  const confirmDelete = confirm("Are you sure you want to delete this room?");

  if (!confirmDelete) {
    return;
  }

  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  loadRooms();
}

cancelButton.addEventListener("click", clearForm);

loadRooms();