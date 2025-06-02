import Revenue from '../model/revenue.js'
import User from '../model/user.js'

const revenueController = {
  async recordTransaction(req, res) {
    try {
      const { walletAddress, transactionHash, transactionTime, tokenAmount, tokenSymbol, usdAmount } = req.body

      // Check if wallet exists, if not create it
      let user = await User.findOne({ wallet_address: walletAddress })
      if (!user) {
        user = await User.create({
          wallet_address: walletAddress,
          role: 'user',
        })
      }

      // Check if transaction already recorded
      const existingTx = await Revenue.findOne({ transactionHash })
      if (existingTx) {
        return res.status(400).json({ message: 'Transaction already recorded' })
      }

      // Calculate total USD traded for this wallet
      const totalTraded = await Revenue.aggregate([
        { $match: { walletAddress } },
        { $group: { _id: null, total: { $sum: '$usdAmount' } } },
      ])

      const totalUsdTraded = (totalTraded[0]?.total || 0) + usdAmount

      // Record the transaction
      const revenue = await Revenue.create({
        walletAddress,
        transactionHash,
        transactionTime,
        tokenAmount,
        tokenSymbol,
        usdAmount,
        totalUsdTraded,
      })

      res.status(201).json({
        message: 'Transaction recorded successfully',
        revenue,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error recording transaction' })
    }
  },

  async getWalletTransactions(req, res) {
    try {
      const { walletAddress } = req.params
      const { page = 1, limit = 10 } = req.query

      const transactions = await Revenue.find({ walletAddress })
        .sort({ transactionTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

      const total = await Revenue.countDocuments({ walletAddress })

      res.status(200).json({
        transactions,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching transactions' })
    }
  },

  async getRevenueStats(req, res) {
    try {
      const { startDate, endDate } = req.query

      const matchStage = {}
      if (startDate && endDate) {
        matchStage.transactionTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        }
      }

      const stats = await Revenue.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalUsdVolume: { $sum: '$usdAmount' },
            totalTransactions: { $sum: 1 },
            uniqueWallets: { $addToSet: '$walletAddress' },
          },
        },
        {
          $project: {
            _id: 0,
            totalUsdVolume: 1,
            totalTransactions: 1,
            uniqueWallets: { $size: '$uniqueWallets' },
          },
        },
      ])

      res.status(200).json(
        stats[0] || {
          totalUsdVolume: 0,
          totalTransactions: 0,
          uniqueWallets: 0,
        },
      )
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching revenue stats' })
    }
  },

  async getTopTraders(req, res) {
    try {
      const { limit = 10 } = req.query

      const topTraders = await Revenue.aggregate([
        {
          $group: {
            _id: '$walletAddress',
            totalUsdTraded: { $sum: '$usdAmount' },
            transactionCount: { $sum: 1 },
          },
        },
        { $sort: { totalUsdTraded: -1 } },
        { $limit: parseInt(limit) },
      ])

      res.status(200).json({ topTraders })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching top traders' })
    }
  },
}
export default revenueController
