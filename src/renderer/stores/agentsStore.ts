/**
 * Agents Store — State management for AI companions
 */

import { create } from 'zustand';
import type { Companion } from '../../shared/types';
import {
  fetchCompanions,
  fetchCompanionStats,
  toggleCompanionActive,
  deleteCompanion,
} from '../services/agentService';

interface AgentsStoreState {
  companions: Companion[];
  stats: Record<string, number>;
  isLoading: boolean;
  selectedCompanionId: string | null;

  loadCompanions: () => Promise<void>;
  loadStats: () => Promise<void>;
  selectCompanion: (id: string | null) => void;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;
  removeCompanion: (id: string) => Promise<void>;
}

export const useAgentsStore = create<AgentsStoreState>((set, get) => ({
  companions: [],
  stats: {},
  isLoading: false,
  selectedCompanionId: null,

  loadCompanions: async () => {
    set({ isLoading: true });
    try {
      const companions = await fetchCompanions();
      set({ companions, isLoading: false });
    } catch (error) {
      console.error('Failed to load companions:', error);
      set({ isLoading: false });
    }
  },

  loadStats: async () => {
    try {
      const stats = await fetchCompanionStats();
      set({ stats });
    } catch (error) {
      console.error('Failed to load companion stats:', error);
    }
  },

  selectCompanion: (id) => set({ selectedCompanionId: id }),

  toggleActive: async (id, isActive) => {
    await toggleCompanionActive(id, isActive);
    set((s) => ({
      companions: s.companions.map((c) =>
        c.id === id ? { ...c, isActive } : c
      ),
    }));
  },

  removeCompanion: async (id) => {
    await deleteCompanion(id);
    set((s) => ({
      companions: s.companions.filter((c) => c.id !== id),
      selectedCompanionId: s.selectedCompanionId === id ? null : s.selectedCompanionId,
    }));
  },
}));
