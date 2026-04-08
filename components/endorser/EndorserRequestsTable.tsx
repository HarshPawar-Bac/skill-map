"use client";

import { FiClock, FiCheck, FiXCircle, FiEye } from "react-icons/fi";
import Link from "next/link";

interface EndorsementRequest {
  id: string;
  skill_id: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  skills?: {
    id: string;
    name: string;
    category: string;
  } | null;
  requester?: {
    id: string;
    username: string;
    headline: string | null;
  } | null;
}

interface EndorserRequestsTableProps {
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
    icon: FiXCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-blue-100 text-blue-700",
    icon: FiCheck,
  },
};

export default function EndorserRequestsTable({
  requests,
}: EndorserRequestsTableProps) {
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  console.log(requests)
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No endorsement requests yet
        </h3>
        <p className="text-sm text-gray-600">
          You&apos;ll see requests here when developers ask for your endorsement
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
                Developer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Received
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
                        {request.requester?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {request.requester?.headline || "No headline"}
                      </p>
                    </div>
                  </td>
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
                    {request.status === "pending" && !expired && (
                      <Link
                        href={`/dashboard/endorser/endorse/${request.token}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                        Review
                      </Link>
                    )}
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
