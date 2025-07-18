import { Header } from "@/components/header";
import { InvoiceForm } from "@/components/invoice-form";
import { RecentInvoices } from "@/components/recent-invoices";

export default function InvoiceEditor() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <InvoiceForm />
          </div>
          <div className="lg:col-span-1">
            <RecentInvoices />
          </div>
        </div>
      </div>
    </div>
  );
}
