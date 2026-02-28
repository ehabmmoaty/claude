/**
 * Conversations Store — State management for the Conversations Hub
 *
 * Manages conversation list, filters, selected conversation, transcript,
 * highlights, and search state.
 */

import { create } from 'zustand';
import type { Conversation, TranscriptSegment } from '../../shared/types';
import {
  fetchConversations,
  fetchConversation,
  fetchTranscriptSegments,
  fetchHighlights,
  updateConversationTitle,
  deleteConversation,
  searchTranscripts,
  type DateFilter,
  type SortField,
  type SortOrder,
  type Highlight,
} from '../services/conversationService';

interface ConversationsStoreState {
  // List
  conversations: (Conversation & { segmentCount?: number })[];
  totalCount: number;
  isLoading: boolean;

  // Filters
  dateFilter: DateFilter;
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;
  page: number;
  pageSize: number;

  // Selected conversation detail
  selectedConversationId: string | null;
  selectedConversation: (Conversation & { segmentCount?: number }) | null;
  transcript: TranscriptSegment[];
  highlights: Highlight[];
  isDetailLoading: boolean;

  // Search results
  searchResults: { conversationId: string; text: string; rank: number }[];
  isSearching: boolean;

  // Actions — List
  loadConversations: () => Promise<void>;
  setDateFilter: (filter: DateFilter) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setPage: (page: number) => void;

  // Actions — Detail
  selectConversation: (id: string | null) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;

  // Actions — Search
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useConversationsStore = create<ConversationsStoreState>((set, get) => ({
  // List
  conversations: [],
  totalCount: 0,
  isLoading: false,

  // Filters
  dateFilter: 'all',
  searchQuery: '',
  sortField: 'created_at',
  sortOrder: 'desc',
  page: 0,
  pageSize: 20,

  // Selected conversation detail
  selectedConversationId: null,
  selectedConversation: null,
  transcript: [],
  highlights: [],
  isDetailLoading: false,

  // Search results
  searchResults: [],
  isSearching: false,

  // ─── List Actions ───

  loadConversations: async () => {
    const { dateFilter, searchQuery, sortField, sortOrder, page, pageSize } = get();
    set({ isLoading: true });
    try {
      const result = await fetchConversations({
        dateFilter,
        search: searchQuery,
        sortField,
        sortOrder,
        limit: pageSize,
        offset: page * pageSize,
      });
      set({
        conversations: result.conversations,
        totalCount: result.total,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load conversations:', error);
      set({ isLoading: false });
    }
  },

  setDateFilter: (filter: DateFilter) => {
    set({ dateFilter: filter, page: 0 });
    get().loadConversations();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, page: 0 });
    get().loadConversations();
  },

  setSortField: (field: SortField) => {
    set({ sortField: field, page: 0 });
    get().loadConversations();
  },

  setSortOrder: (order: SortOrder) => {
    set({ sortOrder: order, page: 0 });
    get().loadConversations();
  },

  setPage: (page: number) => {
    set({ page });
    get().loadConversations();
  },

  // ─── Detail Actions ───

  selectConversation: async (id: string | null) => {
    if (!id) {
      set({
        selectedConversationId: null,
        selectedConversation: null,
        transcript: [],
        highlights: [],
      });
      return;
    }

    set({ selectedConversationId: id, isDetailLoading: true });

    try {
      const [conversation, transcript, highlights] = await Promise.all([
        fetchConversation(id),
        fetchTranscriptSegments(id),
        fetchHighlights(id),
      ]);

      set({
        selectedConversation: conversation,
        transcript,
        highlights,
        isDetailLoading: false,
      });
    } catch (error) {
      console.error('Failed to load conversation detail:', error);
      set({ isDetailLoading: false });
    }
  },

  renameConversation: async (id: string, title: string) => {
    await updateConversationTitle(id, title);

    // Update in list
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
      selectedConversation:
        state.selectedConversation?.id === id
          ? { ...state.selectedConversation, title }
          : state.selectedConversation,
    }));
  },

  removeConversation: async (id: string) => {
    await deleteConversation(id);

    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      totalCount: state.totalCount - 1,
      selectedConversationId:
        state.selectedConversationId === id ? null : state.selectedConversationId,
      selectedConversation:
        state.selectedConversation?.id === id ? null : state.selectedConversation,
      transcript:
        state.selectedConversation?.id === id ? [] : state.transcript,
      highlights:
        state.selectedConversation?.id === id ? [] : state.highlights,
    }));
  },

  // ─── Search Actions ───

  performSearch: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true });
    try {
      const results = await searchTranscripts(query);
      set({ searchResults: results, isSearching: false });
    } catch (error) {
      console.error('Search failed:', error);
      set({ isSearching: false });
    }
  },

  clearSearch: () => {
    set({ searchResults: [], searchQuery: '', isSearching: false });
  },
}));
