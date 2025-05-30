import db from '../config/db.js'

const revenueSchema = new db.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      ref: 'User',
    },
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    transactionTime: {
      type: Date,
      required: true,
    },
    tokenAmount: {
      type: String, // Using string to handle large numbers precisely
      required: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    usdAmount: {
      type: Number,
      required: true,
    },
    totalUsdTraded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'revenue',
  },
)

// Index for faster wallet lookups
revenueSchema.index({ walletAddress: 1 })

const Revenue = db.model('Revenue', revenueSchema)
Revenue.syncIndexes().catch((e) => console.log(e))
export default Revenue
