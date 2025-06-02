import db from '../config/db.js'

const referralSchema = new db.Schema(
  {
    referrer: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referee: {
      type: db.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for faster lookups
referralSchema.index({ referrer: 1 })
referralSchema.index({ referee: 1 })
referralSchema.index({ referralCode: 1 })

const Referral = db.model('Referral', referralSchema)

export default Referral
