import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/expenses', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchExpenseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/expenses/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/expenses', expenseData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/expenses/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete expense');
    }
  }
);

export const fetchExpenseStats = createAsyncThunk(
  'expenses/fetchExpenseStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/expenses/stats/overview', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch expense stats');
    }
  }
);

export const approveExpense = createAsyncThunk(
  'expenses/approveExpense',
  async ({ expenseId, action, comments }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/approvals/${expenseId}`, {
        action,
        comments
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process approval');
    }
  }
);

export const bulkApproveExpenses = createAsyncThunk(
  'expenses/bulkApproveExpenses',
  async ({ expenseIds, action, comments }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/approvals/bulk', {
        expenseIds,
        action,
        comments
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process bulk approval');
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  'expenses/fetchPendingApprovals',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/approvals/pending', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending approvals');
    }
  }
);

export const fetchApprovalHistory = createAsyncThunk(
  'expenses/fetchApprovalHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/approvals/history', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approval history');
    }
  }
);

export const fetchApprovalStats = createAsyncThunk(
  'expenses/fetchApprovalStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/approvals/stats', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approval stats');
    }
  }
);

const initialState = {
  expenses: [],
  currentExpense: null,
  pendingApprovals: [],
  approvalHistory: [],
  stats: {
    overview: {
      totalExpenses: 0,
      totalAmount: 0,
      averageAmount: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      draftCount: 0
    },
    categoryBreakdown: []
  },
  approvalStats: {
    overview: {
      totalApprovals: 0,
      approvedCount: 0,
      rejectedCount: 0,
      pendingCount: 0,
      averageProcessingTime: 0
    },
    monthlyTrends: []
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  loading: false,
  error: null,
  success: false,
  filters: {
    status: '',
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  }
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: '',
        category: '',
        startDate: '',
        endDate: '',
        search: ''
      };
    },
    setCurrentExpense: (state, action) => {
      state.currentExpense = action.payload;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    updateExpenseInList: (state, action) => {
      const index = state.expenses.findIndex(expense => expense._id === action.payload._id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
    removeExpenseFromList: (state, action) => {
      state.expenses = state.expenses.filter(expense => expense._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          pages: action.payload.pages
        };
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Expense by ID
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExpense = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        state.error = null;
        state.success = true;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(expense => expense._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense && state.currentExpense._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(expense => expense._id !== action.payload);
        if (state.currentExpense && state.currentExpense._id === action.payload) {
          state.currentExpense = null;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Expense Stats
      .addCase(fetchExpenseStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Expense
      .addCase(approveExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(expense => expense._id === action.payload._id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense && state.currentExpense._id === action.payload._id) {
          state.currentExpense = action.payload;
        }
        state.error = null;
        state.success = true;
      })
      .addCase(approveExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Approve Expenses
      .addCase(bulkApproveExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkApproveExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(bulkApproveExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Approvals
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingApprovals = action.payload.data;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Approval History
      .addCase(fetchApprovalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.approvalHistory = action.payload.data;
        state.error = null;
      })
      .addCase(fetchApprovalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Approval Stats
      .addCase(fetchApprovalStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApprovalStats.fulfilled, (state, action) => {
        state.loading = false;
        state.approvalStats = action.payload;
        state.error = null;
      })
      .addCase(fetchApprovalStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  setFilters,
  clearFilters,
  setCurrentExpense,
  clearCurrentExpense,
  updateExpenseInList,
  removeExpenseFromList
} = expenseSlice.actions;

export default expenseSlice.reducer;

