import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import crypto from 'crypto'

import User from '../model/user.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@example.com'

// Configure nodemailer (you'll need to set these env variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }

      if (!user.emailVerified) {
        return res.status(401).json({ message: 'Please verify your email first' })
      }

      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' })

      user.lastLogin = new Date()
      await user.save()

      res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
        },
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error during login' })
    }
  },

  async createAdmin(req, res) {
    try {
      const { email, name } = req.body

      // Check if requester is super_admin
      const requesterId = req.user.id
      const requester = await User.findById(requesterId)
      if (requester.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admin can create admins' })
      }
      const found = await User.findOne({ email })
      if (found) {
        return res.status(400).json({ message: 'Admin already exists' })
      }
      // Generate temporary password and reset token
      const tempPassword = crypto.randomBytes(8).toString('hex')
      const passwordResetToken = crypto.randomBytes(32).toString('hex')

      const newAdmin = await User.create({
        email,
        name,
        role: 'admin',
        password: tempPassword,
        passwordResetToken,
        passwordResetExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })

      // Send email with password setup link
      const resetUrl = `${process.env.FRONTEND_URL}/set-password?token=${passwordResetToken}`

      await transporter.sendMail({
        from: EMAIL_FROM,
        to: email,
        subject: 'Admin Account Creation - Set Your Password',
        html: `
          <p>You have been added as an admin.</p>
          <p>Please click the following link to set your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 24 hours.</p>
        `,
      })

      res.status(201).json({
        message: 'Admin created successfully. Password setup email sent.',
        adminId: newAdmin._id,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error creating admin' })
    }
  },

  async setPassword(req, res) {
    try {
      const { token, password } = req.body

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      })

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' })
      }

      user.password = password
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      user.emailVerified = true

      await user.save()

      res.status(200).json({ message: 'Password set successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error setting password' })
    }
  },
  async getDtail(req, res) {
    try {
      const user = req.user
      const data = {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
      res.status(200).json({ message: 'success', data, status: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error setting password' })
    }
  },

  async getUsers(req, res) {
    try {
      const type=req.query.type
      let query={}
      if(type==="admin"){
        query={$or:[{role:"admin"},{role:"super_admin"}]}
      }else{
        query={role:"user"}
      }
      const users=await User.find(query).select("-password")
      res.status(200).json({ message: 'success', data:users, status: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error setting password' })
    }
  },

  async removeAdmin(req, res) {
    try {
      const { adminId } = req.params

      // Check if requester is super_admin
      const requesterId = req.user.id
      const requester = await User.findById(requesterId)
      if (requester.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admin can remove admins' })
      }

      const admin = await User.findById(adminId)
      if (!admin || admin.role !== 'admin') {
        return res.status(404).json({ message: 'Admin not found' })
      }

      await User.findByIdAndDelete(adminId)

      res.status(200).json({ message: 'Admin removed successfully' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Error removing admin' })
    }
  },
}

export default authController
