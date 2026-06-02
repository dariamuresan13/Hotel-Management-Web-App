const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const filePath = "./rooms.json";
const bookingsFilePath = "./bookings.json";

function readRooms() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function writeRooms(rooms) {
  fs.writeFileSync(filePath, JSON.stringify(rooms, null, 2));
}

function readBookings() {
  const data = fs.readFileSync(bookingsFilePath, "utf8");
  return JSON.parse(data);
}

function writeBookings(bookings) {
  fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2));
}

app.get("/", function (req, res) {
  res.json("Hotel Room Management API is running");
});

app.get("/rooms", function (req, res) {
  const rooms = readRooms();
  res.json(rooms);
});

app.get("/rooms/:id", function (req, res) {
  const rooms = readRooms();
  const id = parseInt(req.params.id);

  const room = rooms.find(function (room) {
    return room.id === id;
  });

  if (!room) {
    return res.status(404).json("Room not found");
  }

  res.json(room);
});

app.post("/rooms", function (req, res) {
  const rooms = readRooms();

  const newRoom = {
    id: rooms.length > 0 ? rooms[rooms.length - 1].id + 1 : 1,
    roomNumber: req.body.roomNumber,
    title: req.body.title,
    type: req.body.type,
    capacity: Number(req.body.capacity),
    pricePerNight: Number(req.body.pricePerNight),
    floor: Number(req.body.floor),
    status: req.body.status,
    hasBalcony: Boolean(req.body.hasBalcony),
    amenities: req.body.amenities,
    description: req.body.description
  };

  rooms.push(newRoom);
  writeRooms(rooms);

  res.status(201).json(newRoom);
});

app.put("/rooms/:id", function (req, res) {
  const rooms = readRooms();
  const id = parseInt(req.params.id);

  const index = rooms.findIndex(function (room) {
    return room.id === id;
  });

  if (index === -1) {
    return res.status(404).json("Room not found");
  }

  rooms[index] = {
    id: id,
    roomNumber: req.body.roomNumber,
    title: req.body.title,
    type: req.body.type,
    capacity: Number(req.body.capacity),
    pricePerNight: Number(req.body.pricePerNight),
    floor: Number(req.body.floor),
    status: req.body.status,
    hasBalcony: Boolean(req.body.hasBalcony),
    amenities: req.body.amenities,
    description: req.body.description
  };

  writeRooms(rooms);

  res.json(rooms[index]);
});

app.delete("/rooms/:id", function (req, res) {
  const rooms = readRooms();
  const id = parseInt(req.params.id);

  const filteredRooms = rooms.filter(function (room) {
    return room.id !== id;
  });

  if (rooms.length === filteredRooms.length) {
    return res.status(404).json("Room not found");
  }

  writeRooms(filteredRooms);

  res.json("Room deleted successfully");
});

app.get("/bookings", function (req, res) {
  const bookings = readBookings();
  res.json(bookings);
});

app.post("/bookings", function (req, res) {
  const bookings = readBookings();

  const newBooking = {
    id: bookings.length > 0 ? bookings[bookings.length - 1].id + 1 : 1,
    roomId: Number(req.body.roomId),
    clientName: req.body.clientName,
    clientEmail: req.body.clientEmail,
    checkInDate: req.body.checkInDate,
    checkOutDate: req.body.checkOutDate,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  bookings.push(newBooking);
  writeBookings(bookings);

  res.status(201).json(newBooking);
});

app.put("/bookings/:id", function (req, res) {
  const bookings = readBookings();
  const id = parseInt(req.params.id);

  const index = bookings.findIndex(function (b) {
    return b.id === id;
  });

  if (index === -1) {
    return res.status(404).json("Booking not found");
  }

  const newStatus = req.body.status;
  bookings[index].status = newStatus;

  writeBookings(bookings);

  if (newStatus === "approved") {
    const rooms = readRooms();
    const roomIndex = rooms.findIndex(function (r) {
      return r.id === bookings[index].roomId;
    });

    if (roomIndex !== -1) {
      rooms[roomIndex].status = "Occupied";
      writeRooms(rooms);
    }
  }

  res.json(bookings[index]);
});

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});