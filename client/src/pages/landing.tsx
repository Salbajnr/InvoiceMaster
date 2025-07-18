import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calculator, CreditCard, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Professional Invoice Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create, manage, and track professional invoices with our comprehensive solution.
            Support for 10+ invoice types, transaction simulation, and advanced styling features.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started - Log In
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>Professional Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Support for 10 different invoice types including proforma, commercial, credit notes, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Calculator className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Advanced Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic tax calculations, line item totals, discounts, and currency conversion support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CreditCard className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Transaction Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Test payment scenarios with authentic platform templates from Binance, PayPal, Stripe, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-red-600 mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-grade security with user authentication and encrypted data storage.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Ready to streamline your invoicing?
          </h2>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = "/api/login"}
          >
            Log In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}