import { TransactionDetails, PaymentMethod, TransactionStatus } from './transaction-types';

export interface PlatformTemplate {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fields: {
    transactionId: string;
    referenceFormat: string;
    feeStructure: (amount: number) => number;
    additionalFields: Record<string, any>;
  };
}

export const PLATFORM_TEMPLATES: Record<string, PlatformTemplate> = {
  binance: {
    id: 'binance',
    name: 'Binance',
    logo: '🔶',
    primaryColor: '#F0B90B',
    backgroundColor: '#1E2329',
    textColor: '#FFFFFF',
    fields: {
      transactionId: 'TXN',
      referenceFormat: 'BN-{timestamp}-{random}',
      feeStructure: (amount) => amount * 0.001, // 0.1%
      additionalFields: {
        network: 'BSC',
        blockHeight: Math.floor(Math.random() * 1000000),
        confirmations: 12,
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
      }
    }
  },
  bybit: {
    id: 'bybit',
    name: 'Bybit',
    logo: '🟡',
    primaryColor: '#F7931A',
    backgroundColor: '#0B0E11',
    textColor: '#FFFFFF',
    fields: {
      transactionId: 'BB',
      referenceFormat: 'BB-{timestamp}-{random}',
      feeStructure: (amount) => amount * 0.0006, // 0.06%
      additionalFields: {
        network: 'Ethereum',
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        gasPrice: '15 Gwei',
        walletAddress: '0x' + Math.random().toString(16).substr(2, 40)
      }
    }
  },
  wise: {
    id: 'wise',
    name: 'Wise (TransferWise)',
    logo: '💚',
    primaryColor: '#00B9FF',
    backgroundColor: '#FFFFFF',
    textColor: '#2E2E2E',
    fields: {
      transactionId: 'WISE',
      referenceFormat: 'WISE-{timestamp}-{random}',
      feeStructure: (amount) => Math.max(1.50, amount * 0.005), // $1.50 min or 0.5%
      additionalFields: {
        exchangeRate: '1.00 USD = 0.85 EUR',
        routingNumber: 'SWIFT: TRWIGB2L',
        accountNumber: '**** **** **** ' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        estimatedArrival: '1-2 business days'
      }
    }
  },
  revolut: {
    id: 'revolut',
    name: 'Revolut',
    logo: '🏦',
    primaryColor: '#0075EB',
    backgroundColor: '#FFFFFF',
    textColor: '#2E2E2E',
    fields: {
      transactionId: 'REV',
      referenceFormat: 'REV-{timestamp}-{random}',
      feeStructure: (amount) => amount < 1000 ? 0 : amount * 0.002, // Free under $1000, then 0.2%
      additionalFields: {
        cardType: 'Virtual Mastercard',
        cardNumber: '**** **** **** ' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        merchantCategory: 'Online Services',
        location: 'Online Transaction'
      }
    }
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    logo: '💙',
    primaryColor: '#0070BA',
    backgroundColor: '#FFFFFF',
    textColor: '#2C2E2F',
    fields: {
      transactionId: 'PP',
      referenceFormat: 'PP-{timestamp}-{random}',
      feeStructure: (amount) => amount * 0.034 + 0.30, // 3.4% + $0.30
      additionalFields: {
        paypalEmail: 'user@example.com',
        protectionEligible: true,
        invoiceId: 'INV-' + Math.random().toString(36).substr(2, 9),
        sellerProtection: 'Eligible'
      }
    }
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    logo: '💜',
    primaryColor: '#635BFF',
    backgroundColor: '#FFFFFF',
    textColor: '#32325D',
    fields: {
      transactionId: 'CH',
      referenceFormat: 'ch_{random}',
      feeStructure: (amount) => amount * 0.029 + 0.30, // 2.9% + $0.30
      additionalFields: {
        paymentMethod: 'card_****4242',
        riskLevel: 'normal',
        customerEmail: 'customer@example.com',
        receiptUrl: 'https://pay.stripe.com/receipts/...'
      }
    }
  }
};

export function generatePlatformTransaction(
  platformId: string,
  amount: number,
  currency: string,
  status: TransactionStatus
): TransactionDetails & { platformData: any } {
  const template = PLATFORM_TEMPLATES[platformId];
  if (!template) {
    throw new Error(`Platform template not found: ${platformId}`);
  }

  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  
  const referenceId = template.fields.referenceFormat
    .replace('{timestamp}', timestamp.toString())
    .replace('{random}', random);

  const transactionId = `${template.fields.transactionId}_${timestamp}_${random}`;
  
  const processingFee = template.fields.feeStructure(amount);

  // Generate platform-specific gateway responses
  let gatewayResponse = '';
  switch (status) {
    case 'completed':
      gatewayResponse = `${template.name}: Transaction processed successfully`;
      break;
    case 'pending':
      gatewayResponse = `${template.name}: Payment pending verification`;
      break;
    case 'failed':
      gatewayResponse = `${template.name}: Processing failed - Please retry`;
      break;
    case 'declined':
      gatewayResponse = `${template.name}: Transaction declined by issuer`;
      break;
    default:
      gatewayResponse = `${template.name}: Status ${status}`;
  }

  return {
    id: transactionId,
    paymentMethod: platformId as PaymentMethod,
    status,
    amount,
    currency,
    transactionDate: new Date().toISOString(),
    referenceId,
    processingFee: Math.round(processingFee * 100) / 100,
    gatewayResponse,
    platformData: {
      platform: template.name,
      logo: template.logo,
      colors: {
        primary: template.primaryColor,
        background: template.backgroundColor,
        text: template.textColor
      },
      ...template.fields.additionalFields
    }
  };
}

export const PLATFORM_SPECIFIC_STATUSES = {
  binance: {
    'completed': 'Confirmed',
    'pending': 'Confirming',
    'failed': 'Failed',
    'processing': 'Processing'
  },
  bybit: {
    'completed': 'Success',
    'pending': 'Pending',
    'failed': 'Failed',
    'processing': 'Processing'
  },
  wise: {
    'completed': 'Completed',
    'pending': 'Processing',
    'failed': 'Failed',
    'on_hold': 'Under Review'
  },
  revolut: {
    'completed': 'Completed',
    'pending': 'Pending',
    'failed': 'Declined',
    'processing': 'Processing'
  },
  paypal: {
    'completed': 'Completed',
    'pending': 'Pending',
    'failed': 'Failed',
    'on_hold': 'Under Review'
  },
  stripe: {
    'completed': 'Succeeded',
    'pending': 'Pending',
    'failed': 'Failed',
    'processing': 'Processing'
  }
};

export function getPlatformStatusText(platformId: string, status: TransactionStatus): string {
  const platformStatuses = PLATFORM_SPECIFIC_STATUSES[platformId as keyof typeof PLATFORM_SPECIFIC_STATUSES];
  return platformStatuses?.[status as keyof typeof platformStatuses] || status;
}