import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface EndorsementRequest {
  id: string;
  skill_id: string;
  requester_id: string;
  endorser_email: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  skills?: {
    id: string;
    name: string;
    category: string;
  };
  requester?: {
    id: string;
    username: string;
    headline: string | null;
  };
}


// Fetch endorsement requests for the current endorser
export function useEndorserRequests() {
  return useQuery<EndorsementRequest[]>({
    queryKey: ["endorser-requests"],
    queryFn: async () => {
      const response = await fetch("/api/endorser/requests");
      if (!response.ok) {
        throw new Error("Failed to fetch endorsement requests");
      }
      const result = await response.json();
      return result.data || [];
    },
  });
}

export function useEndorseRequestDetails(token: string) {
  return useQuery({
    queryKey: ["endorse", token],
    queryFn: async () => {
      const response = await fetch(`/api/endorser/endorse/${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch request");
      }
      return response.json();
    }
  })
}


