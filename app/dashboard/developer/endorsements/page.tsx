"use client";

import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useEndorsementRequests } from "@/hooks/useEndorsementRequests";
import { useSkills } from "@/hooks/useSkills";
import RequestsTable from "@/components/endorsement/RequestsTable";
import SendRequestModal from "@/components/endorsement/SendRequestModal";

export default function EndorsementsPage() {
  const { data: requests, isLoading: requestsLoading } = useEndorsementRequests();
  const { data: skills, isLoading: skillsLoading } = useSkills();
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  const skillsWithEvidence = skills?.filter(
    (skill) => skill.status !== "pending_evidence"
  );

  const handleSendRequest = (skill: { id: string; name: string; category: string }) => {
    setSelectedSkill(skill);
    setShowSendModal(true);
  };

  const handleCloseModal = () => {
    setShowSendModal(false);
    setSelectedSkill(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Endorsement Requests</h1>
        <p className="text-gray-600 mt-2">
          Track and manage your endorsement requests
        </p>
      </div>

      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Send New Request
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Select a skill with evidence to request an endorsement
        </p>

        {skillsLoading ? (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : skillsWithEvidence && skillsWithEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skillsWithEvidence.map((skill) => (
              <button
                key={skill.id}
                onClick={() => handleSendRequest(skill)}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {skill.name}
                  </p>
                  <p className="text-xs text-gray-500">{skill.category}</p>
                </div>
                <FiSend className="w-4 h-4 text-indigo-600 ml-2 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              No skills with evidence yet. Upload evidence for your skills first.
            </p>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Your Requests
        </h2>
        {requestsLoading ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 mt-4">Loading requests...</p>
          </div>
        ) : (
          <RequestsTable requests={requests || []} />
        )}
      </div>

      {showSendModal && selectedSkill && (
        <SendRequestModal skill={selectedSkill} onClose={handleCloseModal} />
      )}
    </div>
  );
}
