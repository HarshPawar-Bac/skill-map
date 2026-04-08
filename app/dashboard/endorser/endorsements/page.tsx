"use client";

import { useEndorserRequests } from "@/hooks/useEndorserRequests";
import EndorserRequestsTable from "@/components/endorser/EndorserRequestsTable";

export default function EndorserEndorsementsPage() {
  const { data: requests, isLoading } = useEndorserRequests();

  const pendingRequests = requests?.filter(
    (r) =>
      r.status === "pending" && new Date(r.expires_at) > new Date()
  ) || [];
  
  const completedRequests = requests?.filter(
    (r) =>
      r.status !== "pending" || new Date(r.expires_at) <= new Date()
  ) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Endorsement Requests</h1>
        <p className="text-gray-600 mt-2">
          Review pending endorsement requests and view your history
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-4">Loading requests...</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Pending Requests ({pendingRequests.length})
            </h2>
            <EndorserRequestsTable requests={pendingRequests} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              History ({completedRequests.length})
            </h2>
            <EndorserRequestsTable requests={completedRequests} />
          </div>
        </>
      )}
    </div>
  );
}
