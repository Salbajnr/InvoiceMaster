import { InvoiceWithDetails } from "@shared/schema";

export async function generateInvoicePDF(invoice: InvoiceWithDetails): Promise<Blob> {
  // Create HTML content for the invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          line-height: 1.6;
          color: #333;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 40px; 
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .invoice-title { 
          font-size: 32px; 
          font-weight: bold; 
          color: #007bff;
        }
        .invoice-number { 
          font-size: 18px; 
          color: #666; 
        }
        .company-info { 
          text-align: right; 
        }
        .client-info { 
          margin-bottom: 30px; 
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
        }
        th, td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid #ddd; 
        }
        th { 
          background-color: #007bff; 
          color: white; 
          font-weight: bold;
        }
        .total-section { 
          margin-left: auto; 
          width: 300px; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
        }
        .total-row.grand-total { 
          font-weight: bold; 
          font-size: 18px; 
          border-top: 2px solid #007bff; 
          margin-top: 10px; 
          padding-top: 10px;
        }
        .notes { 
          margin-top: 30px; 
          padding: 20px; 
          background: #f8f9fa; 
          border-radius: 8px;
        }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">${invoice.invoiceNumber}</div>
        </div>
        <div class="company-info">
          <strong>InvoicePro</strong><br>
          Professional Invoice Management<br>
          info@invoicepro.com
        </div>
      </div>

      <div class="client-info">
        <h3>Bill To:</h3>
        <strong>${invoice.client?.name || 'N/A'}</strong><br>
        ${invoice.client?.email || ''}<br>
        ${invoice.client?.address || ''}
      </div>

      <div class="invoice-details">
        <div>
          <strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}<br>
          ${invoice.dueDate ? `<strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>` : ''}
          <strong>Status:</strong> ${invoice.status.toUpperCase()}
        </div>
        <div>
          <strong>Payment Terms:</strong> ${invoice.paymentTerms || 'N/A'}<br>
          <strong>Currency:</strong> ${invoice.currency}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${invoice.currency} ${parseFloat(item.rate).toFixed(2)}</td>
              <td>${invoice.currency} ${parseFloat(item.total).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${invoice.currency} ${parseFloat(invoice.subtotal).toFixed(2)}</span>
        </div>
        ${invoice.taxAmount && parseFloat(invoice.taxAmount) > 0 ? `
        <div class="total-row">
          <span>Tax (${invoice.taxRate || 0}%):</span>
          <span>${invoice.currency} ${parseFloat(invoice.taxAmount).toFixed(2)}</span>
        </div>
        ` : ''}
        ${invoice.discount && parseFloat(invoice.discount) > 0 ? `
        <div class="total-row">
          <span>Discount:</span>
          <span>-${invoice.currency} ${parseFloat(invoice.discount).toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>Total:</span>
          <span>${invoice.currency} ${parseFloat(invoice.total).toFixed(2)}</span>
        </div>
      </div>

      ${invoice.notes ? `
      <div class="notes">
        <h3>Notes:</h3>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `;

  // Convert HTML to PDF using browser's print functionality
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    return new Promise((resolve) => {
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        resolve(new Blob([htmlContent], { type: 'text/html' }));
      };
    });
  }
  
  return new Blob([htmlContent], { type: 'text/html' });
}

export function downloadInvoicePDF(invoice: InvoiceWithDetails) {
  generateInvoicePDF(invoice).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
