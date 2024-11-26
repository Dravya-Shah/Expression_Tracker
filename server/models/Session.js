
 // server/models/Session.js
const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  image: String,
  expression: String,
});

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  analyses: [AnalysisSchema],
  overallAnalysis: {
    happy: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    // Add other expressions as needed
  },
});

const Session = mongoose.model('Session', SessionSchema);

const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://leela:leeladhari@cluster0.aokrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true }
});

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

async function seedData() {
  const users = [
    { name: "admin", password: "admin123", role: "admin", phone: "1234567890" },
    { name: "kid1", password: "kid123", role: "kid", phone: "0987654321" }
  ];

  try {
    await UserProfile.insertMany(users);
    console.log("Static user data has been seeded successfully.");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding user data:", error);
  }
}

seedData();



module.exports = Session;
