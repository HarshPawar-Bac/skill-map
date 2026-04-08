"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillSchema, SkillFormData } from "@/validations/skill";
import { useCreateSkill, useUpdateSkill } from "@/hooks/useSkills";
import { Skill } from "@/types/skill";
import { FiX } from "react-icons/fi";
import { useEffect } from "react";

interface AddSkillPanelProps {
  onClose: () => void;
  editingSkill?: Skill | null;
}

const categories = [
  "Frontend",
  "Backend",
  "DevOps",
  "Data",
  "Design",
  "Other",
];

export default function AddSkillPanel({
  onClose,
  editingSkill,
}: AddSkillPanelProps) {
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: editingSkill
      ? {
        name: editingSkill.name,
        category: editingSkill.category as SkillFormData["category"],
        description: editingSkill.description,
      }
      : undefined,
  });

  useEffect(() => {
    if (editingSkill) {
      reset({
        name: editingSkill.name,
        category: editingSkill.category as SkillFormData["category"],
        description: editingSkill.description,
      });
    }
  }, [editingSkill, reset]);

  const onSubmit = async (data: SkillFormData) => {
    if (editingSkill) {
      await updateSkill.mutateAsync({ id: editingSkill.id, data });
    } else {
      await createSkill.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createSkill.isPending || updateSkill.isPending;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border-2 border-gray-400 shadow-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-blue-600">
            {editingSkill ? "Edit Skill" : "Add New Skill"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="e.g., React.js, Python, AWS"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-red-600 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe your experience with this skill (50-500 characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 text-gray-900 resize-none"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum 50 characters (2-3 sentences)
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading
                ? editingSkill
                  ? "Updating..."
                  : "Creating..."
                : editingSkill
                  ? "Update Skill"
                  : "Create Skill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
