import { useFieldArray, Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  total: number;
}

interface LineItemFormProps {
  control: Control<any>;
  currency: string;
  onChange: () => void;
}

export function LineItemForm({ control, currency, onChange }: LineItemFormProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const addLineItem = () => {
    append({
      description: "",
      quantity: 1,
      rate: 0,
      total: 0,
    });
  };

  const calculateTotal = (index: number, quantity: number, rate: number) => {
    const total = quantity * rate;
    return total;
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold text-slate-900">Line Items</h4>
        <Button
          type="button"
          onClick={addLineItem}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No line items added. Click "Add Item" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <LineItemRow
              key={field.id}
              index={index}
              control={control}
              currency={currency}
              onRemove={() => remove(index)}
              onCalculate={calculateTotal}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LineItemRowProps {
  index: number;
  control: Control<any>;
  currency: string;
  onRemove: () => void;
  onCalculate: (index: number, quantity: number, rate: number) => number;
  onChange: () => void;
}

function LineItemRow({ index, control, currency, onRemove, onCalculate, onChange }: LineItemRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-lg">
      <div className="md:col-span-5">
        {index === 0 && (
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </Label>
        )}
        <Input
          {...control.register(`lineItems.${index}.description`)}
          placeholder="Product or service description"
          onChange={onChange}
        />
      </div>
      
      <div className="md:col-span-2">
        {index === 0 && (
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Quantity
          </Label>
        )}
        <Input
          type="number"
          step="0.01"
          {...control.register(`lineItems.${index}.quantity`, {
            valueAsNumber: true,
            onChange: (e) => {
              const quantity = parseFloat(e.target.value) || 0;
              const rate = control._getWatch(`lineItems.${index}.rate`) || 0;
              const total = onCalculate(index, quantity, rate);
              control.setValue(`lineItems.${index}.total`, total);
              onChange();
            }
          })}
          placeholder="1"
        />
      </div>
      
      <div className="md:col-span-2">
        {index === 0 && (
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Rate
          </Label>
        )}
        <Input
          type="number"
          step="0.01"
          {...control.register(`lineItems.${index}.rate`, {
            valueAsNumber: true,
            onChange: (e) => {
              const rate = parseFloat(e.target.value) || 0;
              const quantity = control._getWatch(`lineItems.${index}.quantity`) || 0;
              const total = onCalculate(index, quantity, rate);
              control.setValue(`lineItems.${index}.total`, total);
              onChange();
            }
          })}
          placeholder="0.00"
        />
      </div>
      
      <div className="md:col-span-2">
        {index === 0 && (
          <Label className="block text-sm font-medium text-slate-700 mb-2">
            Total
          </Label>
        )}
        <Input
          {...control.register(`lineItems.${index}.total`)}
          readOnly
          className="bg-slate-100 text-slate-600"
          value={`${currency} ${(control._getWatch(`lineItems.${index}.total`) || 0).toFixed(2)}`}
        />
      </div>
      
      <div className="md:col-span-1 flex items-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:bg-red-50 p-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
