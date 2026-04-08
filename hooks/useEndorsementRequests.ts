import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EndorsementRequestFormData } from "@/validations/endorsement-request";
import toast from "react-hot-toast";

interface EndorsementRequest {
  id: string;
  skill_id: string;
  requester_id: string;
  endorser_email: string;
  endorser_id: string | null;
  token: string;
  status: string;
  decline_reason: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  skills?: {
    id: string;
    name: string;
    category: string;
  };
}

export function useEndorsementRequests() {
  return useQuery<EndorsementRequest[]>({
    queryKey: ["endorsement-requests"],
    queryFn: async () => {
      const response = await fetch("/api/endorsement-requests");
      if (!response.ok) {
        throw new Error("Failed to fetch endorsement requests");
      }
      const result = await response.json();
      return result.data || [];
    },
  });
}

export function useSendEndorsementRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EndorsementRequestFormData) => {
      const response = await fetch("/api/endorsement-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send endorsement request");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsement-requests"] });
      toast.success("Endorsement request sent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResendEndorsementRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/endorsement-requests/${requestId}/resend`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resend request");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsement-requests"] });
      toast.success("Request resent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}


export function useCancelEndorsementRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await fetch(`/api/endorsement-requests/${requestId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel request");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endorsement-requests"] });
      toast.success("Request cancelled successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
