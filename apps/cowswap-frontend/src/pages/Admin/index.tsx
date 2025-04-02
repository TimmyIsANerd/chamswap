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
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import http from 'utils/http'
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
  email: string
  role?:string
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

const theme = createTheme({
  palette: {
    primary: {
      main: 'var(--cow-color-primary)',
    },
    secondary: {
      main: 'var(--cow-color-text)',
    },
    background: {
      default: 'var(--cow-color-paper)',
      paper: 'var(--cow-color-paper)',
    },
    text: {
      primary: 'var(--cow-color-text)',
      secondary: 'var(--cow-color-text-paper)',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--cow-color-paper)',
          color: 'var(--cow-color-text)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: 'var(--cow-color-text)',
          borderColor: 'var(--cow-color-text)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: 'var(--cow-color-text)',
          borderColor: 'var(--cow-color-border)',
        },
      },
    },
  },
})

function AdminPage({ user }: any) {
  const token = localStorage.getItem('token')
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
  const getAdmin = async () => {
    try {
      const { data: { data } = {} } = await http.get('/auth/users?type=admin')
      setAdmins(data)
    }catch(error){  
      setNotificationMessage('Failed to fetch data')
      setIsError(true)
    }
  }
  const getSetting = async () => {
    try {
      const { data: { data } = {} } = await http.get('/settings')
      if(data){
        setSettings(data)
      }
    }
    catch (error) {
      setNotificationMessage('Failed to fetch data')
      setIsError(true)
    }

  }
  const fetchData = async () => {
    try {
      getAdmin();
      getSetting();
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
  useEffect(() => {
  
    fetchData()
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleAddAdmin = async () => {
    try {
      // TODO: Implement API call to create admin
      // This should trigger email notification for password setup

      const user=await http.post('/auth/admin',{email:newAdminEmail})
      await fetchData();
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
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ backgroundColor: 'var(--cow-color-paper)' }}>
      <Box sx={{ width: '100%', mt: 4 }}>
        {notificationMessage && (
          <Alert severity={isError ? 'error' : 'success'} sx={{ mb: 2 }} onClose={() => setNotificationMessage('')}>
            {notificationMessage}
          </Alert>
        )}

        <Typography variant="h4" component="h1" gutterBottom>
          <span style={{ textTransform: 'capitalize' }}>{user.role.split('_').join(' ')} Dashboard</span>
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
            <Button variant="contained" onClick={() => setIsAddAdminOpen(true)}>
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
                    <TableCell>{admin.email??"user"}</TableCell>
                    <TableCell>{admin?.role==='super_admin' ? 'Super Admin' : admin?.role==="admin" ?'Admin':"User"}</TableCell>
                    <TableCell>
                      {admin.role==="admin" && (
                        <Button variant="outlined" color="error" onClick={() => handleRemoveAdmin(admin.id)}>
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
            <Button variant="contained" onClick={handleUpdateSettings}>
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
        <Dialog open={isAddAdminOpen} fullWidth  onClose={() => setIsAddAdminOpen(false)}>
          <DialogTitle>Add New Admin</DialogTitle>
          <DialogContent>
            <div>
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            </div>
          </DialogContent> 
          <DialogActions>
            <Button onClick={() => setIsAddAdminOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAdmin} variant="contained">
              Add
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
  const token = localStorage.getItem('token')
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState('loading')
  const getData = async () => {
    try {
      const { data: { data } = {} } = await http.get('/auth/admin' )
      console.log(data)
      if (data) {
        setUser(data)
        setIsLoggedIn('auth')
      } else {
        setIsLoggedIn('login')
      }
    } catch (error) {
      setIsLoggedIn('login')
    }
  }
  useEffect(() => {
    if (token || user === null) {
      getData()
    } else {
      setIsLoggedIn('login')
    }
  }, [token])
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
  const handleSubmit = async () => {
    try {
      if (!email || !password) {
        setError('Please enter email and password')
        return
      }
      setIsLoading(true)
      setError('')
      const { data } = await http.post('/auth/login', { email, password })
      setLogin(data.user)
      localStorage.setItem('token', data.token)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true}>
      <DialogTitle>Welcome</DialogTitle>
      <DialogContent>
        <div style={{ gap: '20px' }}>
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
          />
          <TextField
            autoFocus
            style={{ marginTop: '20px' }}
            margin="dense"
            label="password"
            type="email"
            fullWidth
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
          />
          <span style={{ color: 'red' }}>{error}</span>
          <Button
            style={{ display: 'block', margin: 'auto', width: '50%', marginTop: '20px', padding: '10px' }}
            size="medium"
            disabled={isLoading}
            onClick={handleSubmit}
            variant="contained"
          >
            Login
          </Button>
        </div>
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
