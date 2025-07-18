export const INVOICE_TYPES = {
  proforma: 'Proforma',
  standard: 'Standard',
  commercial: 'Commercial',
  credit: 'Credit',
  debit: 'Debit',
  recurring: 'Recurring',
  timesheet: 'Timesheet',
  interim: 'Interim',
  final: 'Final',
  pastdue: 'Past Due'
} as const;

export type InvoiceType = keyof typeof INVOICE_TYPES;

export interface InvoiceTypeConfig {
  label: string;
  description: string;
  requiredFields: string[];
  additionalFields: string[];
}

export const INVOICE_TYPE_CONFIGS: Record<InvoiceType, InvoiceTypeConfig> = {
  proforma: {
    label: 'Proforma Invoice',
    description: 'Sent before goods/services are delivered. Serves as a preliminary bill or estimate.',
    requiredFields: ['invoiceDate', 'clientId', 'lineItems'],
    additionalFields: ['validUntil', 'estimateNumber']
  },
  standard: {
    label: 'Standard Invoice',
    description: 'The most common type. Issued after goods/services are delivered.',
    requiredFields: ['invoiceDate', 'dueDate', 'clientId', 'lineItems'],
    additionalFields: ['paymentTerms', 'currency']
  },
  commercial: {
    label: 'Commercial Invoice',
    description: 'Used for international trade. Includes customs-related details.',
    requiredFields: ['invoiceDate', 'dueDate', 'clientId', 'lineItems'],
    additionalFields: ['hsCodes', 'countryOfOrigin', 'exportTerms', 'customsValue']
  },
  credit: {
    label: 'Credit Invoice',
    description: 'Issued when refunds or discounts are granted.',
    requiredFields: ['invoiceDate', 'clientId', 'originalInvoiceNumber'],
    additionalFields: ['creditReason', 'refundMethod']
  },
  debit: {
    label: 'Debit Invoice',
    description: 'Issued to increase the amount payable by the customer.',
    requiredFields: ['invoiceDate', 'clientId', 'originalInvoiceNumber'],
    additionalFields: ['debitReason', 'additionalCharges']
  },
  recurring: {
    label: 'Recurring Invoice',
    description: 'Sent on a regular schedule (monthly, annually, etc.).',
    requiredFields: ['invoiceDate', 'clientId', 'lineItems'],
    additionalFields: ['frequency', 'nextInvoiceDate', 'subscriptionId']
  },
  timesheet: {
    label: 'Timesheet Invoice',
    description: 'Used when billing is based on hours worked.',
    requiredFields: ['invoiceDate', 'dueDate', 'clientId', 'timeEntries'],
    additionalFields: ['projectName', 'hourlyRate', 'timePeriod']
  },
  interim: {
    label: 'Interim Invoice',
    description: 'Sent for partial payments during long-term projects.',
    requiredFields: ['invoiceDate', 'dueDate', 'clientId', 'lineItems'],
    additionalFields: ['projectName', 'completionPercentage', 'milestoneDescription']
  },
  final: {
    label: 'Final Invoice',
    description: 'Sent at the completion of a project or delivery.',
    requiredFields: ['invoiceDate', 'dueDate', 'clientId', 'lineItems'],
    additionalFields: ['projectName', 'previousPayments', 'finalAmount']
  },
  pastdue: {
    label: 'Past Due Invoice',
    description: 'Sent when a payment is overdue.',
    requiredFields: ['invoiceDate', 'clientId', 'originalInvoiceNumber'],
    additionalFields: ['overdueAmount', 'lateFee', 'paymentReminder']
  }
};

export function getInvoiceTypeConfig(type: InvoiceType): InvoiceTypeConfig {
  return INVOICE_TYPE_CONFIGS[type];
}
