import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LineItemForm } from "./line-item-form";
import { AnimatedInvoicePreview } from "./animated-invoice-preview";
import { LogoUpload } from "./logo-upload";
import { LetterheadDesigner } from "./letterhead-designer";
import { StampUpload } from "./stamp-upload";
import { downloadInvoicePDF } from "@/lib/pdf-generator";
import { apiRequest } from "@/lib/queryClient";

import { 
  INVOICE_TYPES, 
  INVOICE_TYPE_CONFIGS, 
  type InvoiceType 
} from "@/lib/invoice-types";
import { 
  Client, 
  InvoiceWithDetails, 
  insertInvoiceSchema 
} from "@shared/schema";
import { Save, Eye, FileText, Send } from "lucide-react";

const invoiceFormSchema = insertInvoiceSchema.extend({
  lineItems: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    rate: z.number().min(0, "Rate must be non-negative"),
    total: z.number(),
  })).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  logoUrl: z.string().optional(),
  letterheadTemplate: z.string().default("modern"),
  primaryColor: z.string().default("#3b82f6"),
  secondaryColor: z.string().default("#1e40af"),
  backgroundStyle: z.string().default("clean"),
  stampUrl: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  invoice?: InvoiceWithDetails;
  onSave?: (invoice: InvoiceWithDetails) => void;
}

export function InvoiceForm({ invoice, onSave }: InvoiceFormProps) {
  const [selectedType, setSelectedType] = useState<InvoiceType>('standard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      type: selectedType,
      clientId: undefined,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: "",
      status: "draft",
      currency: "USD",
      paymentTerms: "net30",
      notes: "",
      subtotal: "0",
      taxRate: 0,
      taxAmount: "0",
      discount: "0",
      total: "0",
      lineItems: [],
      typeSpecificData: null,
      logoUrl: "",
      letterheadTemplate: "modern",
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      backgroundStyle: "clean",
      stampUrl: "",
    },
  });

  const saveInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const url = invoice ? `/api/invoices/${invoice.id}` : "/api/invoices";
      const method = invoice ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, {
        ...data,
        type: selectedType,
      });
      return response.json();
    },
    onSuccess: (savedInvoice) => {
      toast({
        title: "Success",
        description: `Invoice ${invoice ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      if (onSave) {
        onSave(savedInvoice);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${invoice ? 'update' : 'create'} invoice`,
        variant: "destructive",
      });
    },
  });

  const calculateTotals = () => {
    const lineItems = form.getValues("lineItems") || [];
    const taxRate = form.getValues("taxRate") || 0;
    const discount = form.getValues("discount") || 0;

    const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discount;

    form.setValue("subtotal", subtotal.toString());
    form.setValue("taxAmount", taxAmount.toString());
    form.setValue("total", total.toString());
  };

  const onSubmit = (data: InvoiceFormData) => {
    calculateTotals();
    saveInvoiceMutation.mutate(data);
  };

  const handlePreview = () => {
    const formData = form.getValues();
    const invoiceData: Partial<InvoiceWithDetails> = {
      ...formData,
      client: clients.find(c => c.id === formData.clientId),
      lineItems: formData.lineItems.map(item => ({
        id: 0,
        invoiceId: 0,
        ...item,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        total: item.total.toString(),
        hours: null,
        date: null,
      })),
    };

    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head><title>Invoice Preview</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Invoice Preview</h1>
            <p><strong>Invoice Number:</strong> ${formData.invoiceNumber || 'TBD'}</p>
            <p><strong>Type:</strong> ${INVOICE_TYPE_CONFIGS[selectedType].label}</p>
            <p><strong>Client:</strong> ${invoiceData.client?.name || 'No client selected'}</p>
            <p><strong>Total:</strong> ${formData.currency} ${formData.total}</p>
          </body>
        </html>
      `);
    }
  };

  const handleExportPDF = () => {
    const formData = form.getValues();
    const invoiceData: InvoiceWithDetails = {
      id: invoice?.id || 0,
      ...formData,
      client: clients.find(c => c.id === formData.clientId),
      lineItems: formData.lineItems.map(item => ({
        id: 0,
        invoiceId: 0,
        ...item,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        total: item.total.toString(),
        hours: null,
        date: null,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    downloadInvoicePDF(invoiceData);
  };

  useEffect(() => {
    if (invoice) {
      // Populate form with existing invoice data
      form.reset({
        ...invoice,
        taxRate: invoice.taxRate ? parseFloat(invoice.taxRate) : 0,
        discount: invoice.discount ? parseFloat(invoice.discount) : 0,
        lineItems: invoice.lineItems.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          total: parseFloat(item.total),
        })),
      });
      setSelectedType(invoice.type as InvoiceType);
    }
  }, [invoice, form]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Invoice Type Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
            <p className="text-sm text-slate-500">Select invoice type and fill in the details</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(INVOICE_TYPES).map(([key, label]) => (
                <Button
                  key={key}
                  type="button"
                  variant={selectedType === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedType(key as InvoiceType);
                    form.setValue("type", key);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{INVOICE_TYPE_CONFIGS[selectedType].label} Details</CardTitle>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {form.watch("invoiceNumber") || "TBD"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...form.register("invoiceDate")}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                  />
                </div>
              </div>

              {/* Client Information */}
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-slate-900 mb-4">Bill To</h4>
                <div>
                  <Label htmlFor="clientId">Client</Label>
                  <Select
                    value={form.watch("clientId")?.toString()}
                    onValueChange={(value) => form.setValue("clientId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Line Items */}
              <LineItemForm
                control={form.control}
                currency={form.watch("currency")}
                onChange={calculateTotals}
              />

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select
                    value={form.watch("paymentTerms") || ""}
                    onValueChange={(value) => form.setValue("paymentTerms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                      <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.watch("currency")}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    {...form.register("taxRate", { 
                      valueAsNumber: true,
                      onChange: calculateTotals
                    })}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Additional notes or payment instructions"
                  rows={4}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  disabled={saveInvoiceMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveInvoiceMutation.isPending ? "Saving..." : "Save Invoice"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreview}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportPDF}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  type="button"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Design & Preview */}
      <div className="lg:col-span-1 space-y-6">
        {/* Logo Upload */}
        <LogoUpload
          logoUrl={form.watch("logoUrl") || ""}
          onLogoChange={(url) => form.setValue("logoUrl", url || "")}
        />

        {/* Letterhead Designer */}
        <LetterheadDesigner
          letterheadTemplate={form.watch("letterheadTemplate")}
          primaryColor={form.watch("primaryColor")}
          secondaryColor={form.watch("secondaryColor")}
          backgroundStyle={form.watch("backgroundStyle")}
          onTemplateChange={(template) => form.setValue("letterheadTemplate", template)}
          onPrimaryColorChange={(color) => form.setValue("primaryColor", color)}
          onSecondaryColorChange={(color) => form.setValue("secondaryColor", color)}
          onBackgroundStyleChange={(style) => form.setValue("backgroundStyle", style)}
        />

        {/* Stamp Upload */}
        <StampUpload
          stampUrl={form.watch("stampUrl") || ""}
          onStampChange={(url) => form.setValue("stampUrl", url || "")}
        />

        {/* Animated Preview */}
        <AnimatedInvoicePreview
          invoice={form.getValues()}
          lineItems={form.watch("lineItems") || []}
          taxRate={form.watch("taxRate") || 0}
          discount={form.watch("discount") || 0}
          logoUrl={form.watch("logoUrl") || ""}
          letterheadTemplate={form.watch("letterheadTemplate")}
          primaryColor={form.watch("primaryColor")}
          secondaryColor={form.watch("secondaryColor")}
          backgroundStyle={form.watch("backgroundStyle")}
          stampUrl={form.watch("stampUrl") || ""}
        />
      </div>
    </div>
  );
}
