import React from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  CheckCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const Dashboard = () => {
  const stats = [
    { 
      name: 'Total Expenses', 
      value: '$12,345', 
      icon: Receipt, 
      change: '+12%', 
      changeType: 'positive',
      description: 'This month',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      name: 'Pending Approvals', 
      value: '8', 
      icon: Clock, 
      change: '-3', 
      changeType: 'negative',
      description: 'Awaiting review',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      name: 'Approved This Month', 
      value: '45', 
      icon: CheckCircle, 
      change: '+8%', 
      changeType: 'positive',
      description: 'Successfully processed',
      color: 'from-green-500 to-green-600'
    },
    { 
      name: 'Team Members', 
      value: '12', 
      icon: Users, 
      change: '+2', 
      changeType: 'positive',
      description: 'Active users',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const recentExpenses = [
    { id: 1, title: 'Business Lunch', amount: '$45.00', time: '2 hours ago', status: 'approved', category: 'Meals' },
    { id: 2, title: 'Taxi Ride', amount: '$23.50', time: '4 hours ago', status: 'pending', category: 'Transportation' },
    { id: 3, title: 'Office Supplies', amount: '$89.99', time: '1 day ago', status: 'approved', category: 'Office Supplies' },
    { id: 4, title: 'Client Meeting', amount: '$156.00', time: '2 days ago', status: 'approved', category: 'Meals' },
  ];

  const pendingApprovals = [
    { id: 1, title: 'Travel Expense', amount: '$120.00', employee: 'John Doe', time: '1 hour ago', category: 'Travel' },
    { id: 2, title: 'Software License', amount: '$299.00', employee: 'Sarah Wilson', time: '3 hours ago', category: 'Software' },
    { id: 3, title: 'Training Course', amount: '$450.00', employee: 'Mike Johnson', time: '5 hours ago', category: 'Training' },
  ];

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
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Welcome back! Here's what's happening with your expenses.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl">
          <Plus className="h-4 w-4 mr-2" />
          New Expense
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                  <div className={`h-14 w-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Expenses</CardTitle>
                  <CardDescription>Your latest expense submissions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {expense.category}
                          </Badge>
                          <Badge 
                            variant={expense.status === 'approved' ? 'success' : 'pending'}
                            className="text-xs"
                          >
                            {expense.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{expense.amount}</p>
                      <p className="text-xs text-muted-foreground">{expense.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Pending Approvals</CardTitle>
                  <CardDescription>Awaiting your review</CardDescription>
                </div>
                <Badge variant="warning" className="text-xs">
                  {pendingApprovals.length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval, index) => (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50/50 dark:bg-yellow-900/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{approval.title}</p>
                      <p className="font-semibold text-foreground">{approval.amount}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{approval.employee}</span>
                      <span>{approval.time}</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" className="h-8 text-xs">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        Review
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span className="text-sm">New Expense</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Activity className="h-6 w-6" />
                <span className="text-sm">View Reports</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Team Members</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
