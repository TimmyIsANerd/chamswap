import express from 'express';

import authController from '../controllers/authController.js';
import projectSettingsController from '../controllers/projectSettingsController.js';
import revenueController from '../controllers/revenueController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {login_body, validate} from "../schema.js"

const router = express.Router();

// Auth routes
router.post('/auth/login',login_body, validate, authController.login);
router.post('/auth/set-password', authController.setPassword);
router.post('/auth/admin', authenticate, authorize(['super_admin']), authController.createAdmin);
router.get('/auth/admin', authenticate, authController.getDtail);
router.get('/auth/users', authenticate, authController.getUsers);
router.delete('/auth/admin/:adminId', authenticate, authorize(['super_admin']), authController.removeAdmin);

// Project Settings routes
router.get('/settings', authenticate, projectSettingsController.getSettings);
router.post('/settings', authenticate, authorize(['admin', 'super_admin']), projectSettingsController.updateSettings);
router.get('/settings/history', authenticate, authorize(['admin', 'super_admin']), projectSettingsController.getSettingsHistory);

// Revenue routes
router.post('/revenue/transaction', revenueController.recordTransaction);
router.get('/revenue/wallet/:walletAddress', authenticate, revenueController.getWalletTransactions);
router.get('/revenue/stats', authenticate, authorize(['admin', 'super_admin']), revenueController.getRevenueStats);
router.get('/revenue/top-traders', authenticate, authorize(['admin','super_admin']), revenueController.getTopTraders);

export default router;