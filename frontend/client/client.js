const API_URL = "http://localhost:4000/rooms";

const clientRoomsContainer = document.getElementById("clientRoomsContainer");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");

let rooms = [];

async function loadClientRooms() {
  const response = await fetch(API_URL);
  rooms = await response.json();

  displayClientRooms();
}

function getGuestText(capacity) {
  return capacity === 1 ? "guest" : "guests";
}

function displayClientRooms() {
  const searchText = searchInput.value.toLowerCase();
  const selectedType = typeFilter.value;

  const filteredRooms = rooms.filter(function (room) {
    const isAvailable = room.status === "Available";

    const matchesSearch =
      room.title.toLowerCase().includes(searchText) ||
      room.type.toLowerCase().includes(searchText) ||
      room.description.toLowerCase().includes(searchText);

    const matchesType =
      selectedType === "All" || room.type === selectedType;

    return isAvailable && matchesSearch && matchesType;
  });

  clientRoomsContainer.innerHTML = "";

  if (filteredRooms.length === 0) {
    clientRoomsContainer.innerHTML = `
      <p class="empty-message">No available rooms found.</p>
    `;
    return;
  }

  filteredRooms.forEach(function (room) {
    const card = document.createElement("div");
    card.className = "room-card";

    card.innerHTML = `
  <span class="badge">${room.type}</span>
  <h3>${room.title}</h3>
<p><strong>Capacity:</strong> ${room.capacity} ${getGuestText(room.capacity)}</p>
<p><strong>Price:</strong> ${room.pricePerNight} RON / night</p>
<p>${room.description}</p>
  <button onclick="viewRoomDetails(${room.id})">View Details</button>
`;

    clientRoomsContainer.appendChild(card);
  });
}

function getAmenityIcon(amenity) {
  switch (amenity.toLowerCase()) {
    case "wi-fi":
    case "wifi":
      return "bi bi-wifi";

    case "tv":
      return "bi bi-tv";

    case "mini fridge":
    case "fridge":
      return "bi bi-snow2";

    case "air conditioning":
      return "bi bi-snow";

    case "coffee machine":
      return "bi bi-cup-hot";

    case "workspace":
      return "bi bi-laptop";

    case "city view":
      return "bi bi-buildings";

    default:
      return "bi bi-check-circle";
  }
}

function renderAmenities(amenities) {
  if (!amenities || amenities.length === 0) {
    return `<span class="amenity-tag"><i class="bi bi-check-circle"></i> Standard room facilities</span>`;
  }

  return amenities
    .map(function (amenity) {
      return `
        <span class="amenity-tag">
          <i class="${getAmenityIcon(amenity)}"></i>
          ${amenity}
        </span>
      `;
    })
    .join("");
}

function viewRoomDetails(roomId) {
  const room = rooms.find(function (room) {
    return room.id === roomId;
  });

  document.getElementById("modalBadge").textContent = room.type;
  document.getElementById("modalTitle").textContent = room.title;

  document.getElementById("modalDetails").innerHTML = `
    <strong>Type:</strong> ${room.type}<br>
    <strong>Capacity:</strong> ${room.capacity} ${getGuestText(room.capacity)}<br>
    <strong>Price:</strong> ${room.pricePerNight} RON / night<br>    <strong>Floor:</strong> ${room.floor}<br>
    <strong>Balcony:</strong> ${room.hasBalcony ? "Yes" : "No"}
  `;

  document.getElementById("modalDescription").innerHTML = `
    <p>${room.description}</p>
    <div class="amenities-list">
      ${renderAmenities(room.amenities)}
    </div>
  `;

  document.getElementById("roomModal").style.display = "flex";
}

function closeRoomModal() {
  document.getElementById("roomModal").style.display = "none";
}


searchInput.addEventListener("input", displayClientRooms);
typeFilter.addEventListener("change", displayClientRooms);

function openExploreModal() {
  document.getElementById("exploreModal").style.display = "flex";
}

function closeExploreModal() {
  document.getElementById("exploreModal").style.display = "none";
}

const exploreImages = [
  "images/img.jpg",
  "images/img2.jpg",
  "images/img4.jpg",
  "images/img5.jpg",
  "images/img7.jpg"
];

let currentSlide = 0;

function updateSlide() {
  const slideImage = document.getElementById("slideImage");
  const dots = document.querySelectorAll(".dot");

  slideImage.src = exploreImages[currentSlide];

  dots.forEach(function (dot, index) {
    if (index === currentSlide) {
      dot.classList.add("active-dot");
    } else {
      dot.classList.remove("active-dot");
    }
  });
}

function changeSlide(direction) {
  currentSlide = currentSlide + direction;

  if (currentSlide < 0) {
    currentSlide = exploreImages.length - 1;
  }

  if (currentSlide >= exploreImages.length) {
    currentSlide = 0;
  }

  updateSlide();
}

function setSlide(index) {
  currentSlide = index;
  updateSlide();
}

loadClientRooms();