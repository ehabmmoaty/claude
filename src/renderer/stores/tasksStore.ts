/**
 * Tasks Store — State management for the Tasks Hub
 */

import { create } from 'zustand';
import type { Task } from '../../shared/types';
import {
  fetchTasks,
  fetchTaskCounts,
  updateTaskStatus,
  updateTask,
  deleteTask,
  type TaskCategory,
  type TaskStatus,
  type TaskPriority,
} from '../services/taskService';

interface TasksStoreState {
  tasks: Task[];
  totalCount: number;
  isLoading: boolean;

  // Filters
  category: TaskCategory;
  statusFilter: TaskStatus | null;
  priorityFilter: TaskPriority | null;
  searchQuery: string;
  sortOrder: 'asc' | 'desc';

  // Counts per category
  counts: Record<TaskCategory, number>;

  // Selected task
  selectedTaskId: string | null;

  // Actions
  loadTasks: () => Promise<void>;
  loadCounts: () => Promise<void>;
  setCategory: (category: TaskCategory) => void;
  setStatusFilter: (status: TaskStatus | null) => void;
  setPriorityFilter: (priority: TaskPriority | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSortOrder: () => void;
  selectTask: (id: string | null) => void;
  changeTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  editTask: (id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'ownerName' | 'status' | 'priority'>>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksStoreState>((set, get) => ({
  tasks: [],
  totalCount: 0,
  isLoading: false,

  category: 'my_tasks',
  statusFilter: null,
  priorityFilter: null,
  searchQuery: '',
  sortOrder: 'desc',

  counts: { my_tasks: 0, delegated: 0, waiting_on: 0 },

  selectedTaskId: null,

  loadTasks: async () => {
    const { category, statusFilter, priorityFilter, searchQuery, sortOrder } = get();
    set({ isLoading: true });
    try {
      const result = await fetchTasks({
        category,
        status: statusFilter ?? undefined,
        priority: priorityFilter ?? undefined,
        search: searchQuery,
        sortOrder,
      });
      set({ tasks: result.tasks, totalCount: result.total, isLoading: false });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      set({ isLoading: false });
    }
  },

  loadCounts: async () => {
    try {
      const counts = await fetchTaskCounts();
      set({ counts });
    } catch (error) {
      console.error('Failed to load task counts:', error);
    }
  },

  setCategory: (category) => {
    set({ category, selectedTaskId: null });
    get().loadTasks();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().loadTasks();
  },

  setPriorityFilter: (priority) => {
    set({ priorityFilter: priority });
    get().loadTasks();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().loadTasks();
  },

  toggleSortOrder: () => {
    set((s) => ({ sortOrder: s.sortOrder === 'desc' ? 'asc' : 'desc' }));
    get().loadTasks();
  },

  selectTask: (id) => set({ selectedTaskId: id }),

  changeTaskStatus: async (id, status) => {
    await updateTaskStatus(id, status);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
    get().loadCounts();
  },

  editTask: async (id, updates) => {
    await updateTask(id, updates);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  removeTask: async (id) => {
    await deleteTask(id);
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      totalCount: s.totalCount - 1,
      selectedTaskId: s.selectedTaskId === id ? null : s.selectedTaskId,
    }));
    get().loadCounts();
  },
}));
