import crypto from 'crypto'

import Referral from '../model/referral.js'
import User from '../model/user.js'

const referralController = {
  async generateReferralCode(req, res) {
    try {
      const userId = req.user.id

      // Check if user already has a referral code
      const existingUser = await User.findById(userId)
      if (existingUser.referralCode) {
        return res.status(200).json({ referralCode: existingUser.referralCode })
      }

      // Generate unique referral code
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase()

      // Update user with referral code
      await User.findByIdAndUpdate(userId, { referralCode })

      res.status(200).json({ referralCode })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error generating referral code' })
    }
  },

  async validateReferralCode(req, res) {
    try {
      const { referralCode } = req.params

      const referrer = await User.findOne({ referralCode })
      if (!referrer) {
        return res.status(404).json({ message: 'Invalid referral code' })
      }

      res.status(200).json({
        valid: true,
        referrerId: referrer._id,
        referrerName: referrer.name || referrer.email,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error validating referral code' })
    }
  },

  async registerReferral(req, res) {
    try {
      const { referralCode, walletAddress } = req.body

      // Find referrer
      const referrer = await User.findOne({ referralCode })
      if (!referrer) {
        return res.status(404).json({ message: 'Invalid referral code' })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ walletAddress })
      if (existingUser) {
        // Check if user already has a referrer
        const existingReferral = await Referral.findOne({ referee: existingUser._id })
        if (existingReferral) {
          return res.status(400).json({ message: 'User already has a referrer' })
        }
      }

      // Create or update user
      let user = existingUser
      if (!user) {
        user = await User.create({
          walletAddress,
          role: 'user',
        })
      }

      // Create referral
      const referral = await Referral.create({
        referrer: referrer._id,
        referee: user._id,
        referralCode,
        status: 'active',
      })

      res.status(201).json({
        message: 'Referral registered successfully',
        referral,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error registering referral' })
    }
  },

  async getReferrals(req, res) {
    try {
      const userId = req.user.id

      const referrals = await Referral.find({ referrer: userId })
        .populate('referee', 'walletAddress createdAt')
        .sort({ createdAt: -1 })

      res.status(200).json({ referrals })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error fetching referrals' })
    }
  },
}

export default referralController
