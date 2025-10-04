import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/notifications', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await axios.put('/api/notifications/read-all');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchNotificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/notifications/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  }
);

const initialState = {
  notifications: [],
  stats: {
    overview: {
      total: 0,
      unread: 0,
      high: 0,
      urgent: 0
    },
    typeBreakdown: []
  },
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  filters: {
    type: '',
    isRead: undefined
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        type: '',
        isRead: undefined
      };
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(notification => notification._id === action.payload._id);
      if (index !== -1) {
        const wasUnread = !state.notifications[index].isRead;
        const isNowRead = action.payload.isRead;
        
        state.notifications[index] = action.payload;
        
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    removeNotification: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(notification => notification._id !== action.payload);
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages
        };
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.notifications.findIndex(notification => notification._id === action.payload);
        if (index !== -1) {
          state.notifications[index].isRead = true;
          state.notifications[index].readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark All Notifications as Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.notifications = state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }));
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        const notification = state.notifications.find(n => n._id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(notification => notification._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Notification Stats
      .addCase(fetchNotificationStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchNotificationStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  addNotification,
  updateNotification,
  removeNotification,
  setUnreadCount
} = notificationSlice.actions;

export default notificationSlice.reducer;

