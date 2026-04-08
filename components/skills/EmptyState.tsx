"use client";


interface EmptyStateProps {
  onAddSkill: () => void;
}

export default function EmptyState({ onAddSkill }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No skills yet
      </h3>
      <button
        onClick={onAddSkill}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
      >
        Add Your First Skill
      </button>
    </div>
  );
}
