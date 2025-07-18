import { InvoiceWithDetails } from "@shared/schema";
import { motion } from "framer-motion";
import { INVOICE_TYPE_CONFIGS } from "@/lib/invoice-types";

interface AnimatedInvoicePreviewProps {
  invoice: Partial<InvoiceWithDetails>;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    total: number;
  }>;
  taxRate: number;
  discount: number;
  logoUrl?: string;
  letterheadTemplate?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundStyle?: string;
  stampUrl?: string;
}

export function AnimatedInvoicePreview({
  invoice,
  lineItems,
  taxRate,
  discount,
  logoUrl,
  letterheadTemplate = "modern",
  primaryColor = "#3b82f6",
  secondaryColor = "#1e40af",
  backgroundStyle = "clean",
  stampUrl
}: AnimatedInvoicePreviewProps) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount - discount;

  const getBackgroundStyle = () => {
    switch (backgroundStyle) {
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08)`
        };
      case 'pattern':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        };
      case 'watermark':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='100' y='100' text-anchor='middle' dominant-baseline='middle' fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.05' font-size='24' font-weight='bold' transform='rotate(-45 100 100)'%3EINVOICE%3C/text%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px'
        };
      default:
        return { background: '#ffffff' };
    }
  };

  const getLetterheadStyle = () => {
    switch (letterheadTemplate) {
      case 'corporate':
        return 'border-b-4';
      case 'creative':
        return 'bg-gradient-to-r from-transparent via-white to-transparent border-b-2';
      case 'luxury':
        return 'border-b border-t bg-gradient-to-r from-gray-50 to-white';
      default:
        return 'border-b-2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className={`px-8 py-6 ${getLetterheadStyle()}`}
        style={{ 
          borderColor: primaryColor,
          ...getBackgroundStyle()
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {logoUrl && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                src={logoUrl}
                alt="Company Logo"
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                INVOICE
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm"
                style={{ color: secondaryColor }}
              >
                {INVOICE_TYPE_CONFIGS[invoice.type as keyof typeof INVOICE_TYPE_CONFIGS]?.label || 'Standard Invoice'}
              </motion.p>
            </div>
          </div>
          
          {/* Invoice Number Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="text-right"
          >
            <div
              className="inline-block px-4 py-2 rounded-full text-white font-bold text-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {invoice.invoiceNumber || 'INV-2025-001'}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-8 space-y-6" style={getBackgroundStyle()}>
        {/* Invoice Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 gap-8"
        >
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <div className="text-gray-600">
              <p className="font-medium">{invoice.client?.name || 'Client Name'}</p>
              <p>{invoice.client?.email || 'client@example.com'}</p>
              <p>{invoice.client?.address || '123 Business St, City, State'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">Invoice Date:</span> {invoice.invoiceDate || new Date().toLocaleDateString()}</div>
              {invoice.dueDate && <div><span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</div>}
              <div><span className="font-medium">Currency:</span> {invoice.currency || 'USD'}</div>
            </div>
          </div>
        </motion.div>

        {/* Line Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="overflow-hidden rounded-lg border border-gray-200"
        >
          <table className="w-full">
            <thead style={{ backgroundColor: `${primaryColor}10` }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {invoice.currency} {item.rate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                    {invoice.currency} {item.total.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Totals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
          className="flex justify-end"
        >
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{invoice.currency || 'USD'} {subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({taxRate}%):</span>
                <span>{invoice.currency || 'USD'} {taxAmount.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount:</span>
                <span>-{invoice.currency || 'USD'} {discount.toFixed(2)}</span>
              </div>
            )}
            <div 
              className="flex justify-between font-bold text-lg pt-2 border-t-2"
              style={{ borderColor: primaryColor }}
            >
              <span>Total:</span>
              <span style={{ color: primaryColor }}>
                {invoice.currency || 'USD'} {total.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stamp */}
        {stampUrl && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring", bounce: 0.6 }}
            className="flex justify-end"
          >
            <img
              src={stampUrl}
              alt="Stamp"
              className="w-24 h-24 opacity-80"
            />
          </motion.div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg"
          >
            <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}