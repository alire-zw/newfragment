import { TonClient, WalletContractV4, fromNano, toNano, Address, Cell, beginCell, internal } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';

interface WalletConfig {
  mnemonic: string[];
  apiKey: string;
}

interface TransferParams {
  to: string;
  amount: string; // in TON
  payload?: string;
}

interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

class WalletService {
  private client: TonClient;
  private config: WalletConfig | null = null;

  // کلیدهای پیش‌فرض
  private defaultMnemonic = [
    'quantum', 'castle', 'lecture', 'range', 'tourist', 'lunch',
    'slam', 'early', 'daring', 'innocent', 'sword', 'metal',
    'shuffle', 'push', 'thumb', 'hurdle', 'pet', 'hockey',
    'rotate', 'carry', 'involve', 'pumpkin', 'head', 'february'
  ];
  
  private defaultApiKey = '6cb7852c6bfb7e962fb9a3c1e370e17cd77591fef381daedb07dbc627986008b';
  
  private defaultAddress = 'UQChxao82Lj9Fz3fDGOgFz12UwF7tK-9Y3T07eB9jZwpDBhG';

  constructor(apiKey?: string) {
    this.client = new TonClient({
      endpoint: 'https://toncenter.com/api/v2/jsonRPC',
      apiKey: apiKey || this.defaultApiKey
    });
    
    // تنظیم خودکار کلیدهای پیش‌فرض
    this.setWalletConfig(this.defaultMnemonic, this.defaultApiKey);
  }

  /**
   * تنظیم کلیدهای ولت
   */
  setWalletConfig(mnemonic: string[], apiKey: string) {
    this.config = {
      mnemonic,
      apiKey
    };
  }

  /**
   * دریافت آدرس ولت پیش‌فرض
   */
  getDefaultAddress(): string {
    return this.defaultAddress;
  }

  /**
   * دریافت آدرس ولت فعلی
   */
  async getCurrentAddress(): Promise<string> {
    if (!this.config) {
      return this.defaultAddress;
    }

    try {
      const key = await mnemonicToWalletKey(this.config.mnemonic);
      const wallet = WalletContractV4.create({ 
        workchain: 0, 
        publicKey: key.publicKey 
      });
      
      return wallet.address.toString();
    } catch (error) {
      console.error('Error getting current address:', error);
      return this.defaultAddress;
    }
  }

  /**
   * دریافت موجودی ولت
   */
  async getBalance(address: string): Promise<number> {
    try {
      const addr = Address.parse(address);
      const balance = await this.client.getBalance(addr);
      return parseFloat(fromNano(balance));
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('خطا در دریافت موجودی ولت');
    }
  }

  /**
   * ارسال تراکنش TON
   */
  async sendTransfer(params: TransferParams): Promise<TransactionResult> {
    if (!this.config) {
      return {
        success: false,
        error: 'ولت تنظیم نشده است'
      };
    }

    try {
      // ایجاد کلید ولت از mnemonic
      const key = await mnemonicToWalletKey(this.config.mnemonic);
      const wallet = WalletContractV4.create({ 
        workchain: 0, 
        publicKey: key.publicKey 
      });

      // دریافت وضعیت ولت
      const contract = this.client.open(wallet);
      const seqno = await contract.getSeqno();

      // ایجاد پیام انتقال
      const toAddress = Address.parse(params.to);
      const body = beginCell()
        .storeUint(0, 32) // op
        .storeStringTail(params.payload || 'Transfer from FragmentParsiBot')
        .endCell();

      // ارسال تراکنش
      await contract.sendTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [internal({
          to: toAddress,
          value: toNano(params.amount),
          body: body
        })]
      });

      return {
        success: true,
        txHash: 'pending' // TON API doesn't return immediate hash
      };

    } catch (error) {
      console.error('Error sending transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در ارسال تراکنش'
      };
    }
  }

  /**
   * تایید تراکنش پریمیوم
   */
  async confirmPremiumTransaction(transaction: {
    address: string;
    amount: string;
    payload: string;
  }): Promise<TransactionResult> {
    console.log('🔧 [WALLET-SERVICE] Starting confirmPremiumTransaction');
    
    if (!this.config) {
      console.error('❌ [WALLET-SERVICE] Wallet not configured');
      return {
        success: false,
        error: 'ولت تنظیم نشده است'
      };
    }

    try {
      console.log('💰 [WALLET-SERVICE] Checking wallet balance...');
      // بررسی موجودی
      const balance = await this.getBalance(transaction.address);
      const requiredAmount = parseFloat(transaction.amount) / 1e9; // تبدیل از nanoton به TON
      
      console.log('💰 [WALLET-SERVICE] Balance check:', {
        currentBalance: balance,
        requiredAmount: requiredAmount,
        sufficient: balance >= requiredAmount
      });
      
      if (balance < requiredAmount) {
        console.error('❌ [WALLET-SERVICE] Insufficient balance');
        return {
          success: false,
          error: `موجودی ناکافی. موجودی: ${balance} TON، مورد نیاز: ${requiredAmount} TON`
        };
      }

      console.log('🔑 [WALLET-SERVICE] Creating wallet key from mnemonic...');
      // ایجاد کلید ولت از mnemonic
      const key = await mnemonicToWalletKey(this.config.mnemonic);
      const wallet = WalletContractV4.create({ 
        workchain: 0, 
        publicKey: key.publicKey 
      });

      console.log('📡 [WALLET-SERVICE] Getting wallet sequence number...');
      // دریافت وضعیت ولت
      const contract = this.client.open(wallet);
      const seqno = await contract.getSeqno();
      
      console.log('📊 [WALLET-SERVICE] Wallet info:', {
        address: wallet.address.toString(),
        seqno: seqno
      });

      // ایجاد پیام Call Contract برای پریمیوم
      const toAddress = Address.parse(transaction.address);
      console.log('🎯 [WALLET-SERVICE] Target address:', toAddress.toString());
      
      // تبدیل payload از hex string به Cell
      console.log('🔧 [WALLET-SERVICE] Processing payload...');
      let payloadCell: Cell;
      try {
        // اگر payload hex string است، آن را به Cell تبدیل کن
        if (transaction.payload.startsWith('0x') || /^[0-9a-fA-F]+$/.test(transaction.payload)) {
          console.log('🔧 [WALLET-SERVICE] Processing hex payload');
          // حذف 0x اگر وجود دارد
          const hexPayload = transaction.payload.replace('0x', '');
          // تبدیل hex به Buffer
          const buffer = Buffer.from(hexPayload, 'hex');
          
          console.log('🔧 [WALLET-SERVICE] Hex payload details:', {
            originalLength: transaction.payload.length,
            hexLength: hexPayload.length,
            bufferLength: buffer.length
          });
          
          // ایجاد Cell از buffer
          payloadCell = beginCell()
            .storeBuffer(buffer)
            .endCell();
        } else {
          console.log('🔧 [WALLET-SERVICE] Processing base64 payload');
          // اگر payload base64 است
          payloadCell = Cell.fromBase64(transaction.payload);
        }
        
        console.log('✅ [WALLET-SERVICE] Payload processed successfully:', {
          cellBits: payloadCell.bits.length,
          cellRefs: payloadCell.refs.length
        });
      } catch (error) {
        console.error('❌ [WALLET-SERVICE] Error parsing payload:', error);
        // در صورت خطا، از payload به عنوان text استفاده کن
        payloadCell = beginCell()
          .storeUint(0, 32) // op = 0 (Text Comment)
          .storeStringTail(transaction.payload)
          .endCell();
        console.log('⚠️ [WALLET-SERVICE] Fallback to text comment payload');
      }

      console.log('🚀 [WALLET-SERVICE] Sending call contract transaction...');
      // ارسال تراکنش call contract برای پریمیوم
      await contract.sendTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [internal({
          to: toAddress,
          value: toNano(requiredAmount.toString()),
          body: payloadCell,
          bounce: false // برای call contract
        })]
      });

      console.log('✅ [WALLET-SERVICE] Call contract transaction sent successfully');
      return {
        success: true,
        txHash: 'pending'
      };

    } catch (error) {
      console.error('💥 [WALLET-SERVICE] Error confirming premium transaction:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در تایید تراکنش'
      };
    }
  }

  /**
   * تایید تراکنش استارز
   */
  async confirmStarsTransaction(transaction: {
    address: string;
    amount: string;
    payload: string;
  }): Promise<TransactionResult> {
    console.log('🔧 [WALLET-SERVICE] Starting confirmStarsTransaction');
    
    if (!this.config) {
      console.error('❌ [WALLET-SERVICE] Wallet not configured');
      return {
        success: false,
        error: 'ولت تنظیم نشده است'
      };
    }

    try {
      console.log('💰 [WALLET-SERVICE] Checking wallet balance...');
      // بررسی موجودی
      const balance = await this.getBalance(transaction.address);
      const requiredAmount = parseFloat(transaction.amount) / 1e9; // تبدیل از nanoton به TON
      
      console.log('💰 [WALLET-SERVICE] Balance check:', {
        currentBalance: balance,
        requiredAmount: requiredAmount,
        sufficient: balance >= requiredAmount
      });
      
      if (balance < requiredAmount) {
        console.error('❌ [WALLET-SERVICE] Insufficient balance');
        return {
          success: false,
          error: `موجودی ناکافی. موجودی: ${balance} TON، مورد نیاز: ${requiredAmount} TON`
        };
      }

      console.log('🔑 [WALLET-SERVICE] Creating wallet key from mnemonic...');
      // ایجاد کلید ولت از mnemonic
      const key = await mnemonicToWalletKey(this.config.mnemonic);
      const wallet = WalletContractV4.create({ 
        workchain: 0, 
        publicKey: key.publicKey 
      });

      console.log('📡 [WALLET-SERVICE] Getting wallet sequence number...');
      // دریافت وضعیت ولت
      const contract = this.client.open(wallet);
      const seqno = await contract.getSeqno();
      
      console.log('📊 [WALLET-SERVICE] Wallet info:', {
        address: wallet.address.toString(),
        seqno: seqno
      });

      // ایجاد پیام Call Contract برای استارز
      const toAddress = Address.parse(transaction.address);
      console.log('🎯 [WALLET-SERVICE] Target address:', toAddress.toString());
      
      // تبدیل payload از hex string به Cell
      console.log('🔧 [WALLET-SERVICE] Processing payload...');
      let payloadCell: Cell;
      try {
        // اگر payload hex string است، آن را به Cell تبدیل کن
        if (transaction.payload.startsWith('0x') || /^[0-9a-fA-F]+$/.test(transaction.payload)) {
          console.log('🔧 [WALLET-SERVICE] Processing hex payload');
          // حذف 0x اگر وجود دارد
          const hexPayload = transaction.payload.replace('0x', '');
          // تبدیل hex به Buffer
          const buffer = Buffer.from(hexPayload, 'hex');
          
          console.log('🔧 [WALLET-SERVICE] Hex payload details:', {
            originalLength: transaction.payload.length,
            hexLength: hexPayload.length,
            bufferLength: buffer.length
          });
          
          // ایجاد Cell از buffer
          payloadCell = beginCell()
            .storeBuffer(buffer)
            .endCell();
        } else {
          console.log('🔧 [WALLET-SERVICE] Processing base64 payload');
          // اگر payload base64 است
          payloadCell = Cell.fromBase64(transaction.payload);
        }
        
        console.log('✅ [WALLET-SERVICE] Payload processed successfully:', {
          cellBits: payloadCell.bits.length,
          cellRefs: payloadCell.refs.length
        });
      } catch (error) {
        console.error('❌ [WALLET-SERVICE] Error parsing payload:', error);
        // در صورت خطا، از payload به عنوان text استفاده کن
        payloadCell = beginCell()
          .storeUint(0, 32) // op = 0 (Text Comment)
          .storeStringTail(transaction.payload)
          .endCell();
        console.log('⚠️ [WALLET-SERVICE] Fallback to text comment payload');
      }

      console.log('🚀 [WALLET-SERVICE] Sending transaction...');
      // ارسال تراکنش
      await contract.sendTransfer({
        seqno,
        secretKey: key.secretKey,
        messages: [internal({
          to: toAddress,
          value: toNano(requiredAmount.toString()),
          body: payloadCell
        })]
      });

      console.log('✅ [WALLET-SERVICE] Transaction sent successfully');
      return {
        success: true,
        txHash: 'pending'
      };

    } catch (error) {
      console.error('💥 [WALLET-SERVICE] Error confirming stars transaction:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در تایید تراکنش'
      };
    }
  }

  /**
   * بررسی وضعیت تراکنش
   */
  async getTransactionStatus(txHash: string): Promise<{
    success: boolean;
    confirmed: boolean;
    error?: string;
  }> {
    try {
      // اینجا می‌تونیم از TON API استفاده کنیم تا وضعیت تراکنش رو چک کنیم
      // فعلاً یک پیام ساده برمی‌گردونیم
      return {
        success: true,
        confirmed: true
      };
    } catch (error) {
      return {
        success: false,
        confirmed: false,
        error: error instanceof Error ? error.message : 'خطا در بررسی وضعیت تراکنش'
      };
    }
  }

  /**
   * تست تبدیل payload
   */
  testPayloadConversion(payload: string): {
    success: boolean;
    cell?: Cell;
    error?: string;
  } {
    try {
      let payloadCell: Cell;
      
      if (payload.startsWith('0x') || /^[0-9a-fA-F]+$/.test(payload)) {
        const hexPayload = payload.replace('0x', '');
        const buffer = Buffer.from(hexPayload, 'hex');
        payloadCell = beginCell()
          .storeBuffer(buffer)
          .endCell();
      } else {
        payloadCell = Cell.fromBase64(payload);
      }

      return {
        success: true,
        cell: payloadCell
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در تبدیل payload'
      };
    }
  }
}

export default WalletService;
