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
  const [customReason, setCustomReason] = useState('');
  const [customSolution, setCustomSolution] = useState('');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const { toast } = useToast();

  const generateTransaction = () => {
    const transaction = generateMockTransaction(
      invoiceAmount,
      currency,
      selectedPaymentMethod,
      selectedStatus
    );

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

    toast({
      title: "Transaction Generated",
      description: `${PAYMENT_METHODS[selectedPaymentMethod]} transaction with ${TRANSACTION_STATUSES[selectedStatus]} status`,
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
        {/* Transaction Generator */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select 
                value={selectedPaymentMethod} 
                onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}
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
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {PAYMENT_METHOD_ICONS[transaction.paymentMethod]}
                      <div>
                        <p className="font-medium text-sm">
                          {PAYMENT_METHODS[transaction.paymentMethod]}
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
                        {STATUS_CONFIGS[transaction.status].icon} {TRANSACTION_STATUSES[transaction.status]}
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
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}