import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supervisorsAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useSupervisors = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: async () => {
      const response = await supervisorsAPI.getAll();
      return response.data;
    },
  });
};

export const useAddSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => supervisorsAPI.add(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Supervisor added successfully');
    },
    onError: () => {
      toast.error('Failed to add supervisor');
    },
  });
};

export const useRemoveSupervisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => supervisorsAPI.remove(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('Supervisor removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove supervisor');
    },
  });
};
