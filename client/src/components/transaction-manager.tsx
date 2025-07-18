import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Banknote, 
  Bitcoin, 
  Shuffle, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Plus
} from "lucide-react";

import {
  PAYMENT_METHODS,
  TRANSACTION_STATUSES,
  STATUS_CONFIGS,
  COMMON_FAILURE_REASONS,
  COMMON_SOLUTIONS,
  generateMockTransaction,
  getStatusBadgeProps,
  type PaymentMethod,
  type TransactionStatus,
  type TransactionDetails
} from "@/lib/transaction-types";
import { 
  PLATFORM_TEMPLATES, 
  generatePlatformTransaction,
  getPlatformStatusText
} from "@/lib/platform-templates";

interface TransactionManagerProps {
  invoiceAmount: number;
  currency: string;
  onTransactionUpdate?: (transaction: TransactionDetails) => void;
}

const PAYMENT_METHOD_ICONS = {
  bank_transfer: <Banknote className="h-4 w-4" />,
  credit_card: <CreditCard className="h-4 w-4" />,
  debit_card: <CreditCard className="h-4 w-4" />,
  bitcoin: <Bitcoin className="h-4 w-4" />,
  ethereum: <Bitcoin className="h-4 w-4" />,
  paypal: <CreditCard className="h-4 w-4" />,
  stripe: <CreditCard className="h-4 w-4" />,
  wire_transfer: <Banknote className="h-4 w-4" />,
  check: <Banknote className="h-4 w-4" />,
  cash: <Banknote className="h-4 w-4" />
};

export function TransactionManager({ invoiceAmount, currency, onTransactionUpdate }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus>('completed');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [customSolution, setCustomSolution] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTransaction = () => {
    let transaction;
    
    if (selectedPlatform && PLATFORM_TEMPLATES[selectedPlatform]) {
      // Generate platform-specific transaction
      transaction = generatePlatformTransaction(
        selectedPlatform,
        invoiceAmount,
        currency,
        selectedStatus
      );
    } else {
      // Generate regular mock transaction
      transaction = generateMockTransaction(
        invoiceAmount,
        currency,
        selectedPaymentMethod,
        selectedStatus
      );
    }

    // Override with custom reason/solution if provided
    if (customReason.trim()) {
      transaction.reason = customReason.trim();
    }
    if (customSolution.trim()) {
      transaction.solution = customSolution.trim();
    }

    setTransactions(prev => [transaction, ...prev]);
    
    if (onTransactionUpdate) {
      onTransactionUpdate(transaction);
    }

    const platformName = selectedPlatform ? PLATFORM_TEMPLATES[selectedPlatform].name : PAYMENT_METHODS[selectedPaymentMethod];
    toast({
      title: "Transaction Generated",
      description: `${platformName} transaction with ${TRANSACTION_STATUSES[selectedStatus]} status`,
    });

    // Clear custom fields
    setCustomReason('');
    setCustomSolution('');
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      case 'on_hold':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Transaction Simulator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Mock payment transactions for testing purposes
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Template Menu Bar */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Choose Platform Template</Label>
            <p className="text-sm text-gray-600 mb-3">Select a platform to generate realistic transaction data with authentic styling</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {/* Generic Option */}
              <button
                onClick={() => setSelectedPlatform('')}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedPlatform === '' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <p className="text-xs font-medium text-gray-900">Generic</p>
                  <p className="text-xs text-gray-500">Standard</p>
                </div>
              </button>

              {/* Platform Templates */}
              {Object.entries(PLATFORM_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedPlatform === key 
                      ? 'border-2 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={selectedPlatform === key ? {
                    borderColor: template.primaryColor,
                    backgroundColor: `${template.primaryColor}10`
                  } : {}}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-white rounded-full flex items-center justify-center shadow-sm border">
                      <span className="text-lg">{template.logo}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">
                      {key === 'binance' || key === 'bybit' ? 'Crypto' : 
                       key === 'wise' || key === 'revolut' ? 'Banking' : 'Payment'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {selectedPlatform && PLATFORM_TEMPLATES[selectedPlatform] && (
              <div className="mt-3 p-3 rounded-lg border" style={{
                backgroundColor: `${PLATFORM_TEMPLATES[selectedPlatform].primaryColor}08`,
                borderColor: `${PLATFORM_TEMPLATES[selectedPlatform].primaryColor}30`
              }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{PLATFORM_TEMPLATES[selectedPlatform].logo}</span>
                  <span className="font-medium">{PLATFORM_TEMPLATES[selectedPlatform].name}</span>
                  <span className="text-sm text-gray-500">Selected</span>
                </div>
                <p className="text-xs text-gray-600">
                  {selectedPlatform === 'binance' ? 'Cryptocurrency exchange with BSC network support and 0.1% fees' :
                   selectedPlatform === 'bybit' ? 'Crypto trading platform with Ethereum network and 0.06% fees' :
                   selectedPlatform === 'wise' ? 'International money transfers with real exchange rates and low fees' :
                   selectedPlatform === 'revolut' ? 'Digital banking with virtual cards and free transfers under $1000' :
                   selectedPlatform === 'paypal' ? 'Digital payments with buyer protection and 3.4% + $0.30 fees' :
                   selectedPlatform === 'stripe' ? 'Payment processing with 2.9% + $0.30 fees and developer tools' :
                   'Generic transaction template'}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={selectedPaymentMethod} 
                onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
                disabled={!!selectedPlatform}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {PAYMENT_METHOD_ICONS[key as PaymentMethod]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlatform && (
                <p className="text-xs text-gray-500 mt-1">
                  Payment method automatically set by platform template
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="transaction-status">Transaction Status</Label>
              <Select 
                value={selectedStatus} 
                onValueChange={(value) => setSelectedStatus(value as TransactionStatus)}
              >
                <SelectTrigger id="transaction-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSACTION_STATUSES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(key as TransactionStatus)}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Reason & Solution for Failed Transactions */}
          {['failed', 'declined', 'on_hold'].includes(selectedStatus) && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="custom-reason">Custom Failure Reason</Label>
                <Select
                  value={customReason}
                  onValueChange={setCustomReason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason or enter custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COMMON_FAILURE_REASONS).map(([key, reason]) => (
                      <SelectItem key={key} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Or enter custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="custom-solution">Suggested Solution</Label>
                <Textarea
                  id="custom-solution"
                  placeholder="Enter suggested solution for the customer..."
                  value={customSolution}
                  onChange={(e) => setCustomSolution(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={generateTransaction}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate Mock Transaction
          </Button>
        </div>

        <Separator />

        {/* Transaction History */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Transaction History</h4>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No transactions generated yet</p>
              <p className="text-sm">Create mock transactions to test payment flows</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => {
                const platformData = (transaction as any).platformData;
                const isPlatformTransaction = !!platformData;
                
                return (
                <div 
                  key={transaction.id} 
                  className="border border-gray-200 rounded-lg p-4"
                  style={isPlatformTransaction ? {
                    background: `linear-gradient(135deg, ${platformData.colors.background}15, ${platformData.colors.primary}05)`,
                    borderColor: `${platformData.colors.primary}30`
                  } : {}}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {isPlatformTransaction ? (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border">
                          <span className="text-lg">{platformData.logo}</span>
                        </div>
                      ) : (
                        PAYMENT_METHOD_ICONS[transaction.paymentMethod]
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {isPlatformTransaction ? platformData.platform : PAYMENT_METHODS[transaction.paymentMethod]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transactionDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                      <Badge 
                        className="mt-1"
                        style={getStatusBadgeProps(transaction.status).style}
                      >
                        {STATUS_CONFIGS[transaction.status].icon} {
                          isPlatformTransaction 
                            ? getPlatformStatusText(transaction.paymentMethod, transaction.status)
                            : TRANSACTION_STATUSES[transaction.status]
                        }
                      </Badge>
                    </div>
                  </div>

                  {transaction.reason && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800">Reason:</p>
                      <p className="text-sm text-red-700">{transaction.reason}</p>
                      {transaction.solution && (
                        <>
                          <p className="text-sm font-medium text-red-800 mt-2">Solution:</p>
                          <p className="text-sm text-red-700">{transaction.solution}</p>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      ID: {transaction.id}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(showDetails === transaction.id ? null : transaction.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      {showDetails === transaction.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>

                  {showDetails === transaction.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-xs space-y-1">
                      <div><strong>Reference ID:</strong> {transaction.referenceId}</div>
                      <div><strong>Processing Fee:</strong> {formatCurrency(transaction.processingFee || 0)}</div>
                      {transaction.gatewayResponse && (
                        <div><strong>Gateway Response:</strong> {transaction.gatewayResponse}</div>
                      )}
                      
                      {isPlatformTransaction && (
                        <>
                          <div className="border-t pt-2 mt-2">
                            <div className="font-semibold text-gray-700 mb-1">Platform Details:</div>
                            {platformData.walletAddress && (
                              <div><strong>Wallet:</strong> {platformData.walletAddress}</div>
                            )}
                            {platformData.network && (
                              <div><strong>Network:</strong> {platformData.network}</div>
                            )}
                            {platformData.blockHeight && (
                              <div><strong>Block Height:</strong> {platformData.blockHeight.toLocaleString()}</div>
                            )}
                            {platformData.confirmations && (
                              <div><strong>Confirmations:</strong> {platformData.confirmations}</div>
                            )}
                            {platformData.gasUsed && (
                              <div><strong>Gas Used:</strong> {platformData.gasUsed.toLocaleString()}</div>
                            )}
                            {platformData.gasPrice && (
                              <div><strong>Gas Price:</strong> {platformData.gasPrice}</div>
                            )}
                            {platformData.exchangeRate && (
                              <div><strong>Exchange Rate:</strong> {platformData.exchangeRate}</div>
                            )}
                            {platformData.routingNumber && (
                              <div><strong>Routing:</strong> {platformData.routingNumber}</div>
                            )}
                            {platformData.accountNumber && (
                              <div><strong>Account:</strong> {platformData.accountNumber}</div>
                            )}
                            {platformData.estimatedArrival && (
                              <div><strong>Estimated Arrival:</strong> {platformData.estimatedArrival}</div>
                            )}
                            {platformData.cardType && (
                              <div><strong>Card Type:</strong> {platformData.cardType}</div>
                            )}
                            {platformData.cardNumber && (
                              <div><strong>Card Number:</strong> {platformData.cardNumber}</div>
                            )}
                            {platformData.merchantCategory && (
                              <div><strong>Merchant Category:</strong> {platformData.merchantCategory}</div>
                            )}
                            {platformData.location && (
                              <div><strong>Location:</strong> {platformData.location}</div>
                            )}
                            {platformData.paypalEmail && (
                              <div><strong>PayPal Email:</strong> {platformData.paypalEmail}</div>
                            )}
                            {platformData.protectionEligible && (
                              <div><strong>Protection:</strong> Eligible</div>
                            )}
                            {platformData.invoiceId && (
                              <div><strong>Invoice ID:</strong> {platformData.invoiceId}</div>
                            )}
                            {platformData.paymentMethod && (
                              <div><strong>Payment Method:</strong> {platformData.paymentMethod}</div>
                            )}
                            {platformData.riskLevel && (
                              <div><strong>Risk Level:</strong> {platformData.riskLevel}</div>
                            )}
                            {platformData.customerEmail && (
                              <div><strong>Customer Email:</strong> {platformData.customerEmail}</div>
                            )}
                            {platformData.receiptUrl && (
                              <div><strong>Receipt:</strong> <span className="text-blue-600">Available</span></div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}