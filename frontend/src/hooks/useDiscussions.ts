import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discussionsAPI } from '../lib/api';
import type { Discussion } from '../types';
import toast from 'react-hot-toast';

export const useDiscussions = () => {
  return useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      const response = await discussionsAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (discussion: Omit<Discussion, 'id'>) =>
      discussionsAPI.create(discussion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Discussion created successfully');
    },
    onError: () => {
      toast.error('Failed to create discussion');
    },
  });
};

export const useUpdateDiscussionFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      supervisorName,
      completed,
    }: {
      id: string;
      supervisorName: string;
      completed: boolean;
    }) => discussionsAPI.updateFeedback(id, supervisorName, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Feedback updated successfully');
    },
    onError: () => {
      toast.error('Failed to update feedback');
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => discussionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Discussion deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete discussion');
    },
  });
};
