import { useState, useEffect } from 'react'

import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

interface Admin {
  id: string
  email: string
  isSuperAdmin: boolean
}

interface ProjectSettings {
  feeAddress: string
  feePercentage: number
}

interface Transaction {
  txHash: string
  walletAddress: string
  transactionTime: string
  tokenAmount: string
  usdAmount: number
}

interface WalletData {
  address: string
  totalTradedUSD: number
}

export function AdminPage() {
  const [tabValue, setTabValue] = useState(0)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [settings, setSettings] = useState<ProjectSettings>({ feeAddress: '', feePercentage: 0 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isError, setIsError] = useState(false)

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        // Fetch admins
        setAdmins([
          { id: '1', email: 'super@admin.com', isSuperAdmin: true },
          { id: '2', email: 'admin@example.com', isSuperAdmin: false },
        ])

        // Fetch settings
        setSettings({
          feeAddress: '0x1234...5678',
          feePercentage: 0.1,
        })

        // Fetch transactions
        setTransactions([
          {
            txHash: '0x123...',
            walletAddress: '0xabc...',
            transactionTime: '2023-01-01 12:00:00',
            tokenAmount: '100 ETH',
            usdAmount: 180000,
          },
        ])

        // Fetch wallet data
        setWallets([
          {
            address: '0xabc...',
            totalTradedUSD: 180000,
          },
        ])
      } catch (error) {
        setNotificationMessage('Failed to fetch data')
        setIsError(true)
      }
    }

    fetchData()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddAdmin = async () => {
    try {
      // TODO: Implement API call to create admin
      // This should trigger email notification for password setup
      setNotificationMessage('Admin invitation sent successfully')
      setIsError(false)
      setIsAddAdminOpen(false)
      setNewAdminEmail('')
    } catch (error) {
      setNotificationMessage('Failed to add admin')
      setIsError(true)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      // TODO: Implement API call to remove admin
      setNotificationMessage('Admin removed successfully')
      setIsError(false)
    } catch (error) {
      setNotificationMessage('Failed to remove admin')
      setIsError(true)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      // TODO: Implement API call to update settings
      setNotificationMessage('Settings updated successfully')
      setIsError(false)
    } catch (error) {
      setNotificationMessage('Failed to update settings')
      setIsError(true)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        {notificationMessage && (
          <Alert 
            severity={isError ? 'error' : 'success'} 
            sx={{ mb: 2 }}
            onClose={() => setNotificationMessage('')}
          >
            {notificationMessage}
          </Alert>
        )}

        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="User Management" />
            <Tab label="Project Settings" />
            <Tab label="Revenue Tracking" />
          </Tabs>
        </Box>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              onClick={() => setIsAddAdminOpen(true)}
            >
              Add Admin
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.isSuperAdmin ? 'Super Admin' : 'Admin'}</TableCell>
                    <TableCell>
                      {!admin.isSuperAdmin && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveAdmin(admin.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Project Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Fee Address"
              value={settings.feeAddress}
              onChange={(e) => setSettings({ ...settings, feeAddress: e.target.value })}
              fullWidth
            />
            <TextField
              label="Fee Percentage"
              type="number"
              value={settings.feePercentage}
              onChange={(e) => setSettings({ ...settings, feePercentage: Number(e.target.value) })}
              inputProps={{ step: '0.01' }}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleUpdateSettings}
            >
              Update Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Revenue Tracking Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Wallet Overview
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Wallet Address</TableCell>
                    <TableCell>Total Traded (USD)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.address}>
                      <TableCell>{wallet.address}</TableCell>
                      <TableCell>${wallet.totalTradedUSD.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Transaction Hash</TableCell>
                  <TableCell>Wallet Address</TableCell>
                  <TableCell>Transaction Time</TableCell>
                  <TableCell>Token Amount</TableCell>
                  <TableCell>USD Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.txHash}>
                    <TableCell>{tx.txHash}</TableCell>
                    <TableCell>{tx.walletAddress}</TableCell>
                    <TableCell>{tx.transactionTime}</TableCell>
                    <TableCell>{tx.tokenAmount}</TableCell>
                    <TableCell>${tx.usdAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Add Admin Dialog */}
        <Dialog open={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)}>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin} variant="contained">Add</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}