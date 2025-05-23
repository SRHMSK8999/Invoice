import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { currencies } from "@/lib/currency";
import { Upload, X } from "lucide-react";

// Define the form schema
const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxNumber: z.string().optional().or(z.literal("")),
  defaultCurrency: z.string().default("USD"),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

interface BusinessFormProps {
  business?: any;
  onCancel: () => void;
  onSave: () => void;
}

export default function BusinessForm({ business, onCancel, onSave }: BusinessFormProps) {
  const { toast } = useToast();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo || null);
  
  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || "",
      email: business?.email || "",
      phone: business?.phone || "",
      address: business?.address || "",
      taxNumber: business?.taxNumber || "",
      defaultCurrency: business?.defaultCurrency || "USD",
    },
  });

  const businessMutation = useMutation({
    mutationFn: async (data: BusinessFormValues) => {
      if (business) {
        // Update existing business
        await apiRequest("PUT", `/api/businesses/${business.id}`, data);
        
        // Upload logo if changed
        if (logo) {
          const formData = new FormData();
          formData.append("logo", logo);
          
          await fetch(`/api/businesses/${business.id}/logo`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
        }
      } else {
        // Create new business
        const response = await apiRequest("POST", "/api/businesses", data);
        
        // Upload logo if present
        if (logo && response.id) {
          const formData = new FormData();
          formData.append("logo", logo);
          
          await fetch(`/api/businesses/${response.id}/logo`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: business ? "Business updated" : "Business created",
        description: business
          ? "Business has been successfully updated."
          : "Business has been successfully created.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${business ? "update" : "create"} business: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    setLogoPreview(null);
  };

  const onSubmit = (data: BusinessFormValues) => {
    businessMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
            <div className="flex items-center">
              {logoPreview ? (
                <div className="relative w-24 h-24 mr-4">
                  <img
                    src={logoPreview}
                    alt="Business logo"
                    className="w-24 h-24 object-contain rounded border"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 border shadow-sm"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 flex items-center justify-center border rounded bg-gray-50 mr-4">
                  <span className="text-gray-400 text-xs text-center">No logo</span>
                </div>
              )}
              <div>
                <Button type="button" variant="outline" onClick={() => document.getElementById("logo-upload")?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  {logoPreview ? "Change logo" : "Upload logo"}
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 200x200 pixels</p>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your business name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="defaultCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax/GST Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Tax or GST identification number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="business@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+1 234 567 8901" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Street, City, State, ZIP, Country" className="min-h-24" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={businessMutation.isPending}>
            {businessMutation.isPending ? "Saving..." : business ? "Update Business" : "Add Business"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
