import { useState } from "react";
import { Header } from "@/components/header";
import { TransactionManager } from "@/components/transaction-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Filter
} from "lucide-react";
import { TransactionDetails, TRANSACTION_STATUSES, STATUS_CONFIGS } from "@/lib/transaction-types";

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'BTC', 'ETH'];

export default function Transactions() {
  const [testAmount, setTestAmount] = useState(100);
  const [testCurrency, setTestCurrency] = useState('USD');
  const [allTransactions, setAllTransactions] = useState<TransactionDetails[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleTransactionUpdate = (transaction: TransactionDetails) => {
    setAllTransactions(prev => [transaction, ...prev]);
  };

  const getStatusStats = () => {
    const stats = {
      total: allTransactions.length,
      completed: allTransactions.filter(t => t.status === 'completed').length,
      pending: allTransactions.filter(t => t.status === 'pending' || t.status === 'processing').length,
      failed: allTransactions.filter(t => t.status === 'failed' || t.status === 'declined').length,
      totalAmount: allTransactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)
    };
    return stats;
  };

  const filteredTransactions = filterStatus === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.status === filterStatus);

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction Center</h1>
          <p className="text-gray-600">Test and simulate payment transactions across different methods and statuses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending/Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed/Declined</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="simulator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simulator">🧪 Transaction Simulator</TabsTrigger>
            <TabsTrigger value="analytics">📊 Analytics & History</TabsTrigger>
          </TabsList>

          <TabsContent value="simulator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Test Configuration */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Test Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="test-amount">Test Amount</Label>
                      <Input
                        id="test-amount"
                        type="number"
                        step="0.01"
                        value={testAmount}
                        onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                        placeholder="100.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="test-currency">Currency</Label>
                      <Select value={testCurrency} onValueChange={setTestCurrency}>
                        <SelectTrigger id="test-currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Quick Test Scenarios</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setTestAmount(50)}
                        >
                          Small Purchase ($50)
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setTestAmount(500)}
                        >
                          Medium Order ($500)
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => setTestAmount(5000)}
                        >
                          Large Transaction ($5,000)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Simulator */}
              <div className="lg:col-span-2">
                <TransactionManager
                  invoiceAmount={testAmount}
                  currency={testCurrency}
                  onTransactionUpdate={handleTransactionUpdate}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Transaction History with Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(TRANSACTION_STATUSES).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                    <p className="text-gray-500 mb-4">
                      {filterStatus === 'all' 
                        ? 'Generate some test transactions to see them here'
                        : `No transactions with "${TRANSACTION_STATUSES[filterStatus as keyof typeof TRANSACTION_STATUSES]}" status`
                      }
                    </p>
                    <Button variant="outline" onClick={() => setFilterStatus('all')}>
                      Show All Transactions
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction, index) => (
                      <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                Transaction #{allTransactions.length - index}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(transaction.transactionDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: transaction.currency,
                              }).format(transaction.amount)}
                            </p>
                            <Badge 
                              className="mt-1"
                              style={{
                                backgroundColor: STATUS_CONFIGS[transaction.status].bgColor,
                                color: STATUS_CONFIGS[transaction.status].color
                              }}
                            >
                              {STATUS_CONFIGS[transaction.status].icon} {TRANSACTION_STATUSES[transaction.status]}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Method:</span>
                            <p className="font-medium">{transaction.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Reference:</span>
                            <p className="font-medium">{transaction.referenceId}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Fee:</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: transaction.currency,
                              }).format(transaction.processingFee || 0)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Net:</span>
                            <p className="font-medium">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: transaction.currency,
                              }).format(transaction.amount - (transaction.processingFee || 0))}
                            </p>
                          </div>
                        </div>

                        {transaction.reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm font-medium text-red-800">Issue:</p>
                            <p className="text-sm text-red-700">{transaction.reason}</p>
                            {transaction.solution && (
                              <>
                                <p className="text-sm font-medium text-red-800 mt-2">Recommended Action:</p>
                                <p className="text-sm text-red-700">{transaction.solution}</p>
                              </>
                            )}
                          </div>
                        )}

                        {transaction.gatewayResponse && (
                          <div className="mt-2 text-xs text-gray-500">
                            Gateway Response: {transaction.gatewayResponse}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}