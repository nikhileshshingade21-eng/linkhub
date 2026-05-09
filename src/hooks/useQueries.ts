import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// ---- Squads ----

export function useMySquads() {
  return useQuery({
    queryKey: ['squads', 'mine'],
    queryFn: async () => {
      const res = await api.squads.getMySquads();
      return res.data as any[];
    },
  });
}

export function useSquad(id: string) {
  return useQuery({
    queryKey: ['squads', id],
    queryFn: async () => {
      const res = await api.squads.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useSearchSquads(params: Record<string, string>) {
  return useQuery({
    queryKey: ['squads', 'search', params],
    queryFn: async () => {
      const res = await api.squads.search(params);
      return res;
    },
  });
}

export function useCreateSquad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.squads.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useJoinSquad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.squads.join(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

export function useLeaveSquad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.squads.leave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['squads'] });
    },
  });
}

// ---- Users ----

export function useSearchUsers(params: Record<string, string>) {
  return useQuery({
    queryKey: ['users', 'search', params],
    queryFn: async () => {
      const res = await api.users.search(params);
      return res;
    },
    enabled: Object.values(params).some(v => !!v),
  });
}

export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const res = await api.users.getPublicProfile(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// ---- Opportunities ----

export function useSearchOpportunities(params: Record<string, string>) {
  return useQuery({
    queryKey: ['opportunities', 'search', params],
    queryFn: async () => {
      const res = await api.opportunities.search(params);
      return res;
    },
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => api.opportunities.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
