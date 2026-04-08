import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/validations/skill";
import { Skill } from "@/types/skill";
import toast from "react-hot-toast";

export function useSkills() {
  return useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await fetch("/api/skills");
      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 0,
  });
}


export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (skillData: SkillFormData) => {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create skill");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}


export function useUpdateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SkillFormData>;
    }) => {
      const response = await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update skill");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete skill");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Skill deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      visibility,
    }: {
      id: string;
      visibility: "public" | "private";
    }) => {
      const response = await fetch(`/api/skills/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update visibility");
      }

      return response.json();
    },
    onMutate: async ({ id, visibility }) => {
      await queryClient.cancelQueries({ queryKey: ["skills"] });

      const previousSkills = queryClient.getQueryData<Skill[]>(["skills"]);


      queryClient.setQueryData<Skill[]>(["skills"], (old) =>
        old?.map((skill) =>
          skill.id === id ? { ...skill, visibility } : skill
        )
      );

      return { previousSkills };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousSkills) {
        queryClient.setQueryData(["skills"], context.previousSkills);
      }
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Visibility updated!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
  });
}
