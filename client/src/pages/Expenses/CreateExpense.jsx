import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import ExpenseForm from '../../components/Expense/ExpenseForm';

const CreateExpense = () => {
  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log('Expense data:', data);
    // Here you would dispatch the createExpense action
    // dispatch(createExpense(data));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center space-x-4"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/expenses')}
          className="h-10 w-10 rounded-xl hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Create New Expense
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Submit a new expense for approval
          </p>
        </div>
      </motion.div>

      {/* Expense Form */}
      <ExpenseForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateExpense;
