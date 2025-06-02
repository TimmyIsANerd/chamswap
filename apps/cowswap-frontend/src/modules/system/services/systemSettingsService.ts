import http from 'utils/http'

export interface SystemSettings {
  feePercentage: number
  revenueWalletAddress: string
}

/**
 * Service for fetching and caching system settings
 */
export class SystemSettingsService {
  private static instance: SystemSettingsService
  private settings: SystemSettings | null = null
  private lastFetchTime: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  private constructor() {}

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): SystemSettingsService {
    if (!SystemSettingsService.instance) {
      SystemSettingsService.instance = new SystemSettingsService()
    }
    return SystemSettingsService.instance
  }

  /**
   * Fetch system settings from the backend
   * @param forceRefresh Force a refresh of the settings
   * @returns Promise with system settings
   */
  public async getSystemSettings(forceRefresh = false): Promise<SystemSettings> {
    const now = Date.now()

    // Return cached settings if available and not expired
    if (!forceRefresh && this.settings && now - this.lastFetchTime < this.CACHE_DURATION) {
      return this.settings
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch fee settings from backend
      const { data } = await http.get('/api/v1/system/get-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })

      // Cache the settings
      this.settings = {
        feePercentage: data.feePercentage,
        revenueWalletAddress: data.revenueWalletAddress,
      }
      this.lastFetchTime = now

      return this.settings
    } catch (error) {
      console.error('[SystemSettingsService] Failed to fetch system settings:', error)

      // Return default settings if fetch fails
      return this.getDefaultSettings()
    }
  }

  /**
   * Get default system settings
   * @returns Default system settings
   */
  private getDefaultSettings(): SystemSettings {
    return {
      feePercentage: 0,
      revenueWalletAddress: '0x0000000000000000000000000000000000000000',
    }
  }
}
