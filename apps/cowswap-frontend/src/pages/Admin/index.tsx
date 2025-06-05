import { useState, useEffect } from 'react'
import styled from 'styled-components/macro'

import { UI } from '@cowprotocol/ui'
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
  Skeleton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import http from 'utils/http'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { SystemSettings, getSystemSettings } from 'modules/system/services/systemSettings'

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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

interface Admin {
  id: string
  emailAddress: string
  isSuperAdmin: boolean
}

interface ProjectSettings {
  revenueWalletAddress: string
  feePercentage: number
}

interface Transaction {
  id: string
  txReceipt: string
  chain: string
  amountInUSD: number
  createdAt: number
  updatedAt: number
  trader: string
}

interface WalletData {
  address: string
  totalTradedUSD: number
}

interface Trader {
  id: string
  walletAddress: string
  referrer: string
  totalTradingVolume: number
  referalTradingVolume: number
  totalPoints: number
  referralCode: string
  referrals: Trader[]
  createdAt: number
  updatedAt: number
  txs: {
    id: string
    txReceipt: string
    chain: string
    amountInUSD: number
    createdAt: number
    updatedAt: number
  }[]
}

interface DashboardStats {
  txs: Transaction[]
  traders: Trader[]
  noOfTraders: number
  testnetTradingVolume: number
  totalTradingVolume: number
  totalReferalTradingVolume: number
  totalPoints: number
  totalTradingVolumeBase: number
  totalTradingVolumeEthereum: number
  totalTradingVolumeArbitrumOne: number
  totalTradingVolumeGenosis: number
  totalTradingVolumeSepolia: number
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B4EFF',
    },
    secondary: {
      main: '#1A1A1A',
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#1A1A1A',
          borderColor: '#1A1A1A',
          '&.MuiButton-outlined': {
            color: '#FFFFFF',
            borderColor: '#1A1A1A',
            backgroundColor: '#1A1A1A',
            '&:hover': {
              backgroundColor: '#333333',
              borderColor: '#333333',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#1A1A1A',
          borderColor: '#E0E0E0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1A1A1A',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1A1A1A',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          color: '#FFFFFF',
        },
        icon: {
          color: '#FFFFFF',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {},
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
        },
      },
    },
  },
})

const SYSTEM_BEARER_TOKEN = import.meta.env.VITE_SYSTEM_BEARER_TOKEN

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  return null
}

function AdminPage({ user }: any) {
  const token = localStorage.getItem('token')
  const [tabValue, setTabValue] = useState(0)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [settings, setSettings] = useState<ProjectSettings>({ revenueWalletAddress: '', feePercentage: 0 })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedChain, setSelectedChain] = useState<string>('all')
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [traders, setTraders] = useState<Trader[]>([])
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null)
  const [isTraderDetailsOpen, setIsTraderDetailsOpen] = useState(false)
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState('')
  const [notificationMessage, setNotificationMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const isSuperAdmin = user?.isSuperAdmin
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [adminToRemove, setAdminToRemove] = useState<Admin | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false)
  const [showNewAdminConfirmPassword, setShowNewAdminConfirmPassword] = useState(false)
  const [isCreateTxOpen, setIsCreateTxOpen] = useState(false)
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    txReceipt: '',
    chain: 'base',
    amountInUSD: 0,
    trader: '',
  })
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false)
  const [adminToUpdate, setAdminToUpdate] = useState<Admin | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false)
  const [isLoadingTransactionDetails, setIsLoadingTransactionDetails] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const POLLING_INTERVAL = 600000 // 5 minutes
  const [retryCount, setRetryCount] = useState(0)
  const MAX_RETRIES = 3
  const RETRY_DELAY = 5000 // 5 seconds
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Filter transactions based on selected chain
  const filteredTransactions =
    selectedChain === 'all' ? transactions : transactions.filter((tx) => tx.chain === selectedChain)

  // Fetch data from backend
  const getAdmin = async () => {
    try {
      const { data } = await http.get('/api/v1/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      setAdmins(data)
      console.log('Admins state:', data)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
      setAdmins([])
      setNotificationMessage('Failed to fetch data')
      setIsError(true)
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSystemSettings()
        setSettings(settings)
      } catch (error) {
        setNotificationMessage('Failed to fetch data')
        setIsError(true)
      }
    }

    fetchSettings()
    return undefined
  }, [])

  // Function to handle rate limiting
  const handleRateLimit = async (error: any) => {
    if (error?.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60
      setNotificationMessage(`Rate limit exceeded. Retrying in ${retryAfter} seconds...`)
      setIsError(true)

      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1)
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
        return true // Retry the request
      } else {
        setRetryCount(0)
        setNotificationMessage('Maximum retry attempts reached. Please try again later.')
        return false // Don't retry
      }
    }
    return false // Don't retry for other errors
  }

  // Function to refresh all data with rate limit handling
  const refreshAllData = async () => {
    setIsRefreshing(true)
    try {
      const results = await Promise.allSettled([
        getAdmin(),
        getSystemSettings(),
        fetchTransactions(selectedChain),
        getTraders(),
        getDashboardStats(),
      ])

      // Handle any rate limit errors
      for (const result of results) {
        if (result.status === 'rejected' && result.reason?.response?.status === 429) {
          const shouldRetry = await handleRateLimit(result.reason)
          if (shouldRetry) {
            return refreshAllData() // Retry the entire refresh
          }
        }
      }

      setRetryCount(0) // Reset retry count on successful refresh
    } catch (error) {
      console.error('Error refreshing data:', error)
      if (error?.response?.status === 429) {
        const shouldRetry = await handleRateLimit(error)
        if (shouldRetry) {
          return refreshAllData() // Retry the entire refresh
        }
      } else {
        setNotificationMessage('Failed to refresh data')
        setIsError(true)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Fetch transactions for a specific chain with rate limit handling
  const fetchTransactions = async (chain: string): Promise<void> => {
    setIsLoading(true)
    try {
      const endpoint = chain === 'all' ? '/api/v1/txs' : `/api/v1/txs/${chain}`
      const { data } = await http.get(endpoint, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      if (error?.response?.status === 429) {
        const shouldRetry = await handleRateLimit(error)
        if (shouldRetry) {
          return fetchTransactions(chain) // Retry the request
        }
      }
      setNotificationMessage('Failed to fetch transactions')
      setIsError(true)
      return
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch traders data with rate limit handling
  const getTraders = async (): Promise<void> => {
    try {
      const { data } = await http.get('/api/v1/traders', {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setTraders(data)
    } catch (error) {
      console.error('Failed to fetch traders:', error)
      if (error?.response?.status === 429) {
        const shouldRetry = await handleRateLimit(error)
        if (shouldRetry) {
          return getTraders() // Retry the request
        }
      }
      setNotificationMessage('Failed to fetch traders data')
      setIsError(true)
      return
    }
  }

  // Fetch trader details using system bearer token
  const getTraderDetails = async (walletAddress: string) => {
    try {
      const { data } = await http.get(`/api/v1/trader/${walletAddress}/base`, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setSelectedTrader(data.trader)
      setIsTraderDetailsOpen(true)
    } catch (error) {
      console.error('Failed to fetch trader details:', error)
      setNotificationMessage('Failed to fetch trader details')
      setIsError(true)
    }
  }

  // Handle chain change
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain)
    fetchTransactions(chain)
  }

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => setNotificationMessage(''), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [notificationMessage])

  // Function to redact long strings
  const redactString = (str: string, visibleChars: number = 5) => {
    if (!str) return ''
    return `...${str.slice(-visibleChars)}`
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminConfirmPassword) {
      setNotificationMessage('All fields are required')
      setIsError(true)
      return
    }
    if (newAdminPassword !== newAdminConfirmPassword) {
      setNotificationMessage('Passwords do not match')
      setIsError(true)
      return
    }
    try {
      await http.post(
        '/api/v1/admin',
        {
          emailAddress: newAdminEmail,
          password: newAdminPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      await refreshAllData()
      setNotificationMessage('Admin invitation sent successfully')
      setIsError(false)
      setIsAddAdminOpen(false)
      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminConfirmPassword('')
    } catch (error) {
      setNotificationMessage('Failed to add admin')
      setIsError(true)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    setIsRemoving(true)
    try {
      await http.delete(`/api/v1/admin/${adminId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      await refreshAllData()
      setNotificationMessage('Admin removed successfully')
      setIsError(false)
    } catch (error) {
      setNotificationMessage('Failed to remove admin')
      setIsError(true)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleUpdateSettings = async () => {
    try {
      await http.post(
        '/api/v1/system/change-settings',
        {
          revenueWalletAddress: settings.revenueWalletAddress,
          feePercentage: settings.feePercentage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      await refreshAllData()
      setNotificationMessage('Settings updated successfully')
      setIsError(false)
    } catch (error) {
      setNotificationMessage('Failed to update settings')
      setIsError(true)
    }
  }

  const handleCreateTransaction = async () => {
    try {
      const { data } = await http.post(
        '/api/v1/revenue/transaction',
        {
          ...newTx,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          headers: {
            Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          withCredentials: true,
        },
      )

      await refreshAllData()
      setNotificationMessage('Transaction created successfully')
      setIsError(false)
      setIsCreateTxOpen(false)
      setNewTx({
        txReceipt: '',
        chain: 'base',
        amountInUSD: 0,
        trader: '',
      })
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setNotificationMessage('Failed to create transaction')
      setIsError(true)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setNotificationMessage('All fields are required')
      setIsError(true)
      return
    }

    if (newPassword !== confirmNewPassword) {
      setNotificationMessage('New passwords do not match')
      setIsError(true)
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setNotificationMessage(passwordError)
      setIsError(true)
      return
    }

    try {
      await http.patch(
        '/api/v1/admin/password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      setNotificationMessage('Password changed successfully')
      setIsError(false)
      setIsChangePasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error: any) {
      setNotificationMessage(error?.response?.data?.message || 'Failed to change password')
      setIsError(true)
    }
  }

  const handleChangeRole = async (adminId: string, newRole: boolean) => {
    if (!adminPassword) {
      setNotificationMessage('Admin password is required')
      setIsError(true)
      return
    }

    try {
      await http.patch(
        `/api/v1/admin/update/${adminId}`,
        {
          isSuperAdmin: newRole,
          password: adminPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      await refreshAllData()
      setNotificationMessage('Role updated successfully')
      setIsError(false)
      setIsChangeRoleOpen(false)
      setAdminToUpdate(null)
      setAdminPassword('')
    } catch (error: any) {
      setNotificationMessage(error?.response?.data?.message || 'Failed to update role')
      setIsError(true)
    }
  }

  // Set up polling with exponential backoff
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const poll = async () => {
      await refreshAllData()
      timeoutId = setTimeout(poll, POLLING_INTERVAL)
    }

    poll()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [selectedChain]) // Re-run when chain changes

  // Fetch dashboard stats
  const getDashboardStats = async () => {
    try {
      const { data } = await http.get('/api/v1/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      setNotificationMessage('Failed to fetch dashboard stats')
      setIsError(true)
    }
  }

  // Fetch transaction details
  const getTransactionDetails = async (txId: string) => {
    setIsLoadingTransactionDetails(true)
    try {
      const { data } = await http.get(`/api/v1/tx/${txId}`, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      setSelectedTransaction(data.tx)
      setIsTransactionDetailsOpen(true)
    } catch (error) {
      console.error('Failed to fetch transaction details:', error)
      setNotificationMessage('Failed to fetch transaction details')
      setIsError(true)
    } finally {
      setIsLoadingTransactionDetails(false)
    }
  }

  // Create new transaction from swap
  const createTransactionFromSwap = async (swapData: {
    trader: string
    txReceipt: string
    chain: string
    amountInUSD: number
  }) => {
    try {
      const formData = new FormData()
      formData.append('trader', swapData.trader)
      formData.append('txReceipt', swapData.txReceipt)
      formData.append('chain', swapData.chain)
      formData.append('amountInUSD', swapData.amountInUSD.toString())

      await http.post('/api/v1/tx', formData, {
        headers: {
          Authorization: `Bearer ${SYSTEM_BEARER_TOKEN}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      })

      // Refresh the transactions list after successful creation
      await fetchTransactions(selectedChain)
      setNotificationMessage('Transaction created successfully')
      setIsError(false)
    } catch (error) {
      console.error('Failed to create transaction:', error)
      setNotificationMessage('Failed to create transaction')
      setIsError(true)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ backgroundColor: 'var(--cow-color-paper)' }}>
        <Box sx={{ width: '100%', mt: 4 }}>
          {notificationMessage && (
            <Alert severity={isError ? 'error' : 'success'} sx={{ mb: 2 }} onClose={() => setNotificationMessage('')}>
              {notificationMessage}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              <span style={{ textTransform: 'capitalize' }}>{user.role?.split('_').join(' ')} Dashboard</span>
            </Typography>
            <Button
              variant="outlined"
              onClick={refreshAllData}
              disabled={isRefreshing}
              startIcon={isRefreshing ? <CircularProgress size={20} /> : null}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="User Management" />
              <Tab label="Project Settings" />
              <Tab label="Revenue Tracking" />
              <Tab label="Traders" />
            </Tabs>
          </Box>

          {/* User Management Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              {isSuperAdmin && (
                <Button variant="contained" onClick={() => setIsAddAdminOpen(true)}>
                  Add Admin
                </Button>
              )}
              <Button variant="outlined" onClick={() => setIsChangePasswordOpen(true)}>
                Change Password
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
                  {admins ? (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.emailAddress ?? 'user'}</TableCell>
                        <TableCell>{admin?.isSuperAdmin ? 'Super Admin' : 'Admin'}</TableCell>
                        <TableCell>
                          {isSuperAdmin && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {!admin.isSuperAdmin && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  onClick={() => {
                                    setAdminToRemove(admin)
                                    setRemoveDialogOpen(true)
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setAdminToUpdate(admin)
                                  setIsChangeRoleOpen(true)
                                }}
                              >
                                Change Role
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No admins found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Project Settings Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Fee Address"
                type="text"
                value={settings.revenueWalletAddress}
                onChange={(e) => setSettings({ ...settings, revenueWalletAddress: e.target.value })}
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
              <Button variant="contained" onClick={handleUpdateSettings}>
                Update Settings
              </Button>
            </Box>
          </TabPanel>

          {/* Revenue Tracking Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 4 }}>
              {/* Stats Profile Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Dashboard Statistics
                </Typography>
                <Grid container spacing={3}>
                  {/* Total Trading Volume */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Trading Volume
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        ${stats?.totalTradingVolume.toLocaleString() || 0}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Number of Traders */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Traders
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stats?.noOfTraders || 0}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Total Points */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Points
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {stats?.totalPoints || 0}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Referral Volume */}
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Referral Volume
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        ${stats?.totalReferalTradingVolume.toLocaleString() || 0}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Chain-specific Volumes */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Trading Volume by Chain
                      </Typography>
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Base
                            </Typography>
                            <Typography variant="h6">${stats?.totalTradingVolumeBase.toLocaleString() || 0}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Ethereum
                            </Typography>
                            <Typography variant="h6">
                              ${stats?.totalTradingVolumeEthereum.toLocaleString() || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Arbitrum One
                            </Typography>
                            <Typography variant="h6">
                              ${stats?.totalTradingVolumeArbitrumOne.toLocaleString() || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Gnosis
                            </Typography>
                            <Typography variant="h6">
                              ${stats?.totalTradingVolumeGenosis.toLocaleString() || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Sepolia
                            </Typography>
                            <Typography variant="h6">
                              ${stats?.totalTradingVolumeSepolia.toLocaleString() || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Transaction History Section */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Transaction History
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      select
                      label="Filter by Chain"
                      value={selectedChain}
                      onChange={(e) => handleChainChange(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="all">All Chains</MenuItem>
                      <MenuItem value="ethereum">Ethereum</MenuItem>
                      <MenuItem value="genosis">Genosis</MenuItem>
                      <MenuItem value="base">Base</MenuItem>
                      <MenuItem value="arbitrum-one">Arbitrum One</MenuItem>
                      <MenuItem value="sepolia">Sepolia</MenuItem>
                    </TextField>
                  </Box>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction Hash</TableCell>
                        <TableCell>Chain</TableCell>
                        <TableCell>Amount (USD)</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Trader ID</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading || isRefreshing ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <CircularProgress size={24} />
                          </TableCell>
                        </TableRow>
                      ) : transactions.length > 0 ? (
                        [...transactions].reverse().map((tx) => (
                          <TableRow
                            key={tx.id}
                            hover
                            onClick={() => getTransactionDetails(tx.id)}
                            sx={{ cursor: 'pointer' }}
                          >
                            <TableCell>{redactString(tx.txReceipt, 15)}</TableCell>
                            <TableCell>{tx.chain}</TableCell>
                            <TableCell>${tx.amountInUSD.toLocaleString()}</TableCell>
                            <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{redactString(tx.trader)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </TabPanel>

          {/* Traders Tab */}
          <TabPanel value={tabValue} index={3}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Wallet Address</TableCell>
                    <TableCell>Total Volume (USD)</TableCell>
                    <TableCell>Points</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {traders.map((trader) => (
                    <TableRow key={trader.id}>
                      <TableCell>{trader.walletAddress}</TableCell>
                      <TableCell>${trader.totalTradingVolume.toLocaleString()}</TableCell>
                      <TableCell>{trader.totalPoints}</TableCell>
                      <TableCell>
                        <Button variant="outlined" onClick={() => getTraderDetails(trader.walletAddress)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Trader Details Dialog */}
          <Dialog open={isTraderDetailsOpen} onClose={() => setIsTraderDetailsOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Trader Details</DialogTitle>
            <DialogContent>
              {selectedTrader && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Wallet Address
                  </Typography>
                  <Typography paragraph>{selectedTrader.walletAddress}</Typography>

                  <Typography variant="h6" gutterBottom>
                    Trading Statistics
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Trading Volume</TableCell>
                          <TableCell>${selectedTrader.totalTradingVolume.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Referral Trading Volume</TableCell>
                          <TableCell>${selectedTrader.referalTradingVolume.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Points</TableCell>
                          <TableCell>{selectedTrader.totalPoints}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Referral Code</TableCell>
                          <TableCell>{selectedTrader.referralCode}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Referrals</TableCell>
                          <TableCell>{selectedTrader.referrals?.length || 0}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Recent Transactions
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Transaction Hash</TableCell>
                          <TableCell>Chain</TableCell>
                          <TableCell>Amount (USD)</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTrader.txs?.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{tx.txReceipt}</TableCell>
                            <TableCell>{tx.chain}</TableCell>
                            <TableCell>${tx.amountInUSD.toLocaleString()}</TableCell>
                            <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {selectedTrader.referrals?.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Referrals
                      </Typography>
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Wallet Address</TableCell>
                              <TableCell>Total Volume</TableCell>
                              <TableCell>Referral Code</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedTrader.referrals.map((referral) => (
                              <TableRow key={referral.id}>
                                <TableCell>{referral.walletAddress}</TableCell>
                                <TableCell>${referral.totalTradingVolume.toLocaleString()}</TableCell>
                                <TableCell>{referral.referralCode}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsTraderDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Add Admin Dialog */}
          <Dialog open={isAddAdminOpen} fullWidth onClose={() => setIsAddAdminOpen(false)}>
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
              <TextField
                margin="dense"
                label="Password"
                type={showNewAdminPassword ? 'text' : 'password'}
                fullWidth
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewAdminPassword((show) => !show)}
                        edge="end"
                      >
                        {showNewAdminPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="Confirm Password"
                type={showNewAdminConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={newAdminConfirmPassword}
                onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowNewAdminConfirmPassword((show) => !show)}
                        edge="end"
                      >
                        {showNewAdminConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
              <Button onClick={handleAddAdmin} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Remove Confirmation Dialog */}
          <Dialog open={removeDialogOpen} onClose={() => setRemoveDialogOpen(false)}>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogContent>
              Are you sure you want to remove admin <b>{adminToRemove?.emailAddress}</b>?
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setRemoveDialogOpen(false)} disabled={isRemoving}>
                Cancel
              </Button>
              <Button
                color="error"
                variant="contained"
                disabled={isRemoving}
                onClick={async () => {
                  if (adminToRemove) {
                    await handleRemoveAdmin(adminToRemove.id)
                  }
                  setRemoveDialogOpen(false)
                  setAdminToRemove(null)
                }}
              >
                {isRemoving ? 'Removing...' : 'Remove'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Change Password Dialog */}
          <Dialog open={isChangePasswordOpen} fullWidth onClose={() => setIsChangePasswordOpen(false)}>
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <TextField
                margin="dense"
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                fullWidth
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => setShowCurrentPassword((show) => !show)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle new password visibility"
                        onClick={() => setShowNewPassword((show) => !show)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="dense"
                label="Confirm New Password"
                type={showConfirmNewPassword ? 'text' : 'password'}
                fullWidth
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm new password visibility"
                        onClick={() => setShowConfirmNewPassword((show) => !show)}
                        edge="end"
                      >
                        {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsChangePasswordOpen(false)}>Cancel</Button>
              <Button onClick={handleChangePassword} variant="contained">
                Change Password
              </Button>
            </DialogActions>
          </Dialog>

          {/* Change Role Dialog */}
          <Dialog open={isChangeRoleOpen} onClose={() => setIsChangeRoleOpen(false)}>
            <DialogTitle>Change Role</DialogTitle>
            <DialogContent>
              <Typography>
                Change role for <b>{adminToUpdate?.emailAddress}</b> to:
              </Typography>

              <TextField
                margin="dense"
                label="Admin Password"
                type={showAdminPassword ? 'text' : 'password'}
                fullWidth
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle admin password visibility"
                        onClick={() => setShowAdminPassword((show) => !show)}
                        edge="end"
                      >
                        {showAdminPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant={adminToUpdate?.isSuperAdmin ? 'contained' : 'outlined'}
                  onClick={() => handleChangeRole(adminToUpdate?.id || '', true)}
                  sx={{ mr: 1 }}
                >
                  Super Admin
                </Button>
                <Button
                  variant={!adminToUpdate?.isSuperAdmin ? 'contained' : 'outlined'}
                  onClick={() => handleChangeRole(adminToUpdate?.id || '', false)}
                >
                  Admin
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsChangeRoleOpen(false)
                  setAdminPassword('')
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Transaction Details Dialog */}
          <Dialog
            open={isTransactionDetailsOpen}
            onClose={() => {
              setIsTransactionDetailsOpen(false)
              setSelectedTransaction(null)
            }}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogContent>
              {isLoadingTransactionDetails ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : selectedTransaction ? (
                <Box sx={{ mt: 2 }}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Transaction Hash
                          </TableCell>
                          <TableCell>{selectedTransaction.txReceipt}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Chain
                          </TableCell>
                          <TableCell>{selectedTransaction.chain}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Amount (USD)
                          </TableCell>
                          <TableCell>${selectedTransaction.amountInUSD.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Date
                          </TableCell>
                          <TableCell>{new Date(selectedTransaction.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Trader ID
                          </TableCell>
                          <TableCell>{selectedTransaction.trader}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                            Transaction ID
                          </TableCell>
                          <TableCell>{selectedTransaction.id}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary">No transaction details available</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setIsTransactionDetailsOpen(false)
                  setSelectedTransaction(null)
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

const Wrapper = styled.div`
  min-height: 100vh;
  background-color: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
`

const AdminLayout = () => {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState('loading')

  const refreshToken = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null

      const { data } = await http.post(
        '/api/v1/admin/refresh-token',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (data?.token) {
        localStorage.setItem('token', data.token)
        return data.token
      }
      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  const getData = async () => {
    try {
      let token = localStorage.getItem('token')
      if (!token) {
        setIsLoggedIn('login')
        return
      }

      try {
        const { data: { data } = {} } = await http.get('/api/v1/admin', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        if (data) {
          setUser(data)
          setIsLoggedIn('auth')
        } else {
          setIsLoggedIn('login')
        }
      } catch (error: any) {
        // If token expired, try to refresh
        if (error?.response?.status === 401) {
          const newToken = await refreshToken()
          if (newToken) {
            // Retry the request with new token
            const { data: { data } = {} } = await http.get('/api/v1/admin', {
              headers: {
                Authorization: `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            })
            if (data) {
              setUser(data)
              setIsLoggedIn('auth')
              return
            }
          }
          // If refresh failed or retry failed, logout
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setIsLoggedIn('login')
        } else {
          console.error('Admin data fetch error:', error?.response?.data || error)
          setIsLoggedIn('login')
        }
      }
    } catch (error: any) {
      console.error('Admin data fetch error:', error?.response?.data || error)
      if (error?.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      setIsLoggedIn('login')
    }
  }
  useEffect(() => {
    if (user === null) {
      getData()
    }
    return undefined
  }, [user])
  const handleChange = (data: any) => {
    setUser(data)
    setIsLoggedIn('auth')
  }
  return (
    <Wrapper>
      {isLoggedIn === 'loading' && <Loading />}
      {isLoggedIn === 'auth' && <AdminPage user={user} />}
      {isLoggedIn === 'login' && <Login setLogin={handleChange} />}
    </Wrapper>
  )
}

const Login = ({ setLogin }: { setLogin: Function }) => {
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
    return undefined
  }, [])

  // Handle rate limiting
  useEffect(() => {
    if (failedAttempts >= 5) {
      setIsLocked(true)
      setLockoutTime(300) // 5 minutes lockout
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsLocked(false)
            setFailedAttempts(0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
    return undefined
  }, [failedAttempts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!email || !password) {
        setError('Please enter email and password')
        return
      }

      if (isLocked) {
        setError(`Account is locked. Please try again in ${lockoutTime} seconds`)
        return
      }

      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError)
        return
      }

      setIsLoading(true)
      setError('')

      // Create FormData object
      const formData = new FormData()
      formData.append('emailAddress', email)
      formData.append('password', password)

      // Make API call to admin login endpoint
      const { data } = await http.post('api/v1/admin/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      console.log('Login response:', data) // Debug log

      // Validate token
      if (!data?.token) {
        throw new Error('No token received from server')
      }

      // Store token and admin data
      const token = data.token
      localStorage.setItem('token', token)

      // Store minimal user data
      const userData = {
        id: data.admin.id,
        email: data.admin.emailAddress,
        isSuperAdmin: data.admin.isSuperAdmin,
      }

      localStorage.setItem('user', JSON.stringify(userData))

      // Reset failed attempts on successful login
      setFailedAttempts(0)

      setLogin(userData)
    } catch (err: any) {
      console.error('Login error:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      })
      const message = err?.response?.data?.message || err?.message || 'An error occurred during login'
      setError(message)
      setFailedAttempts((prev) => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please sign in to continue
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}
        >
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            error={!!error}
            disabled={isLocked}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            error={!!error}
            disabled={isLocked}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="primary" />
            }
            label="Remember me"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          {isLocked && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Account is locked. Please try again in {lockoutTime} seconds
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isLoading || isLocked}
            sx={{
              mt: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const Loading = () => {
  return (
    <Dialog open={true}>
      <DialogContent>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  )
}

export default AdminLayout
