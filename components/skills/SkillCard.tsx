"use client";

import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import { useToggleVisibility, useDeleteSkill } from "@/hooks/useSkills";
import { Skill } from "@/types/skill";
import { useState } from "react";
import Link from "next/link";

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
}

const statusConfig = {
  pending_evidence: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  pending_endorsement: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  verified: { label: "Verified", color: "bg-green-100 text-green-700" },
};

export default function SkillCard({ skill, onEdit }: SkillCardProps) {
  const toggleVisibility = useToggleVisibility();
  const deleteSkill = useDeleteSkill();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleVisibility = () => {
    const newVisibility = skill.visibility === "public" ? "private" : "public";
    toggleVisibility.mutate({
      id: skill.id,
      visibility: newVisibility as "public" | "private",
    });
  };

  const handleDelete = () => {
    deleteSkill.mutate(skill.id);
    setShowDeleteConfirm(false);
  };

  const statusInfo = statusConfig[skill.status as keyof typeof statusConfig] || {
    label: skill.status,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <>
      <div className="bg-white border-2 border-blue-300 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {skill.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{skill.category}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {skill.description}
        </p>

        {/* Upload Evidence Button */}
        {skill.status === "pending_evidence" && (
          <Link
            href={`/dashboard/developer/skills/${skill.id}/evidence`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors mb-4"
          >
            <FiUpload className="w-4 h-4" />
            Upload Evidence
          </Link>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={handleToggleVisibility}
            disabled={toggleVisibility.isPending}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            {skill.visibility === "public" ? (
              <>
                <FiEye className="w-4 h-4" />
                Public
              </>
            ) : (
              <>
                <FiEyeOff className="w-4 h-4" />
                Private
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(skill)}
              className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit skill"
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete skill"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border-2 border-blue-300 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Skill?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete &quot;{skill.name}&quot;?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSkill.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteSkill.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
