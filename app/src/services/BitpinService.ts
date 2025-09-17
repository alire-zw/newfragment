interface PriceInfo {
  price: number;
  priceFloat: number;
  currency: string;
  source: string;
  lastUpdate: string;
}

interface CacheData {
  price: PriceInfo | null;
  lastUpdate: number | null;
  cacheTime: number;
}

interface ApiResponse {
  success: boolean;
  data?: PriceInfo;
  error?: string;
  cached?: boolean;
}

interface ConversionResult {
  success: boolean;
  data?: {
    tonAmount: number;
    tomanAmount: number;
    rate: number;
    source: string;
  };
  error?: string;
}

class BitpinService {
  private baseUrl: string = 'https://api.bitpin.ir/v1';
  private cache: CacheData = {
    price: null,
    lastUpdate: null,
    cacheTime: 60000 // 1 minute cache
  };

  /**
   * Get TON price in Toman from Bitpin
   * @returns {Promise<ApiResponse>} Price information
   */
  async getTONPrice(): Promise<ApiResponse> {
    try {
      // Check cache first
      if (this.cache.price && this.cache.lastUpdate && 
          (Date.now() - this.cache.lastUpdate) < this.cache.cacheTime) {
        console.log('📊 Using cached TON price:', this.cache.price);
        return {
          success: true,
          data: this.cache.price
        };
      }

      console.log('🔍 Fetching TON price from Bitpin...');
      
      // Get all cryptocurrencies
      const response = await fetch(`${this.baseUrl}/mkt/markets/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.results) {
        // Find TON in the results
        const tonData = data.results.find((coin: { code: string; title_en: string; title_fa: string }) => 
          coin.code === 'TON_IRT' || 
          coin.code === 'TON' || 
          coin.title_en === 'TON' ||
          coin.title_en === 'Toncoin' ||
          coin.title_fa === 'تون' ||
          coin.title_fa === 'تون کوین'
        );

        if (tonData) {
          const price = parseFloat(tonData.price);
          const priceInToman = Math.floor(price); // Convert to integer Tomans
          
          const priceInfo: PriceInfo = {
            price: priceInToman,
            priceFloat: price,
            currency: 'TON',
            source: 'Bitpin',
            lastUpdate: new Date().toISOString()
          };

          // Update cache
          this.cache.price = priceInfo;
          this.cache.lastUpdate = Date.now();

          console.log(`✅ TON price fetched: ${priceInToman} Toman`);
          
          return {
            success: true,
            data: priceInfo
          };
        } else {
          console.log('❌ TON not found in Bitpin data');
          return {
            success: false,
            error: 'TON not found in Bitpin data'
          };
        }
      } else {
        console.log('❌ Invalid response from Bitpin');
        return {
          success: false,
          error: 'Invalid response from Bitpin'
        };
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error fetching TON price from Bitpin:', errorMessage);
      
      // Return cached price if available
      if (this.cache.price) {
        console.log('📊 Using cached TON price due to error');
        return {
          success: true,
          data: this.cache.price,
          cached: true
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Convert TON amount to Toman
   * @param {number} tonAmount - Amount in TON
   * @returns {Promise<ConversionResult>} Conversion result
   */
  async convertTONToToman(tonAmount: number): Promise<ConversionResult> {
    try {
      const priceResult = await this.getTONPrice();
      
      if (priceResult.success && priceResult.data) {
        const tomanAmount = Math.floor(tonAmount * priceResult.data.price);
        
        return {
          success: true,
          data: {
            tonAmount: tonAmount,
            tomanAmount: tomanAmount,
            rate: priceResult.data.price,
            source: priceResult.data.source
          }
        };
      } else {
        return {
          success: false,
          error: priceResult.error
        };
      }
    } catch (error: unknown) {
      console.error('❌ Error converting TON to Toman:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get formatted price string
   * @param {number} tonAmount - Amount in TON
   * @returns {Promise<string>} Formatted price string
   */
  async getFormattedPrice(tonAmount: number): Promise<string> {
    try {
      const result = await this.convertTONToToman(tonAmount);
      
      if (result.success && result.data) {
        return `${result.data.tomanAmount.toLocaleString('fa-IR')} تومان`;
      } else {
        return 'قیمت در دسترس نیست';
      }
    } catch {
      return 'خطا در دریافت قیمت';
    }
  }
}

export default BitpinService;
