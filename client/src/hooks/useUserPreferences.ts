import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

interface UserPreferences {
  defaultCurrency: string;
  dateFormat: string;
}

// Get cached preferences from localStorage
const getCachedPreferences = (): UserPreferences => {
  const defaultPrefs = {
    defaultCurrency: "USD",
    dateFormat: "MM/DD/YYYY"
  };
  
  try {
    const cached = localStorage.getItem('userPreferences');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Error reading cached preferences:", error);
  }
  
  return defaultPrefs;
};

export function useUserPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize with cached preferences or defaults
  const [preferences, setPreferences] = useState<UserPreferences>(getCachedPreferences());
  
  // Update preferences from user data when it loads
  useEffect(() => {
    if (user?.preferences) {
      console.log("User preferences loaded from server:", user.preferences);
      setPreferences(user.preferences);
      // Store in localStorage for faster access across components
      localStorage.setItem('userPreferences', JSON.stringify(user.preferences));
    }
  }, [user]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      console.log("Saving preferences to server:", data);
      return await apiRequest("POST", "/api/preferences", data);
    },
    onSuccess: (data) => {
      console.log("Preferences saved successfully:", data);
      
      // Force refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Also update any components that use preferences directly
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: `Failed to save preferences: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const savePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    // Store in localStorage for immediate availability across the app
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    // Also save to the database
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
      if (prefs.defaultCurrency) {
        console.log("Using currency from localStorage:", prefs.defaultCurrency);
        return prefs.defaultCurrency;
      }
    } catch (e) {
      console.error("Error parsing user preferences:", e);
    }
  }
  console.log("Using default currency: USD");
  return "USD";
};

// Utility function to get the default date format
export const getDefaultDateFormat = (): string => {
  const cachedPrefs = localStorage.getItem('userPreferences');
  if (cachedPrefs) {
    try {
      const prefs = JSON.parse(cachedPrefs);
      if (prefs.dateFormat) {
        return prefs.dateFormat;
      }
    } catch (e) {
      console.error("Error parsing user preferences:", e);
    }
  }
  return "MM/DD/YYYY";
};