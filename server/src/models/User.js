const mongoose = require('mongoose');

const dayHoursSchema = new mongoose.Schema(
  {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    isOpen: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    businessSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    workingHours: {
      monday: { type: dayHoursSchema, default: () => ({}) },
      tuesday: { type: dayHoursSchema, default: () => ({}) },
      wednesday: { type: dayHoursSchema, default: () => ({}) },
      thursday: { type: dayHoursSchema, default: () => ({}) },
      friday: { type: dayHoursSchema, default: () => ({}) },
      saturday: { type: dayHoursSchema, default: () => ({ isOpen: false }) },
      sunday: { type: dayHoursSchema, default: () => ({ isOpen: false }) },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
