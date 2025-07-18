import { useQuery } from "@tanstack/react-query";
import { InvoiceWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export function RecentInvoices() {
  const { data: invoices = [], isLoading } = useQuery<InvoiceWithDetails[]>({
    queryKey: ["/api/invoices"],
  });

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-slate-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { className: "bg-green-100 text-green-800", label: "Paid" },
      sent: { className: "bg-blue-100 text-blue-800", label: "Sent" },
      draft: { className: "bg-gray-100 text-gray-800", label: "Draft" },
      overdue: { className: "bg-red-100 text-red-800", label: "Overdue" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Recent Invoices</h3>
      </div>
      <div className="p-6">
        {recentInvoices.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No invoices found</p>
        ) : (
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-slate-500">{invoice.client?.name || 'No client'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">${parseFloat(invoice.total).toFixed(2)}</p>
                  {getStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          View All Invoices
        </button>
      </div>
    </div>
  );
}
