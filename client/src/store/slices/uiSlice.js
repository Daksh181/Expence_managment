import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  theme: localStorage.getItem('theme') || 'light',
  loading: false,
  modals: {
    expenseModal: false,
    approvalModal: false,
    userModal: false,
    settingsModal: false,
    notificationModal: false
  },
  toasts: [],
  currentPage: 'dashboard',
  breadcrumbs: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal] = false;
      });
    },
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state, action) => {
      state.breadcrumbs = state.breadcrumbs.filter((_, index) => index !== action.payload);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    }
  }
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  setLoading,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setCurrentPage,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs
} = uiSlice.actions;

export default uiSlice.reducer;

