'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface ProcessItem {
  _id: string;
  categoryName: string;
}

interface TaskForm {
  step: string;
  processItemId: string;
}

export default function NewTaskPage() {
  const [categories, setCategories] = useState<ProcessItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<TaskForm>({
    step: '',
    processItemId: '',
  });
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/step-categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.categories);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('An error occurred while fetching categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.step.trim() || !formData.processItemId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.step.trim().split(' ').length > 150) {
      toast.error('Task content cannot exceed 150 words');
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Task created successfully!');
        router.push('/engineer/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('An error occurred while creating the task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const wordCount = formData.step
    .trim()
    .split(' ')
    .filter(word => word.length > 0).length;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900'>
      <div className='max-w-4xl mx-auto px-6 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-4'>
            <Link href='/engineer/dashboard'>
              <Button
                variant='outline'
                className='text-white border-white/20 hover:bg-white/10'
              >
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Add New Task
              </h1>
              <p className='text-white opacity-80'>
                Create a new task for your MPI processes
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className='glassmorphism-card'>
            <CardHeader>
              <CardTitle className='text-white flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                Task Details
              </CardTitle>
              <CardDescription className='text-white/70'>
                Fill in the details to create a new task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Process Item Selection */}
                <div className='space-y-2'>
                  <Label htmlFor='processItemId' className='text-white'>
                    Process Item *
                  </Label>
                  <select
                    id='processItemId'
                    name='processItemId'
                    value={formData.processItemId}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm'
                    required
                  >
                    <option value='' className='bg-gray-800 text-white'>
                      Select a process item
                    </option>
                    {categories.map(category => (
                      <option
                        key={category._id}
                        value={category._id}
                        className='bg-gray-800 text-white'
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Content */}
                <div className='space-y-2'>
                  <Label htmlFor='step' className='text-white'>
                    Task Content *
                  </Label>
                  <textarea
                    id='step'
                    name='step'
                    value={formData.step}
                    onChange={handleInputChange}
                    placeholder='Enter task content (max 150 words)'
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 backdrop-blur-sm min-h-[120px] resize-vertical'
                    required
                    maxLength={1000}
                  />
                  <div className='flex justify-between items-center'>
                    <span className='text-white/60 text-sm'>
                      {wordCount}/150 words
                    </span>
                    {wordCount > 150 && (
                      <span className='text-red-400 text-sm'>
                        Exceeds word limit
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className='flex justify-end space-x-3 pt-4'>
                  <Link href='/engineer/dashboard'>
                    <Button
                      type='button'
                      variant='outline'
                      className='text-white border-white/20 hover:bg-white/10'
                    >
                      <X className='h-4 w-4 mr-2' />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type='submit'
                    disabled={
                      isCreating ||
                      wordCount > 150 ||
                      !formData.step.trim() ||
                      !formData.processItemId
                    }
                    className='bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50'
                  >
                    <Save className='h-4 w-4 mr-2' />
                    {isCreating ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
