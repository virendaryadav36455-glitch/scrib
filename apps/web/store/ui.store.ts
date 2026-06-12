// apps/web/stores/ui.store.ts
import { create } from "zustand";

type NotificationType = "success" | "error" | "info";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface UIState {
  // Autosave status for form builder
  autosaveStatus: "idle" | "saving" | "saved" | "error";
  setAutosaveStatus: (s: UIState["autosaveStatus"]) => void;

  // Modal
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  autosaveStatus: "idle",
  setAutosaveStatus: (s) => set({ autosaveStatus: s }),

  activeModal: null,
  modalData: {},
  openModal: (id, data = {}) => set({ activeModal: id, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
