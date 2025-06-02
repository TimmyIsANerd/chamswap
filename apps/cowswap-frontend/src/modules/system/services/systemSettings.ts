import http from 'utils/http'

export interface SystemSettings {
  revenueWalletAddress: string
  feePercentage: number
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await http.get<SystemSettings>('/api/v1/system/get-settings', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })

    if (!response.data || !response.data.revenueWalletAddress || response.data.feePercentage === undefined) {
      throw new Error('Invalid system settings response')
    }

    return response.data
  } catch (error) {
    console.error('[SystemSettings] Failed to fetch system settings:', error)
    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
    }
    throw error
  }
}
