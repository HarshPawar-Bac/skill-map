"use client";

import { FiRefreshCw, FiX, FiClock, FiCheck, FiXCircle } from "react-icons/fi";
import {
  useResendEndorsementRequest,
  useCancelEndorsementRequest,
} from "@/hooks/useEndorsementRequests";

interface EndorsementRequest {
  id: string;
  skill_id: string;
  endorser_email: string;
  status: string;
  decline_reason: string | null;
  expires_at: string;
  created_at: string;
  skills?: {
    id: string;
    name: string;
    category: string;
  };
}

interface RequestsTableProps {
  requests: EndorsementRequest[];
}

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: FiClock,
  },
  accepted: {
    label: "Accepted",
    color: "bg-green-100 text-green-700",
    icon: FiCheck,
  },
  declined: {
    label: "Declined",
    color: "bg-red-100 text-red-700",
    icon: FiXCircle,
  },
  expired: {
    label: "Expired",
    color: "bg-gray-100 text-gray-700",
    icon: FiClock,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-700",
    icon: FiX,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-700",
    icon: FiCheck,
  },
};

export default function RequestsTable({ requests }: RequestsTableProps) {
  const resendRequest = useResendEndorsementRequest();
  const cancelRequest = useCancelEndorsementRequest();

  const handleResend = (requestId: string) => {
    if (confirm("Resend this endorsement request?")) {
      resendRequest.mutate(requestId);
    }
  };

  const handleCancel = (requestId: string) => {
    if (confirm("Cancel this endorsement request?")) {
      cancelRequest.mutate(requestId);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No endorsement requests yet
        </h3>
        <p className="text-sm text-gray-600">
          Send requests from your skills with evidence
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endorser
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expires
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((request) => {
              const statusInfo =
                statusConfig[request.status as keyof typeof statusConfig] || {
                  label: request.status,
                  color: "bg-gray-100 text-gray-700",
                  icon: FiClock,
                };
              const StatusIcon = statusInfo.icon;
              const expired = isExpired(request.expires_at);

              return (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {request.skills?.name || "Unknown Skill"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.skills?.category}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {request.endorser_email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {expired && request.status === "pending"
                        ? "Expired"
                        : statusInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(request.expires_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(expired || request.status === "expired") &&
                        request.status !== "cancelled" && (
                          <button
                            onClick={() => handleResend(request.id)}
                            disabled={resendRequest.isPending}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend request"
                          >
                            <FiRefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      {request.status === "pending" && !expired && (
                        <button
                          onClick={() => handleCancel(request.id)}
                          disabled={cancelRequest.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Cancel request"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
