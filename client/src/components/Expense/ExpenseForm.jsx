import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Camera, 
  FileText, 
  DollarSign, 
  Calendar, 
  Tag,
  MapPin,
  X,
  Check
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const ExpenseForm = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    currency: 'USD',
    expenseDate: '',
    location: '',
    tags: []
  });
  const [receipts, setReceipts] = useState([]);
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Travel', 'Meals', 'Accommodation', 'Transportation',
    'Office Supplies', 'Software', 'Training', 'Marketing',
    'Entertainment', 'Utilities', 'Other'
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newReceipts = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));
    setReceipts([...receipts, ...newReceipts]);
  };

  const removeReceipt = (id) => {
    setReceipts(receipts.filter(receipt => receipt.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      receipts: receipts.map(r => r.file)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Create New Expense
          </CardTitle>
          <CardDescription>
            Fill in the details below to submit your expense for approval
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Expense Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Business Lunch with Client"
                  className="h-12 border-2 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Amount *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="pl-10 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency
                </Label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50"
                >
                  {currencies.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate" className="text-sm font-medium">
                  Expense Date *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="expenseDate"
                    name="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    className="pl-10 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide additional details about this expense..."
                rows={4}
                className="flex w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY"
                  className="pl-10 h-12 border-2 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    className="pl-10 h-12 border-2 focus:border-primary/50"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                </div>
                <Button type="button" onClick={addTag} variant="outline" className="h-12">
                  Add
                </Button>
              </div>
            </div>

            {/* Receipt Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Receipts</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Receipts</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  <Button type="button" variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </label>
              </div>

              {/* Receipt Preview */}
              {receipts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {receipts.map((receipt) => (
                    <div key={receipt.id} className="relative group">
                      <div className="aspect-square rounded-lg border-2 border-border overflow-hidden">
                        {receipt.type.startsWith('image/') ? (
                          <img
                            src={receipt.preview}
                            alt={receipt.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReceipt(receipt.id)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {receipt.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button type="button" variant="outline" className="px-8">
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Submit Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExpenseForm;

