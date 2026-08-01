import { create } from 'zustand'

export interface WidgetConfig {
  id: string;
  type: string;
  title?: string;
  sortOrder: number;
  // ... other properties
}

interface WidgetBuilderState {
  widgets: WidgetConfig[];
  addWidget: (widget: WidgetConfig) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  reorderWidgets: (widgets: WidgetConfig[]) => void;
}

export const useWidgetBuilder = create<WidgetBuilderState>((set) => ({
  widgets: [],
  addWidget: (widget) => set((state) => ({ widgets: [...state.widgets, widget] })),
  removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter((w) => w.id !== id) })),
  updateWidget: (id, updates) => set((state) => ({
    widgets: state.widgets.map((w) => w.id === id ? { ...w, ...updates } : w)
  })),
  reorderWidgets: (widgets) => set({ widgets }),
}))
