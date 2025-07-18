import { InvoiceWithDetails } from "@shared/schema";

interface EnhancedInvoiceData extends InvoiceWithDetails {
  logoUrl?: string;
  letterheadTemplate?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundStyle?: string;
  stampUrl?: string;
}

export async function generateInvoicePDF(invoice: EnhancedInvoiceData): Promise<Blob> {
  const primaryColor = invoice.primaryColor || "#3b82f6";
  const secondaryColor = invoice.secondaryColor || "#1e40af";
  const backgroundStyle = invoice.backgroundStyle || "clean";
  
  const getBackgroundCSS = () => {
    switch (backgroundStyle) {
      case 'gradient':
        return `background: linear-gradient(135deg, ${primaryColor}08, ${secondaryColor}08);`;
      case 'pattern':
        return `background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");`;
      case 'watermark':
        return `background-image: url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='100' y='100' text-anchor='middle' dominant-baseline='middle' fill='${primaryColor.replace('#', '%23')}' fill-opacity='0.05' font-size='24' font-weight='bold' transform='rotate(-45 100 100)'%3EINVOICE%3C/text%3E%3C/svg%3E"); background-repeat: repeat; background-size: 200px 200px;`;
      default:
        return 'background: #ffffff;';
    }
  };

  // Create HTML content for the invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          margin: 0; 
          line-height: 1.6;
          color: #333;
          ${getBackgroundCSS()}
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 40px; 
          border-bottom: 3px solid ${primaryColor};
          padding: 30px 40px 20px;
          background: linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}05);
        }
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo {
          height: 60px;
          width: auto;
          object-fit: contain;
        }
        .invoice-title { 
          font-size: 36px; 
          font-weight: bold; 
          color: ${primaryColor};
          margin: 0;
        }
        .invoice-subtitle {
          font-size: 14px;
          color: ${secondaryColor};
          margin: 5px 0 0 0;
        }
        .invoice-number { 
          background: ${primaryColor};
          color: white;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
        }
        .content {
          padding: 0 40px 40px;
        }
        .company-info { 
          text-align: right; 
          color: ${secondaryColor};
        }
        .client-info { 
          margin-bottom: 30px; 
          background: ${primaryColor}08;
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid ${primaryColor};
        }
        .invoice-details { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 30px; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td { 
          padding: 15px; 
          text-align: left; 
          border-bottom: 1px solid #eee; 
        }
        th { 
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); 
          color: white; 
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: ${primaryColor}05;
        }
        .total-section { 
          margin-left: auto; 
          width: 350px;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #eee;
        }
        .total-row.grand-total { 
          font-weight: bold; 
          font-size: 20px; 
          border-top: 2px solid ${primaryColor}; 
          border-bottom: none;
          margin-top: 10px; 
          padding-top: 15px;
          color: ${primaryColor};
        }
        .notes { 
          margin-top: 30px; 
          padding: 25px; 
          background: ${secondaryColor}08; 
          border-radius: 8px;
          border-left: 4px solid ${secondaryColor};
        }
        .stamp {
          position: fixed;
          top: 200px;
          right: 50px;
          width: 120px;
          height: 120px;
          opacity: 0.8;
          z-index: 10;
        }
        @media print {
          body { margin: 0; }
          .invoice-container { box-shadow: none; }
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
