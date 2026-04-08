"use client";

import { useState } from "react";
import { useSkills } from "@/hooks/useSkills";
import { Skill } from "@/types/skill";
import { FiPlus } from "react-icons/fi";
import SkillCard from "@/components/skills/SkillCard";
import AddSkillPanel from "@/components/skills/AddSkillPanel";
import EmptyState from "@/components/skills/EmptyState";

export default function SkillsPage() {
  const { data: skills, isLoading, error } = useSkills();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  console.log(skills)
  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setShowAddPanel(true);
  };

  const handleClosePanel = () => {
    setShowAddPanel(false);
    setEditingSkill(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
          <p className="text-gray-600 mt-2">
            Manage your skills and upload evidence for peer verification
          </p>
        </div>
        {skills && skills.length > 0 && (
          <button
            onClick={() => setShowAddPanel(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 mt-4">Loading skills...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">
            Failed to load skills. Please try again.
          </p>
        </div>
      )}

      {!isLoading && !error && skills && skills.length === 0 && (
        <EmptyState onAddSkill={() => setShowAddPanel(true)} />
      )}

      {!isLoading && !error && skills && skills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {showAddPanel && (
        <AddSkillPanel onClose={handleClosePanel} editingSkill={editingSkill} />
      )}
    </div>
  );
}
