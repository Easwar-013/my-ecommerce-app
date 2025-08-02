const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const customerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  }
}, {
  // This is important to include virtuals when converting to JSON.
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// A virtual property `name` that gets the full name and can set it.
customerSchema.virtual('name')
  .get(function() {
    return (this.firstname && this.lastname) ? `${this.firstname} ${this.lastname}` : 'N/A';
  })
  .set(function(v) {
    // Handle null, undefined, or non-string values gracefully
    if (v == null || typeof v !== 'string') {
      this.firstname = undefined;
      this.lastname = undefined;
      return;
    }
    // Basic name splitting, assumes "firstname lastname" format
    const parts = v.trim().split(' ');
    this.firstname = parts[0];
    this.lastname = parts.slice(1).join(' ');
  });

// Add a virtual property for isActive based on the status field.
customerSchema.virtual('isActive').get(function() {
  return this.status === 'Active';
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
