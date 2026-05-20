const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const filePath = "./rooms.json";

function readRooms() {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function writeRooms(rooms) {
  fs.writeFileSync(filePath, JSON.stringify(rooms, null, 2));
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

app.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});