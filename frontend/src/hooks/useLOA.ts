import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loaAPI } from '../lib/api';
import type { LOARecord } from '../types';
import toast from 'react-hot-toast';

export const useLOARecords = () => {
  return useQuery({
    queryKey: ['loa'],
    queryFn: async () => {
      const response = await loaAPI.getAll();
      return response.data;
    },
  });
};

export const useActiveLOARecords = () => {
  return useQuery({
    queryKey: ['loa', 'active'],
    queryFn: async () => {
      const response = await loaAPI.getActive();
      return response.data;
    },
  });
};

export const useCreateLOARecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: Omit<LOARecord, 'id'>) => loaAPI.create(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loa'] });
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('LOA record created successfully');
    },
    onError: () => {
      toast.error('Failed to create LOA record');
    },
  });
};

export const useUpdateLOARecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LOARecord> }) =>
      loaAPI.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loa'] });
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('LOA record updated successfully');
    },
    onError: () => {
      toast.error('Failed to update LOA record');
    },
  });
};

export const useDeleteLOARecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loaAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loa'] });
      queryClient.invalidateQueries({ queryKey: ['supervisors'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast.success('LOA record deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete LOA record');
    },
  });
};
