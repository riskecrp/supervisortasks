import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../lib/api';

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsAPI.getAll();
      return response.data;
    },
  });
};

export const useSupervisorMetrics = (name: string) => {
  return useQuery({
    queryKey: ['analytics', 'supervisor', name],
    queryFn: async () => {
      const response = await analyticsAPI.getSupervisorMetrics(name);
      return response.data;
    },
    enabled: !!name,
  });
};
