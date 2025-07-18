export const PAYMENT_METHODS = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card', 
  debit_card: 'Debit Card',
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  paypal: 'PayPal',
  stripe: 'Stripe',
  wire_transfer: 'Wire Transfer',
  check: 'Check',
  cash: 'Cash'
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

export const TRANSACTION_STATUSES = {
  pending: 'Pending',
  processing: 'Processing', 
  completed: 'Completed',
  failed: 'Failed',
  declined: 'Declined',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  partial_refund: 'Partial Refund'
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUSES;

export interface TransactionDetails {
  id: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  amount: number;
  currency: string;
  transactionDate: string;
  reason?: string;
  solution?: string;
  referenceId?: string;
  processingFee?: number;
  gatewayResponse?: string;
}

export const STATUS_CONFIGS = {
  pending: {
    color: '#f59e0b',
    bgColor: '#fef3c7',
    icon: '⏳',
    description: 'Payment is being processed'
  },
  processing: {
    color: '#3b82f6',
    bgColor: '#dbeafe', 
    icon: '🔄',
    description: 'Transaction is in progress'
  },
  completed: {
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: '✅',
    description: 'Payment successful'
  },
  failed: {
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: '❌',
    description: 'Payment failed'
  },
  declined: {
    color: '#dc2626',
    bgColor: '#fecaca',
    icon: '🚫',
    description: 'Payment declined by bank/gateway'
  },
  on_hold: {
    color: '#f97316',
    bgColor: '#fed7aa',
    icon: '⏸️',
    description: 'Payment on hold for review'
  },
  cancelled: {
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: '⛔',
    description: 'Payment cancelled'
  },
  refunded: {
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    icon: '↩️',
    description: 'Payment refunded'
  },
  partial_refund: {
    color: '#a855f7',
    bgColor: '#f3e8ff',
    icon: '↪️',
    description: 'Partial refund issued'
  }
};

export const COMMON_FAILURE_REASONS = {
  insufficient_funds: 'Insufficient funds in account',
  card_declined: 'Card declined by issuing bank',
  expired_card: 'Credit/debit card expired',
  invalid_cvv: 'Invalid CVV/security code',
  fraud_detected: 'Suspected fraudulent activity',
  network_error: 'Network connection error',
  gateway_timeout: 'Payment gateway timeout',
  invalid_account: 'Invalid bank account details',
  limit_exceeded: 'Transaction limit exceeded',
  currency_not_supported: 'Currency not supported'
};

export const COMMON_SOLUTIONS = {
  insufficient_funds: 'Add funds to account or use alternative payment method',
  card_declined: 'Contact your bank or try a different card',
  expired_card: 'Use a valid, non-expired card',
  invalid_cvv: 'Double-check and re-enter CVV code',
  fraud_detected: 'Contact bank to verify transaction or use alternative method',
  network_error: 'Check internet connection and retry',
  gateway_timeout: 'Wait a few minutes and try again',
  invalid_account: 'Verify and correct bank account information',
  limit_exceeded: 'Contact bank to increase limit or split payment',
  currency_not_supported: 'Use supported currency or alternative payment method'
};

export function generateMockTransaction(
  amount: number,
  currency: string,
  paymentMethod: PaymentMethod,
  status: TransactionStatus
): TransactionDetails {
  const id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const referenceId = `REF_${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
  
  let reason: string | undefined;
  let solution: string | undefined;
  let processingFee = 0;
  
  // Add realistic processing fees
  switch (paymentMethod) {
    case 'credit_card':
    case 'debit_card':
      processingFee = amount * 0.029 + 0.30; // 2.9% + $0.30
      break;
    case 'paypal':
      processingFee = amount * 0.034 + 0.30; // 3.4% + $0.30
      break;
    case 'bitcoin':
    case 'ethereum':
      processingFee = amount * 0.01; // 1%
      break;
    case 'bank_transfer':
    case 'wire_transfer':
      processingFee = 25.00; // Flat fee
      break;
  }
  
  // Add reasons and solutions for failed transactions
  if (['failed', 'declined', 'on_hold'].includes(status)) {
    const reasons = Object.keys(COMMON_FAILURE_REASONS);
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)] as keyof typeof COMMON_FAILURE_REASONS;
    reason = COMMON_FAILURE_REASONS[randomReason];
    solution = COMMON_SOLUTIONS[randomReason];
  }
  
  let gatewayResponse: string | undefined;
  switch (status) {
    case 'completed':
      gatewayResponse = 'Transaction approved';
      break;
    case 'declined':
      gatewayResponse = 'Declined - Contact card issuer';
      break;
    case 'failed':
      gatewayResponse = 'Processing error occurred';
      break;
    case 'on_hold':
      gatewayResponse = 'Manual review required';
      break;
  }
  
  return {
    id,
    paymentMethod,
    status,
    amount,
    currency,
    transactionDate: new Date().toISOString(),
    reason,
    solution,
    referenceId,
    processingFee: Math.round(processingFee * 100) / 100,
    gatewayResponse
  };
}

export function getStatusBadgeProps(status: TransactionStatus) {
  const config = STATUS_CONFIGS[status];
  return {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`,
    style: {
      backgroundColor: config.bgColor,
      color: config.color
    },
    children: `${config.icon} ${TRANSACTION_STATUSES[status]}`
  };
}