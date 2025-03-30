import bcrypt from 'bcryptjs';

import db from "../config/db.js";


const schema = new db.Schema(
  {
    wallet_address: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      required: function() {
        return this.role === 'admin' || this.role === 'super_admin';
      }
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      enum: ['super_admin', 'admin', 'user'],
      default: "user"
    },
    passwordResetToken: {
      type: String,
      trim: true
    },
    passwordResetExpires: {
      type: Date
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    reffer_code: {
      type: String,
      trim: true,
    },
    point: {
      type: Number,
      default: 0
    },
    reffer_by: {
      type: String,
      trim: true,
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
    collection: "users",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Password hashing middleware
schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
schema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

schema.virtual("referrals", {
  ref: "User",
  localField: "reffer_code",
  foreignField: "reffer_by",
  options: {
    sort: { order: 1 },
    lean: true,
  },
});

const User = db.model("User", schema);
User.syncIndexes().catch((e) => console.log(e));

export default User;