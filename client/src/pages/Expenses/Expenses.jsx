import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const Expenses = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample data - replace with real data from Redux
  const expenses = [
    {
      id: 1,
      title: 'Business Lunch',
      amount: 45.00,
      currency: 'USD',
      category: 'Meals',
      status: 'approved',
      date: '2024-01-15',
      description: 'Client meeting lunch',
      tags: ['client', 'meeting']
    },
    {
      id: 2,
      title: 'Taxi Ride',
      amount: 23.50,
      currency: 'USD',
      category: 'Transportation',
      status: 'pending',
      date: '2024-01-14',
      description: 'Airport to office',
      tags: ['travel']
    },
    {
      id: 3,
      title: 'Office Supplies',
      amount: 89.99,
      currency: 'USD',
      category: 'Office Supplies',
      status: 'approved',
      date: '2024-01-13',
      description: 'Stationery and notebooks',
      tags: ['office']
    },
    {
      id: 4,
      title: 'Software License',
      amount: 299.00,
      currency: 'USD',
      category: 'Software',
      status: 'rejected',
      date: '2024-01-12',
      description: 'Annual subscription',
      tags: ['software', 'subscription']
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Expenses
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your expense submissions and track their status
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => navigate('/expenses/create')}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Expense
          </Button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search expenses by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-primary/50"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-12 w-40 rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Button variant="outline" className="h-12 px-4">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expenses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Expense History</CardTitle>
                <CardDescription>
                  {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-muted-foreground">Expense</th>
                    <th className="p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="p-4 font-medium text-muted-foreground">Category</th>
                    <th className="p-4 font-medium text-muted-foreground">Date</th>
                    <th className="p-4 font-medium text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{expense.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
                          {expense.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {expense.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
                          <span className="font-semibold">{expense.amount.toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground ml-1">{expense.currency}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="flex items-center w-fit">
                          <Tag className="h-3 w-3 mr-1" />
                          {expense.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(expense.status)} className="capitalize">
                          {expense.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Empty State */}
      {filteredExpenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first expense'
            }
          </p>
          {(!searchTerm && statusFilter === 'all') && (
            <Button onClick={() => navigate('/expenses/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Expense
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Expenses;
