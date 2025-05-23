import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InvoiceTemplatesProps {
  selectedTemplate: number;
  onSelectTemplate: (templateId: number) => void;
}

export default function InvoiceTemplates({
  selectedTemplate,
  onSelectTemplate,
}: InvoiceTemplatesProps) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/invoice-templates"],
  });

  // If no templates are available yet, use default templates
  const defaultTemplates = [
    { id: 1, name: "Classic", isDefault: true },
    { id: 2, name: "Modern", isDefault: false },
    { id: 3, name: "Professional", isDefault: false },
  ];

  const displayTemplates = templates || defaultTemplates;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="border rounded-lg p-1 overflow-hidden bg-gray-50 animate-pulse"
          >
            <div className="aspect-[8.5/11] bg-gray-100"></div>
            <div className="h-4 w-20 bg-gray-200 rounded mt-2 mx-auto"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
      {displayTemplates.map((template: any) => (
        <Card
          key={template.id}
          className={cn(
            "border rounded-lg p-1 overflow-hidden hover:border-primary cursor-pointer transition-all",
            selectedTemplate === template.id
              ? "ring-2 ring-primary border-primary"
              : ""
          )}
          onClick={() => onSelectTemplate(template.id)}
        >
          <div className="aspect-[8.5/11] bg-white rounded border-b relative">
            {/* Classic template preview */}
            {template.id === 1 && (
              <div className="p-4 flex flex-col h-full text-xs">
                <div className="flex justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-gray-400">LOGO</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">INVOICE</div>
                    <div className="text-gray-500 mt-1">Invoice #: INV-0001</div>
                    <div className="text-gray-500">Date: 01/01/2023</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="font-semibold mb-1">From:</div>
                    <div className="text-gray-600">Your Business Name</div>
                    <div className="text-gray-600">123 Business St</div>
                    <div className="text-gray-600">City, State ZIP</div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1">To:</div>
                    <div className="text-gray-600">Client Name</div>
                    <div className="text-gray-600">456 Client St</div>
                    <div className="text-gray-600">City, State ZIP</div>
                  </div>
                </div>
                <div className="border-t border-b py-2 mb-2">
                  <div className="grid grid-cols-12 font-semibold">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                </div>
                <div className="flex-grow">
                  {[1, 2].map((i) => (
                    <div key={i} className="grid grid-cols-12 text-gray-600 py-1">
                      <div className="col-span-6">Item {i}</div>
                      <div className="col-span-2 text-right">1</div>
                      <div className="col-span-2 text-right">$100.00</div>
                      <div className="col-span-2 text-right">$100.00</div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto">
                  <div className="flex justify-end">
                    <div className="w-1/3">
                      <div className="flex justify-between py-1">
                        <span>Subtotal:</span>
                        <span>$200.00</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Tax:</span>
                        <span>$20.00</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold">
                        <span>Total:</span>
                        <span>$220.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modern template preview */}
            {template.id === 2 && (
              <div className="h-full flex flex-col text-xs">
                <div className="bg-primary-600 text-white p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm">INVOICE</div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white">LOGO</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-white/80">Invoice #: INV-0002</div>
                    <div className="text-white/80">Date: 01/01/2023</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="font-semibold mb-1 text-primary-600">From:</div>
                      <div className="text-gray-600">Your Business Name</div>
                      <div className="text-gray-600">123 Business St</div>
                      <div className="text-gray-600">City, State ZIP</div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 text-primary-600">To:</div>
                      <div className="text-gray-600">Client Name</div>
                      <div className="text-gray-600">456 Client St</div>
                      <div className="text-gray-600">City, State ZIP</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-md mb-2">
                    <div className="grid grid-cols-12 font-semibold text-gray-700">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-right">Amount</div>
                    </div>
                  </div>
                  <div className="flex-grow">
                    {[1, 2].map((i) => (
                      <div key={i} className="grid grid-cols-12 text-gray-600 py-1 border-b">
                        <div className="col-span-6">Item {i}</div>
                        <div className="col-span-2 text-right">1</div>
                        <div className="col-span-2 text-right">$100.00</div>
                        <div className="col-span-2 text-right">$100.00</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-end">
                      <div className="w-1/3">
                        <div className="flex justify-between py-1">
                          <span>Subtotal:</span>
                          <span>$200.00</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Tax:</span>
                          <span>$20.00</span>
                        </div>
                        <div className="flex justify-between py-1 font-bold bg-primary-50 p-1 rounded">
                          <span>Total:</span>
                          <span>$220.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional template preview */}
            {template.id === 3 && (
              <div className="h-full flex flex-col text-xs">
                <div className="border-b-4 border-gray-800 p-4">
                  <div className="flex justify-between items-center">
                    <div className="w-16 h-8 bg-gray-800 flex items-center justify-center text-white font-bold">
                      LOGO
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">INVOICE</div>
                      <div className="text-right text-gray-600 mt-1">
                        <div>Invoice #: INV-0003</div>
                        <div>Date: 01/01/2023</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="font-semibold mb-1 bg-gray-800 text-white px-2 py-1 inline-block text-xs">FROM</div>
                      <div className="mt-2">
                        <div className="text-gray-800 font-medium">Your Business Name</div>
                        <div className="text-gray-600">123 Business St</div>
                        <div className="text-gray-600">City, State ZIP</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1 bg-gray-800 text-white px-2 py-1 inline-block text-xs">TO</div>
                      <div className="mt-2">
                        <div className="text-gray-800 font-medium">Client Name</div>
                        <div className="text-gray-600">456 Client St</div>
                        <div className="text-gray-600">City, State ZIP</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800 text-white p-2 rounded-t-md">
                    <div className="grid grid-cols-12 font-medium">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-right">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-right">Amount</div>
                    </div>
                  </div>
                  <div className="flex-grow border-x border-b">
                    {[1, 2].map((i) => (
                      <div key={i} className="grid grid-cols-12 text-gray-600 py-1 px-2 border-b">
                        <div className="col-span-6">Item {i}</div>
                        <div className="col-span-2 text-right">1</div>
                        <div className="col-span-2 text-right">$100.00</div>
                        <div className="col-span-2 text-right">$100.00</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-end">
                      <div className="w-1/3 border rounded overflow-hidden">
                        <div className="flex justify-between py-1 px-2 bg-gray-100">
                          <span>Subtotal:</span>
                          <span>$200.00</span>
                        </div>
                        <div className="flex justify-between py-1 px-2">
                          <span>Tax:</span>
                          <span>$20.00</span>
                        </div>
                        <div className="flex justify-between py-1 px-2 font-bold bg-gray-800 text-white">
                          <span>Total:</span>
                          <span>$220.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If it's not one of the default templates */}
            {template.id > 3 && (
              <div className="flex items-center justify-center h-full text-gray-400">
                Template Preview
              </div>
            )}
          </div>
          <div className="text-sm font-medium mt-2 text-center">{template.name}</div>
        </Card>
      ))}
    </div>
  );
}
