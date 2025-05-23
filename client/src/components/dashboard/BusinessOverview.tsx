import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Edit, Plus } from "lucide-react";

export default function BusinessOverview() {
  const { data: businesses, isLoading } = useQuery({
    queryKey: ["/api/businesses"],
  });

  // Get the first business if available
  const business = businesses && businesses.length > 0 ? businesses[0] : null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">No business profile added yet</p>
            <Link href="/settings">
              <Button>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Add Business
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Business Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {business.logo ? (
                  <img
                    className="w-12 h-12 rounded-md object-cover"
                    src={business.logo}
                    alt={`${business.name} logo`}
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary-100 rounded-md flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-xl">
                      {business.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h4 className="text-base font-medium text-gray-900">{business.name}</h4>
                <p className="text-sm text-gray-500">
                  {business.taxNumber ? `Tax Number: ${business.taxNumber}` : "No tax number added"}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/settings?tab=business&id=${business.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="-ml-0.5 mr-1 w-4 h-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Currency</dt>
              <dd className="mt-1 text-sm text-gray-900">{business.defaultCurrency || "USD"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{business.email || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{business.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{business.address || "Not provided"}</dd>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
