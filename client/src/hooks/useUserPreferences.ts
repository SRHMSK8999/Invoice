import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

interface UserPreferences {
  defaultCurrency: string;
  dateFormat: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Default preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    defaultCurrency: "USD",
    dateFormat: "MM/DD/YYYY"
  });
  
  // Update preferences from user data when it loads
  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      return await apiRequest("POST", "/api/preferences", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save preferences: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const savePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    savePreferencesMutation.mutate(newPreferences);
  };

  return {
    preferences,
    savePreferences,
    isLoading: savePreferencesMutation.isPending
  };
}

// Utility function to get the default currency across the app
export const getDefaultCurrency = (): string => {
  // Try to get from localStorage as a quick cache
  const cachedPrefs = localStorage.getItem('userPreferences');
  if (cachedPrefs) {
    try {
      const prefs = JSON.parse(cachedPrefs);
      return prefs.defaultCurrency || "USD";
    } catch (e) {
      return "USD";
    }
  }
  return "USD";
};