import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductList from "@/components/products/ProductList";
import ProductForm from "@/components/products/ProductForm";
import { SearchIcon, PlusIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Products() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery({
    queryKey: [
      "/api/products",
      activeStatus !== "all" ? activeStatus === "active" : undefined,
      selectedCategory !== "all" ? selectedCategory : undefined,
      search
    ],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleProductStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/products/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Product status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update product: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsAddingProduct(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, isActive: boolean) => {
    toggleProductStatusMutation.mutate({ id, isActive: !isActive });
  };

  const handleCloseDialog = () => {
    setIsAddingProduct(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    setIsAddingProduct(false);
    setSelectedProduct(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products & Services</h1>
        <Button onClick={handleAddProduct}>
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              {search && (
                <XIcon
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 cursor-pointer"
                  onClick={() => setSearch("")}
                />
              )}
              <Input
                placeholder="Search products..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveStatus}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ProductList
                products={products}
                isLoading={isLoading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
            <TabsContent value="active">
              <ProductList
                products={products}
                isLoading={isLoading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
            <TabsContent value="inactive">
              <ProductList
                products={products}
                isLoading={isLoading}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                onToggleStatus={handleToggleStatus}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            categories={categories || []}
            onCancel={handleCloseDialog}
            onSave={handleSaveProduct}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
