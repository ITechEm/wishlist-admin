import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
