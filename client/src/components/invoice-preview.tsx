import { InvoiceWithDetails } from "@shared/schema";

interface InvoicePreviewProps {
  invoice: Partial<InvoiceWithDetails>;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  taxRate: number;
  discount: number;
}

export function InvoicePreview({ invoice, lineItems, taxRate, discount }: InvoicePreviewProps) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Invoice Summary</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">
            {invoice.currency || 'USD'} {subtotal.toFixed(2)}
          </span>
        </div>
        
        {taxRate > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Tax ({taxRate}%)</span>
            <span className="font-medium text-slate-900">
              {invoice.currency || 'USD'} {taxAmount.toFixed(2)}
            </span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Discount</span>
            <span className="font-medium text-slate-900">
              -{invoice.currency || 'USD'} {discount.toFixed(2)}
            </span>
          </div>
        )}
        
        <hr className="border-slate-200" />
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-slate-900">Total</span>
          <span className="text-lg font-bold text-blue-600">
            {invoice.currency || 'USD'} {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
