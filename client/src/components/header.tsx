import { FileText, Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">InvoicePro</h1>
            <p className="text-sm text-slate-500">Professional Invoice Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="text-slate-600 h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
