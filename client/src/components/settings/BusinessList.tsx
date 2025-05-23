import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Mail, Phone, MapPin, Building, CreditCard } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BusinessListProps {
  businesses: any[];
  onEdit: (business: any) => void;
}

export default function BusinessList({ businesses, onEdit }: BusinessListProps) {
  const { toast } = useToast();

  const deleteBusinessMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/businesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses"] });
      toast({
        title: "Business deleted",
        description: "Business has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete business: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="flex flex-col items-center justify-center">
          <Building className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No businesses yet</h3>
          <p className="text-gray-500 mb-4">Add your first business to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {businesses.map((business) => (
        <Card key={business.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-start space-x-4">
                {business.logo ? (
                  <div className="flex-shrink-0">
                    <img
                      src={business.logo}
                      alt={`${business.name} logo`}
                      className="w-16 h-16 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-gray-500">
                    <Building className="h-8 w-8" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{business.name}</h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    {business.taxNumber && (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span>Tax ID: {business.taxNumber}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{business.email}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{business.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex mt-4 md:mt-0 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(business)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the business profile for
                        <span className="font-semibold"> {business.name}</span>.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => deleteBusinessMutation.mutate(business.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
