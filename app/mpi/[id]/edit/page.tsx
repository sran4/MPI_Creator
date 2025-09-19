'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Editor } from '@tinymce/tinymce-react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Edit,
  FileImage,
  FileText,
  Folder,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface MPI {
  _id: string;
  jobNumber: string;
  oldJobNumber?: string;
  mpiNumber: string;
  mpiVersion: string;
  formId?: {
    _id: string;
    formId: string;
    formRev: string;
    description?: string;
  };
  customerCompanyId: {
    companyName: string;
    city: string;
    state: string;
  };
  customerAssemblyName: string;
  assemblyRev: string;
  drawingName: string;
  drawingRev: string;
  assemblyQuantity: number;
  kitReceivedDate: string;
  dateReleased: string;
  pages: number;
  totalPages?: number;
  sections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    isCollapsed: boolean;
    images: string[];
    documentId?: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProcessItem {
  _id: string;
  categoryName: string;
}

interface Task {
  _id: string;
  step: string;
  categoryName: string;
  processItem: {
    _id: string;
    categoryName: string;
  };
  isGlobal: boolean;
  usageCount: number;
}

interface DocumentId {
  _id: string;
  docId: string;
  description?: string;
}

export default function MPIEditorPage({ params }: { params: { id: string } }) {
  const [mpi, setMpi] = useState<MPI | null>(null);
  const [processItems, setProcessItems] = useState<ProcessItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documentIds, setDocumentIds] = useState<DocumentId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProcessItem, setSelectedProcessItem] = useState('');
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showBulkTaskModal, setShowBulkTaskModal] = useState(false);
  const [showInsertDocIdModal, setShowInsertDocIdModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalSize, setModalSize] = useState({ width: 800, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [showSplitScreen, setShowSplitScreen] = useState(false);
  const [newStep, setNewStep] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Section management states
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const router = useRouter();

  // Token validation function
  const validateToken = (token: string | null): boolean => {
    if (!token) {
      console.error('❌ No token found');
      return false;
    }

    if (!token.includes('.')) {
      console.error('❌ Invalid token format - missing dots');
      localStorage.removeItem('token');
      return false;
    }

    try {
      // Basic JWT structure validation (3 parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Invalid token format - wrong number of parts');
        localStorage.removeItem('token');
        return false;
      }

      console.log('✅ Token format is valid');
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      localStorage.removeItem('token');
      return false;
    }
  };

  useEffect(() => {
    console.log('🎯 Edit page useEffect triggered with params.id:', params.id);

    // Add a small delay to ensure localStorage is available
    const initializePage = async () => {
      // Wait a bit to ensure localStorage is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const token = localStorage.getItem('token');
      console.log(
        '🔑 Edit page - Token check:',
        token ? 'Token exists' : 'No token found'
      );
      console.log(
        '🔑 Edit page - Token value:',
        token ? token.substring(0, 20) + '...' : 'null'
      );

      if (validateToken(token)) {
        console.log('🚀 Starting data fetch...');
        try {
          await fetchMPI();
          await Promise.all([
            fetchProcessItems(),
            fetchTasks(),
            fetchDocumentIds(),
          ]);
        } catch (error) {
          console.error('❌ Error during data fetch:', error);
        }
      } else {
        console.error('❌ Invalid token - redirecting to login');
        toast.error('Please log in to access this page');
        router.push('/login');
      }
    };

    initializePage();
  }, [params.id]);

  const fetchMPI = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(
        '🔑 Fetching MPI with token:',
        token ? 'Token exists' : 'No token found'
      );
      console.log('🔍 MPI ID to fetch:', params.id);

      if (!token) {
        console.error('❌ No authentication token found');
        toast.error('Please log in to access this MPI');
        router.push('/login');
        return;
      }

      // Validate token format
      if (!token.includes('.')) {
        console.error('❌ Invalid token format - missing dots');
        localStorage.removeItem('token');
        toast.error('Invalid session. Please log in again.');
        router.push('/login');
        return;
      }

      // Validate MPI ID format (should be 24 character hex string)
      if (
        !params.id ||
        params.id.length !== 24 ||
        !/^[0-9a-fA-F]{24}$/.test(params.id)
      ) {
        console.error('❌ Invalid MPI ID format:', params.id);
        toast.error('Invalid MPI ID format');
        router.push('/engineer/dashboard');
        return;
      }

      console.log('📡 Making API request to:', `/api/mpi/${params.id}`);
      const response = await fetch(`/api/mpi/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API response status:', response.status);
      console.log(
        '📡 API response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ MPI fetched successfully:', result.mpi?.mpiNumber);
        setMpi(result.mpi);
      } else {
        const errorData = await response.json();
        console.error('❌ API error response:', errorData);

        if (response.status === 401) {
          console.error('❌ Authentication failed - token invalid or expired');
          localStorage.removeItem('token');
          toast.error('Session expired. Please log in again.');
          router.push('/login');
        } else if (response.status === 403) {
          console.error('❌ Access denied - MPI belongs to different engineer');
          toast.error(
            'You do not have access to this MPI. It may belong to a different engineer.'
          );
          router.push('/engineer/dashboard');
        } else if (response.status === 404) {
          console.error('❌ MPI not found');
          toast.error(
            'MPI not found. It may have been deleted or the link is invalid.'
          );
          router.push('/engineer/dashboard');
        } else {
          console.error('❌ Server error:', errorData.error);
          toast.error(
            `Failed to fetch MPI: ${errorData.error || 'Unknown error'}`
          );
          router.push('/engineer/dashboard');
        }
      }
    } catch (error) {
      console.error('❌ Network or other error fetching MPI:', error);
      toast.error('Network error. Please check your connection and try again.');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProcessItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/step-categories-simple', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setProcessItems(result.categories);
      } else {
        console.error('Failed to fetch process items');
      }
    } catch (error) {
      console.error('Error fetching process items:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTasks(result.tasks || []);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchDocumentIds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/document-ids', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setDocumentIds(result.documentIds || []);
      } else {
        console.error('Failed to fetch document IDs');
      }
    } catch (error) {
      console.error('Error fetching document IDs:', error);
    }
  };

  const calculateTotalPages = () => {
    if (!mpi) return 1;

    // Base pages: Header + Assembly Details
    let totalPages = 2;

    // Add pages for each section based on content length
    mpi.sections.forEach(section => {
      if (section.content && section.content.trim()) {
        // Rough calculation: ~500 characters per page
        const contentLength = section.content.length;
        const sectionPages = Math.max(1, Math.ceil(contentLength / 500));
        totalPages += sectionPages;
      } else {
        // Empty section still takes at least 1 page
        totalPages += 1;
      }
    });

    return totalPages;
  };

  const handleSaveMPI = async () => {
    if (!mpi) return;

    console.log('💾 Saving MPI with sections:', mpi.sections);
    mpi.sections.forEach((section, index) => {
      console.log(
        `Section ${index + 1}:`,
        section.title,
        'Order:',
        section.order,
        'Document ID:',
        section.documentId
      );
    });

    // Calculate and update total pages
    const calculatedPages = calculateTotalPages();
    const updatedMpi = {
      ...mpi,
      pages: calculatedPages,
    };

    console.log('📄 Calculated total pages:', calculatedPages);

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mpi/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedMpi),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ MPI saved successfully:', responseData);
        // Update local state with new page count
        setMpi(updatedMpi);
        toast.success(
          `MPI saved successfully! Total pages: ${calculatedPages}`
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save MPI:', errorData);
        toast.error(
          `Failed to save MPI: ${errorData.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      console.error('Error saving MPI:', error);
      toast.error('An error occurred while saving MPI');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpi || !newStep.title || !newStep.content || !newStep.category) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/step-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryName: newStep.category,
          stepTitle: newStep.title,
          stepContent: newStep.content,
        }),
      });

      if (response.ok) {
        toast.success('Step added successfully!');
        setNewStep({ title: '', content: '', category: '' });
        setShowAddStepModal(false);
        fetchProcessItems();
      } else {
        toast.error('Failed to add step');
      }
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('An error occurred while adding step');
    }
  };

  const handleBulkInsertTasks = async (
    taskIds: string[],
    sectionId: string
  ) => {
    if (!mpi) return;

    const selectedTasksData = tasks.filter(task => taskIds.includes(task._id));

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const currentContent = section.content || '';
        // Format all selected tasks as HTML for TinyMCE with minimal spacing
        const formattedTasks = selectedTasksData
          .map(task => `${task.step}`)
          .join('<br>');
        const newContent = currentContent
          ? `${currentContent}<br>${formattedTasks}`
          : formattedTasks;

        return {
          ...section,
          content: newContent,
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    // Increment usage count for each selected task
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedTasksData.map(async task => {
          const response = await fetch(
            `/api/admin/steps/${task._id}/increment-usage`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            // Update the local tasks state to reflect the new usage count
            setTasks(prevTasks =>
              prevTasks.map(t =>
                t._id === task._id ? { ...t, usageCount: t.usageCount + 1 } : t
              )
            );
          }
        })
      );
    } catch (error) {
      console.error('Error incrementing task usage count:', error);
      // Don't show error to user as the main functionality (inserting tasks) still works
    }

    setShowBulkTaskModal(false);
    setSelectedTasks([]);
    toast.success(`${selectedTasksData.length} tasks inserted successfully!`);
  };

  const handleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAllTasks = () => {
    const filteredTasks = tasks.filter(task => {
      const matchesSearch =
        task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProcessItem =
        !selectedProcessItem || task.categoryName === selectedProcessItem;
      return matchesSearch && matchesProcessItem;
    });

    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task._id));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setModalPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: modalSize.width,
      height: modalSize.height,
    });
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setModalSize({
        width: Math.max(400, resizeStart.width + deltaX), // Minimum width of 400px
        height: Math.max(300, resizeStart.height + deltaY), // Minimum height of 300px
      });
    }
  };

  const handleInsertDocumentId = (docId: DocumentId, sectionId: string) => {
    if (!mpi) return;

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const currentContent = section.content || '';
        // Format Document ID as HTML for TinyMCE
        const formattedDocId = `<p><strong>${docId.docId}</strong></p>`;
        const newContent = currentContent
          ? `${currentContent}<br><br>${formattedDocId}`
          : formattedDocId;

        return {
          ...section,
          content: newContent,
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    setShowInsertDocIdModal(false);
    toast.success(`Document ID "${docId.docId}" inserted successfully!`);
  };

  const handleInsertDocumentIdForProcessItem = (
    docId: DocumentId,
    sectionId: string
  ) => {
    if (!mpi) return;

    console.log('🔍 DEBUG: Adding Document ID to Process Item');
    console.log('Document ID:', docId.docId);
    console.log('Section ID:', sectionId);
    console.log('Current MPI sections:', mpi.sections);

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        console.log('✅ Found matching section:', section.title);

        // Clean up any existing content that might contain "Instructions:" or Document IDs
        let cleanContent = section.content || '';
        cleanContent = cleanContent.replace(/Instructions:\s*/gi, ''); // Remove "Instructions:" label
        cleanContent = cleanContent.replace(
          /<p><strong>(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)<\/strong><\/p>/gi,
          ''
        ); // Remove Document IDs from HTML content
        cleanContent = cleanContent.replace(
          /^(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)\s*\n*/gm,
          ''
        ); // Remove Document IDs from plain text content
        cleanContent = cleanContent.replace(/<br><br>/g, ''); // Remove extra line breaks
        cleanContent = cleanContent.trim();

        console.log('🧹 Cleaned content:', cleanContent);
        console.log('📝 Setting documentId to:', docId.docId);

        // Store Document ID in separate field for two-column layout
        const updatedSection = {
          ...section,
          documentId: docId.docId,
          content: cleanContent,
        };

        console.log('📋 Updated section:', updatedSection);
        return updatedSection;
      }
      return section;
    });

    console.log('🔄 Updated sections:', updatedSections);

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    setShowInsertDocIdModal(false);
    const sectionTitle =
      mpi.sections.find(s => s.id === sectionId)?.title || 'section';
    toast.success(`Document ID "${docId.docId}" added to ${sectionTitle}!`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image file size must be less than 5MB');
        return;
      }

      setSelectedImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = (sectionId: string) => {
    if (!mpi) return;

    let imageToAdd = '';

    if (selectedImageFile) {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = e => {
        const base64String = e.target?.result as string;
        const updatedSections = mpi.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              images: [...section.images, base64String],
            };
          }
          return section;
        });

        setMpi({
          ...mpi,
          sections: updatedSections,
        });

        // Reset states
        setSelectedImageFile(null);
        setImagePreview(null);
        setNewImageUrl('');
        setShowAddImageModal(false);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(selectedImageFile);
    } else if (newImageUrl.trim()) {
      // Fallback to URL if no file selected
      const updatedSections = mpi.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            images: [...section.images, newImageUrl.trim()],
          };
        }
        return section;
      });

      setMpi({
        ...mpi,
        sections: updatedSections,
      });

      setNewImageUrl('');
      setShowAddImageModal(false);
      toast.success('Image added successfully!');
    } else {
      toast.error('Please select an image file or enter an image URL');
    }
  };

  const handleRemoveImage = (sectionId: string, imageIndex: number) => {
    if (!mpi) return;

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        const updatedImages = section.images.filter(
          (_, index) => index !== imageIndex
        );
        return {
          ...section,
          images: updatedImages,
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    toast.success('Image removed successfully!');
  };

  const clearImageModal = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setNewImageUrl('');
    setShowAddImageModal(false);
  };

  // Prevent background scrolling when modals are open
  useEffect(() => {
    const isAnyModalOpen =
      showAddSectionModal ||
      showEditSectionModal ||
      showAddStepModal ||
      showBulkTaskModal ||
      showInsertDocIdModal ||
      showAddImageModal;

    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [
    showAddSectionModal,
    showEditSectionModal,
    showAddStepModal,
    showBulkTaskModal,
    showInsertDocIdModal,
    showAddImageModal,
  ]);

  const moveSectionUp = (sectionId: string) => {
    console.log('🔼 Move section up called for:', sectionId);
    if (!mpi) {
      console.log('❌ No MPI data');
      return;
    }

    const currentIndex = mpi.sections.findIndex(s => s.id === sectionId);
    console.log(
      '📍 Current index:',
      currentIndex,
      'Total sections:',
      mpi.sections.length
    );

    if (currentIndex <= 0) {
      toast.error('Section is already at the top');
      return;
    }

    // Create a completely new array to force React re-render
    const newSections = mpi.sections.map((section, index) => {
      if (index === currentIndex) {
        return mpi.sections[currentIndex - 1];
      } else if (index === currentIndex - 1) {
        return mpi.sections[currentIndex];
      } else {
        return section;
      }
    });

    console.log(
      '🔄 Updated sections:',
      newSections.map(s => ({ title: s.title, id: s.id }))
    );

    setMpi({
      ...mpi,
      sections: newSections,
    });

    toast.success('Section moved up!');
  };

  const moveSectionDown = (sectionId: string) => {
    console.log('🔽 Move section down called for:', sectionId);
    if (!mpi) {
      console.log('❌ No MPI data');
      return;
    }

    const currentIndex = mpi.sections.findIndex(s => s.id === sectionId);
    console.log(
      '📍 Current index:',
      currentIndex,
      'Total sections:',
      mpi.sections.length
    );

    if (currentIndex >= mpi.sections.length - 1) {
      toast.error('Section is already at the bottom');
      return;
    }

    // Create a completely new array to force React re-render
    const newSections = mpi.sections.map((section, index) => {
      if (index === currentIndex) {
        return mpi.sections[currentIndex + 1];
      } else if (index === currentIndex + 1) {
        return mpi.sections[currentIndex];
      } else {
        return section;
      }
    });

    console.log(
      '🔄 Updated sections:',
      newSections.map(s => ({ title: s.title, id: s.id }))
    );

    setMpi({
      ...mpi,
      sections: newSections,
    });

    toast.success('Section moved down!');
  };

  const handleContentChange = (sectionId: string, newContent: string) => {
    if (!mpi) return;

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          content: newContent,
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });
  };

  // Section CRUD handlers
  const handleAddSection = () => {
    if (!mpi || !newSectionTitle.trim()) return;

    const newSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle.trim(),
      content: '',
      order: mpi.sections.length,
      isCollapsed: false,
      images: [],
      documentId: undefined,
    };

    setMpi({
      ...mpi,
      sections: [...mpi.sections, newSection],
    });

    setNewSectionTitle('');
    setShowAddSectionModal(false);
    toast.success('Section added successfully!');
  };

  const handleEditSection = () => {
    if (!mpi || !editingSection || !newSectionTitle.trim()) return;

    const updatedSections = mpi.sections.map(section => {
      if (section.id === editingSection.id) {
        return {
          ...section,
          title: newSectionTitle.trim(),
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    setNewSectionTitle('');
    setEditingSection(null);
    setShowEditSectionModal(false);
    toast.success('Section updated successfully!');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!mpi) return;

    const sectionToDelete = mpi.sections.find(s => s.id === sectionId);
    if (!sectionToDelete) return;

    if (
      confirm(
        `Are you sure you want to delete the section "${sectionToDelete.title}"? This action cannot be undone.`
      )
    ) {
      const updatedSections = mpi.sections.filter(
        section => section.id !== sectionId
      );

      // Reorder remaining sections
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        order: index,
      }));

      setMpi({
        ...mpi,
        sections: reorderedSections,
      });

      toast.success('Section deleted successfully!');
    }
  };

  const openEditSectionModal = (section: { id: string; title: string }) => {
    setEditingSection(section);
    setNewSectionTitle(section.title);
    setShowEditSectionModal(true);
  };

  const handleRemoveDocumentId = (sectionId: string) => {
    if (!mpi) return;

    const updatedSections = mpi.sections.map(section => {
      if (section.id === sectionId) {
        // Also clean up any content that might contain "Instructions:" or Document IDs
        let cleanContent = section.content || '';
        cleanContent = cleanContent.replace(/Instructions:\s*/gi, ''); // Remove "Instructions:" label
        cleanContent = cleanContent.replace(
          /<p><strong>(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)<\/strong><\/p>/gi,
          ''
        ); // Remove Document IDs from HTML content
        cleanContent = cleanContent.replace(
          /^(PROC-\d+-[A-Z]|IPC-[A-Z0-9-]+)\s*\n*/gm,
          ''
        ); // Remove Document IDs from plain text content
        cleanContent = cleanContent.replace(/<br><br>/g, ''); // Remove extra line breaks
        cleanContent = cleanContent.trim();

        return {
          ...section,
          documentId: undefined,
          content: cleanContent,
        };
      }
      return section;
    });

    setMpi({
      ...mpi,
      sections: updatedSections,
    });

    const sectionTitle =
      mpi.sections.find(s => s.id === sectionId)?.title || 'section';
    toast.success(`Document ID removed from ${sectionTitle}!`);
  };

  const filteredProcessItems = processItems.filter(item =>
    item.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProcessItem =
      !selectedProcessItem || task.categoryName === selectedProcessItem;
    return matchesSearch && matchesProcessItem;
  });

  const filteredDocumentIds = documentIds.filter(
    docId =>
      docId.docId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (docId.description &&
        docId.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Loading MPI editor...</div>
        {/* Debug Panel */}
        <div className='fixed top-4 right-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-md'>
          <h3 className='text-yellow-400 font-bold mb-2'>Debug Info</h3>
          <div className='text-yellow-200 text-sm space-y-1'>
            <p>
              <strong>MPI ID:</strong> {params.id}
            </p>
            <p>
              <strong>Token:</strong>{' '}
              {localStorage.getItem('token') ? 'Exists' : 'Missing'}
            </p>
            <p>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>MPI Data:</strong> {mpi ? 'Loaded' : 'Not loaded'}
            </p>
            <div className='mt-2 space-y-1'>
              <button
                onClick={async () => {
                  console.log('🧪 Manual API test starting...');
                  const token = localStorage.getItem('token');
                  console.log(
                    '🧪 Token:',
                    token ? token.substring(0, 20) + '...' : 'null'
                  );

                  try {
                    const response = await fetch(`/api/mpi/${params.id}`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    console.log('🧪 Response status:', response.status);
                    console.log(
                      '🧪 Response headers:',
                      Object.fromEntries(response.headers.entries())
                    );

                    const data = await response.text();
                    console.log('🧪 Response body:', data);

                    try {
                      const jsonData = JSON.parse(data);
                      console.log('🧪 Parsed JSON:', jsonData);
                    } catch (e) {
                      console.log('🧪 Response is not JSON:', data);
                    }
                  } catch (error) {
                    console.error('🧪 API test error:', error);
                  }
                }}
                className='px-2 py-1 bg-blue-600 text-white rounded text-xs'
              >
                Test API Call
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Manual retry - fetching MPI again');
                  fetchMPI();
                }}
                className='px-2 py-1 bg-green-600 text-white rounded text-xs ml-1'
              >
                Retry Fetch
              </button>
              <button
                onClick={async () => {
                  console.log('🧪 Testing dashboard API...');
                  const token = localStorage.getItem('token');

                  try {
                    const response = await fetch('/api/mpi', {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    console.log('🧪 Dashboard API status:', response.status);
                    const data = await response.json();
                    console.log('🧪 Dashboard API response:', data);
                    console.log('🧪 Found MPIs:', data.mpis?.length || 0);
                  } catch (error) {
                    console.error('🧪 Dashboard API error:', error);
                  }
                }}
                className='px-2 py-1 bg-purple-600 text-white rounded text-xs ml-1'
              >
                Test Dashboard API
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mpi) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center'>
        <div className='text-white text-xl'>MPI not found</div>
        {/* Debug Panel */}
        <div className='fixed top-4 right-4 bg-red-500/20 border border-red-500/30 rounded-lg p-4 max-w-md'>
          <h3 className='text-red-400 font-bold mb-2'>
            Debug Info - MPI Not Found
          </h3>
          <div className='text-red-200 text-sm space-y-1'>
            <p>
              <strong>MPI ID:</strong> {params.id}
            </p>
            <p>
              <strong>Token:</strong>{' '}
              {localStorage.getItem('token') ? 'Exists' : 'Missing'}
            </p>
            <p>
              <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>MPI Data:</strong> {mpi ? 'Loaded' : 'Not loaded'}
            </p>
            <div className='mt-2 space-y-1'>
              <button
                onClick={async () => {
                  console.log('🧪 Manual API test starting...');
                  const token = localStorage.getItem('token');
                  console.log(
                    '🧪 Token:',
                    token ? token.substring(0, 20) + '...' : 'null'
                  );

                  try {
                    const response = await fetch(`/api/mpi/${params.id}`, {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    console.log('🧪 Response status:', response.status);
                    console.log(
                      '🧪 Response headers:',
                      Object.fromEntries(response.headers.entries())
                    );

                    const data = await response.text();
                    console.log('🧪 Response body:', data);

                    try {
                      const jsonData = JSON.parse(data);
                      console.log('🧪 Parsed JSON:', jsonData);
                    } catch (e) {
                      console.log('🧪 Response is not JSON:', data);
                    }
                  } catch (error) {
                    console.error('🧪 API test error:', error);
                  }
                }}
                className='px-2 py-1 bg-blue-600 text-white rounded text-xs'
              >
                Test API Call
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Manual retry - fetching MPI again');
                  fetchMPI();
                }}
                className='px-2 py-1 bg-green-600 text-white rounded text-xs ml-1'
              >
                Retry Fetch
              </button>
              <button
                onClick={async () => {
                  console.log('🧪 Testing dashboard API...');
                  const token = localStorage.getItem('token');

                  try {
                    const response = await fetch('/api/mpi', {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                    });
                    console.log('🧪 Dashboard API status:', response.status);
                    const data = await response.json();
                    console.log('🧪 Dashboard API response:', data);
                    console.log('🧪 Found MPIs:', data.mpis?.length || 0);
                  } catch (error) {
                    console.error('🧪 Dashboard API error:', error);
                  }
                }}
                className='px-2 py-1 bg-purple-600 text-white rounded text-xs ml-1'
              >
                Test Dashboard API
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* CSS for live preview page numbering and Form ID */}
      <style jsx global>{`
        .live-preview-container {
          counter-reset: page;
          position: relative;
        }
        .live-preview-container::after {
          content: 'Form ID: ${mpi?.formId?.formId || mpi?._id || 'N/A'}';
          position: fixed;
          bottom: 0.5in;
          left: 0.5in;
          font-size: 10pt;
          color: #666;
          font-family: Arial, sans-serif;
          z-index: 1000;
        }
        .live-preview-container::before {
          content: 'Page ' counter(page) ' of ' counter(pages);
          position: fixed;
          bottom: 0.5in;
          right: 0.5in;
          font-size: 10pt;
          color: #666;
          font-family: Arial, sans-serif;
          z-index: 1000;
        }
        .live-preview-section {
          break-inside: avoid;
          margin-bottom: 1rem;
          page-break-inside: avoid;
        }
        .live-preview-section:last-child {
          margin-bottom: 0;
        }
        .live-preview-page-break {
          page-break-before: always;
        }
        .live-preview-no-break {
          page-break-before: avoid;
        }
      `}</style>

      <div
        className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4'
        data-form-id={mpi?.formId?.formId || mpi?._id || 'N/A'}
      >
        <div className='w-full'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center space-x-4'>
              <Link href='/engineer/dashboard'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-white hover:bg-white/10'
                >
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className='text-4xl font-bold text-white'>MPI Editor</h1>
                <p className='text-white/70 font-semibold text-red-500 mt-1'>
                  {mpi.customerCompanyId.companyName}-(
                  {mpi.customerAssemblyName}) - {mpi.mpiNumber} (Rev. -{' '}
                  {mpi.mpiVersion})
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <Button
                onClick={() => setShowSplitScreen(!showSplitScreen)}
                className={`${showSplitScreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
              >
                <FileText className='h-4 w-4 mr-2' />
                {showSplitScreen ? 'Hide Preview' : 'Show Preview'}
              </Button>
              <Button
                onClick={() => setShowAddSectionModal(true)}
                className='bg-purple-600 hover:bg-purple-700 text-white'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Section
              </Button>
              <Button
                onClick={() => setShowAddStepModal(true)}
                className='bg-green-600 hover:bg-green-700 text-white'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Step
              </Button>
              <Button
                onClick={handleSaveMPI}
                disabled={isSaving}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <Save className='h-4 w-4 mr-2' />
                {isSaving ? 'Saving...' : 'Save MPI'}
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div
            className={`mt-8 ${showSplitScreen ? 'flex space-x-4 h-[calc(100vh-200px)]' : ''}`}
          >
            {/* Editor Section */}
            <div
              className={`${showSplitScreen ? 'w-1/2 overflow-y-auto' : 'w-full'}`}
            >
              {/* MPI Sections */}
              <div className='space-y-6'>
                {mpi.sections.map((section, sectionIndex) => {
                  console.log(
                    '🎨 Editor - Section:',
                    section.title,
                    'Index:',
                    sectionIndex,
                    'ID:',
                    section.id,
                    'Order:',
                    section.order
                  );
                  return (
                    <motion.div
                      key={`${section.id}-${sectionIndex}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sectionIndex * 0.1 }}
                      className='transition-transform duration-200'
                    >
                      <Card className='glassmorphism-card glassmorphism-card-hover'>
                        <CardHeader>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center'>
                              <div className='mr-3 flex flex-col space-y-1'>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => {
                                    console.log(
                                      '🔼 Up button clicked for section:',
                                      section.id,
                                      'at index:',
                                      sectionIndex
                                    );
                                    moveSectionUp(section.id);
                                  }}
                                  disabled={sectionIndex === 0}
                                  className='text-white/50 hover:text-white/80 hover:bg-white/10 p-1 h-6 w-6'
                                >
                                  <ChevronUp className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => {
                                    console.log(
                                      '🔽 Down button clicked for section:',
                                      section.id,
                                      'at index:',
                                      sectionIndex
                                    );
                                    moveSectionDown(section.id);
                                  }}
                                  disabled={
                                    sectionIndex === mpi.sections.length - 1
                                  }
                                  className='text-white/50 hover:text-white/80 hover:bg-white/10 p-1 h-6 w-6'
                                >
                                  <ChevronDown className='h-4 w-4' />
                                </Button>
                              </div>
                              <Folder className='h-6 w-6 mr-3 text-purple-400' />
                              <div className='flex-1 flex items-center justify-between'>
                                <div className='flex-1'>
                                  <CardTitle className='text-white text-xl'>
                                    {section.title}
                                  </CardTitle>
                                  <CardDescription className='text-white/70'>
                                    {section.content
                                      ? 'Content available'
                                      : 'No content'}
                                  </CardDescription>
                                </div>
                                {section.documentId && (
                                  <div className='flex items-center space-x-2'>
                                    <div className='px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-lg'>
                                      <span className='text-blue-300 text-sm font-medium'>
                                        {section.documentId}
                                      </span>
                                    </div>
                                    <Button
                                      size='sm'
                                      variant='ghost'
                                      onClick={() =>
                                        handleRemoveDocumentId(section.id)
                                      }
                                      className='text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 h-6 w-6'
                                    >
                                      <X className='h-3 w-3' />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className='flex items-center space-x-2'>
                              {/* Add Doc ID to Title Button */}
                              <div className='relative group'>
                                <Button
                                  size='sm'
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setShowInsertDocIdModal(true);
                                  }}
                                  className='bg-orange-600 hover:bg-orange-700 text-white border-0 p-2'
                                >
                                  <FileText className='h-4 w-4' />
                                </Button>

                                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                                  Add Doc ID to Title
                                </div>
                              </div>

                              {/* Add Tasks Button */}
                              <div className='relative group'>
                                <Button
                                  size='sm'
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setSelectedTasks([]);
                                    setShowBulkTaskModal(true);
                                  }}
                                  className='bg-blue-600 hover:bg-blue-700 text-white border-0 p-2'
                                >
                                  <Clipboard className='h-4 w-4' />
                                </Button>
                                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                                  Insert Tasks
                                </div>
                              </div>
                              {/* Add Image Button */}
                              <div className='relative group'>
                                <Button
                                  size='sm'
                                  onClick={() => {
                                    setSelectedSectionId(section.id);
                                    setShowAddImageModal(true);
                                  }}
                                  className='bg-purple-600 hover:bg-purple-700 text-white border-0 p-2'
                                >
                                  <ImageIcon className='h-4 w-4' />
                                </Button>
                                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                                  Add Image
                                </div>
                              </div>
                              {/* Add Doc ID to Title Button */}

                              <div className='relative group'>
                                <Button
                                  size='sm'
                                  onClick={() =>
                                    openEditSectionModal({
                                      id: section.id,
                                      title: section.title,
                                    })
                                  }
                                  className='bg-yellow-600 hover:bg-yellow-700 text-white border-0 p-2'
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                                  Edit
                                </div>
                              </div>
                              <div className='relative group'>
                                <Button
                                  size='sm'
                                  onClick={() =>
                                    handleDeleteSection(section.id)
                                  }
                                  className='bg-red-600 hover:bg-red-700 text-white border-0 p-2'
                                >
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                                <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                                  Delete
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className='space-y-4'>
                            <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <Editor
                                    apiKey={
                                      process.env.NEXT_PUBLIC_TINYMCE_API_KEY ||
                                      'no-api-key'
                                    }
                                    value={section.content || ''}
                                    onEditorChange={(content: string) =>
                                      handleContentChange(section.id, content)
                                    }
                                    init={{
                                      height: 200,
                                      menubar: false,
                                      plugins: [
                                        'advlist',
                                        'autolink',
                                        'lists',
                                        'link',
                                        'image',
                                        'charmap',
                                        'preview',
                                        'anchor',
                                        'searchreplace',
                                        'visualblocks',
                                        'code',
                                        'fullscreen',
                                        'insertdatetime',
                                        'media',
                                        'table',
                                        'help',
                                        'wordcount',
                                        'textcolor',
                                        'colorpicker',
                                        'textpattern',
                                        'paste',
                                        'emoticons',
                                      ],
                                      toolbar:
                                        'undo redo | blocks | ' +
                                        'bold italic underline strikethrough | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'forecolor backcolor | removeformat | help | image | link | table | ' +
                                        'charmap | emoticons | fullscreen | preview | code',
                                      content_style: `
                                body { 
                                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                                  font-size: 14px; 
                                  color: #1f2937; 
                                  background-color: transparent;
                                }
                                p { margin: 0 0 8px 0; color: #1f2937; }
                                h1, h2, h3, h4, h5, h6 { color: #1f2937; margin: 8px 0; }
                                strong, b { color: #1f2937; font-weight: bold; }
                                em, i { color: #1f2937; font-style: italic; }
                                u { color: #1f2937; text-decoration: underline; }
                                table { border-collapse: collapse; width: 100%; }
                                table td, table th { border: 1px solid #d1d5db; padding: 8px; color: #1f2937; }
                                a { color: #2563eb; text-decoration: underline; }
                                img { max-width: 100%; height: auto; }
                                .mce-content-body { color: #1f2937 !important; }
                              `,
                                      skin: 'oxide-dark',
                                      content_css: 'dark',
                                      branding: false,
                                      promotion: false,
                                      statusbar: false,
                                      resize: false,
                                      placeholder:
                                        'Enter section content here... You can use bold, italic, underline, colors, images, tables, and more!',
                                      setup: (editor: any) => {
                                        editor.on('init', () => {
                                          editor.getContainer().style.border =
                                            'none';
                                          editor.getContainer().style.borderRadius =
                                            '8px';
                                          // Ensure content is visible
                                          const body = editor.getBody();
                                          if (body) {
                                            body.style.color = '#1f2937';
                                            body.style.backgroundColor =
                                              'transparent';
                                          }
                                        });
                                        editor.on('NodeChange', () => {
                                          // Ensure all content remains visible
                                          const body = editor.getBody();
                                          if (body) {
                                            body.style.color = '#1f2937';
                                          }
                                        });
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Images Section */}
                            {section.images && section.images.length > 0 && (
                              <div className='mt-4'>
                                <h4 className='text-white font-semibold mb-2 flex items-center'>
                                  <FileImage className='h-4 w-4 mr-2' />
                                  Images ({section.images.length})
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                  {section.images.map(
                                    (imageUrl, imageIndex) => (
                                      <div
                                        key={imageIndex}
                                        className='relative group'
                                      >
                                        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
                                          {/* Image Preview */}
                                          <div className='mb-3'>
                                            <img
                                              src={imageUrl}
                                              alt={`Section image ${imageIndex + 1}`}
                                              className='w-full h-32 object-cover rounded border border-white/20'
                                              onError={e => {
                                                const target =
                                                  e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const parent =
                                                  target.parentElement;
                                                if (parent) {
                                                  parent.innerHTML = `
                                            <div class="w-full h-32 bg-white/10 border border-white/20 rounded flex items-center justify-center">
                                              <div class="text-white/50 text-center">
                                                <div class="text-sm">Image failed to load</div>
                                                <div class="text-xs mt-1">${imageUrl.length > 30 ? imageUrl.substring(0, 30) + '...' : imageUrl}</div>
                                              </div>
                                            </div>
                                          `;
                                                }
                                              }}
                                            />
                                          </div>

                                          {/* Image Info */}
                                          <div className='flex items-center space-x-2 mb-2'>
                                            <LinkIcon className='h-4 w-4 text-blue-400' />
                                            <span className='text-white/70 text-sm truncate'>
                                              {imageUrl.length > 40
                                                ? imageUrl.substring(0, 40) +
                                                  '...'
                                                : imageUrl}
                                            </span>
                                          </div>

                                          <Button
                                            size='sm'
                                            onClick={() =>
                                              window.open(imageUrl, '_blank')
                                            }
                                            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium'
                                          >
                                            View Full Size
                                          </Button>
                                        </div>
                                        <Button
                                          size='sm'
                                          variant='destructive'
                                          onClick={() =>
                                            handleRemoveImage(
                                              section.id,
                                              imageIndex
                                            )
                                          }
                                          className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                                        >
                                          <X className='h-3 w-3' />
                                        </Button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Floating Action Buttons - Between Editor and Preview */}
            {showSplitScreen && (
              <div className='flex flex-col justify-center items-center space-y-3 px-1 w-16'>
                {/* Scroll to Top Button */}
                <Button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  className='bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-500/25 rounded-full p-3 h-12 w-12 flex items-center justify-center'
                  title='Scroll to Top'
                >
                  <ArrowUp className='h-5 w-5' />
                </Button>

                {/* Add Section Button */}
                <Button
                  onClick={() => setShowAddSectionModal(true)}
                  className='bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 rounded-full p-4 h-14 w-14 flex items-center justify-center'
                  title='Add New Section'
                >
                  <Plus className='h-6 w-6' />
                </Button>
              </div>
            )}

            {/* Print Preview Section */}
            {showSplitScreen && (
              <div className='w-1/2 overflow-y-auto'>
                <div className='glassmorphism-card p-4 h-full'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-white'>
                      Print Preview
                    </h3>
                    <div className='flex space-x-2'>
                      <Button
                        size='sm'
                        onClick={() =>
                          window.open(`/mpi/${mpi._id}/print-preview`, '_blank')
                        }
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        <FileText className='h-4 w-4 mr-2' />
                        Full Preview
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => {
                          const printWindow = window.open(
                            `/mpi/${mpi._id}/print-preview`,
                            '_blank'
                          );
                          if (printWindow) {
                            printWindow.onload = () => {
                              setTimeout(() => {
                                printWindow.print();
                              }, 1000);
                            };
                          }
                        }}
                        className='bg-green-600 hover:bg-green-700 text-white'
                      >
                        <Printer className='h-4 w-4 mr-2' />
                        Print
                      </Button>
                    </div>
                  </div>
                  <div className='bg-white rounded-lg p-6 shadow-lg h-full overflow-y-auto live-preview-container'>
                    <div className='text-black'>
                      {/* MPI Header */}
                      <div className='text-center mb-8 border-b-2 border-gray-300 pb-6'>
                        <h1 className='text-3xl font-bold mb-4 text-gray-900'>
                          Manufacturing Process Instructions
                        </h1>
                      </div>

                      {/* Assembly Details Section */}
                      <div className='mb-8 border-2 border-gray-300 rounded-lg p-6 live-preview-section'>
                        <h2 className='text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2'>
                          Assembly Details
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-900'>
                          <div>
                            <span className='font-semibold'>MPI Number:</span>{' '}
                            {mpi.mpiNumber}
                          </div>
                          <div>
                            <span className='font-semibold'>MPI Rev:</span>{' '}
                            {mpi.mpiVersion}
                          </div>
                          <div>
                            <span className='font-semibold'>Job No:</span>{' '}
                            {mpi.jobNumber}
                          </div>
                          <div>
                            <span className='font-semibold'>Old Job No:</span>{' '}
                            {mpi.oldJobNumber || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>Customer:</span>{' '}
                            {mpi.customerCompanyId?.companyName || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>
                              Assembly Quantity:
                            </span>{' '}
                            {mpi.assemblyQuantity || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>
                              Customer Assembly Name:
                            </span>{' '}
                            {mpi.customerAssemblyName || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>
                              Customer Assembly Rev:
                            </span>{' '}
                            {mpi.assemblyRev || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>Drawing Name:</span>{' '}
                            {mpi.drawingName || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>Drawing Rev:</span>{' '}
                            {mpi.drawingRev || 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>
                              Kit receive date:
                            </span>{' '}
                            {mpi.kitReceivedDate
                              ? new Date(
                                  mpi.kitReceivedDate
                                ).toLocaleDateString()
                              : 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>
                              Kit release date:
                            </span>{' '}
                            {mpi.dateReleased
                              ? new Date(mpi.dateReleased).toLocaleDateString()
                              : 'N/A'}
                          </div>
                          <div>
                            <span className='font-semibold'>Pages:</span>{' '}
                            {mpi.totalPages || mpi.pages || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Sections */}
                      <div className='space-y-4'>
                        {mpi.sections.map((section, index) => (
                          <div
                            key={section.id}
                            className={`border-2 border-gray-300 rounded-lg p-4 live-preview-section ${index === 0 ? 'live-preview-no-break' : ''}`}
                          >
                            <h3 className='text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2 flex justify-between items-center'>
                              <span>{section.title}</span>
                              {section.documentId && (
                                <span className='px-3 py-1 bg-blue-100 border border-blue-300 rounded-lg text-blue-800 text-sm font-medium'>
                                  {section.documentId}
                                </span>
                              )}
                            </h3>
                            {section.content && (
                              <div className='text-gray-900'>
                                <div
                                  className='bg-gray-50 border-2 border-gray-200 rounded-lg p-4'
                                  dangerouslySetInnerHTML={{
                                    __html: section.content,
                                  }}
                                />
                              </div>
                            )}
                            {!section.content && (
                              <div className='text-gray-500 italic'>
                                No content added to this section yet.
                              </div>
                            )}

                            {/* Images Section */}
                            {section.images && section.images.length > 0 && (
                              <div className='mt-4'>
                                <h4 className='text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1'>
                                  Images ({section.images.length})
                                </h4>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  {section.images.map(
                                    (imageUrl, imageIndex) => (
                                      <div
                                        key={imageIndex}
                                        className='border border-gray-300 rounded-lg p-3 bg-gray-50'
                                      >
                                        <img
                                          src={imageUrl}
                                          alt={`Section image ${imageIndex + 1}`}
                                          className='w-full h-auto max-h-64 object-contain rounded'
                                          onError={e => {
                                            const target =
                                              e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                              parent.innerHTML = `
                                            <div class="text-gray-500 text-center py-4">
                                              <div class="text-sm">Image failed to load</div>
                                              <div class="text-xs mt-1">${imageUrl.length > 50 ? imageUrl.substring(0, 50) + '...' : imageUrl}</div>
                                            </div>
                                          `;
                                            }
                                          }}
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add Section Modal */}
          {showAddSectionModal && (
            <div className='fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4 overflow-hidden'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='glassmorphism-card rounded-lg p-6 w-full max-w-md'
              >
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-white'>
                    Add New Section
                  </h2>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setShowAddSectionModal(false);
                      setNewSectionTitle('');
                    }}
                    className='text-white hover:bg-white/10'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='sectionTitle' className='text-white'>
                      Section Title
                    </Label>
                    <Input
                      id='sectionTitle'
                      value={newSectionTitle}
                      onChange={e => setNewSectionTitle(e.target.value)}
                      placeholder='Enter section title (e.g., General Instructions, Kit Release)'
                      className='mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      onKeyPress={e => e.key === 'Enter' && handleAddSection()}
                    />
                  </div>

                  <div className='flex justify-end space-x-3'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setShowAddSectionModal(false);
                        setNewSectionTitle('');
                      }}
                      className='border-gray-600 text-white hover:bg-gray-700'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSection}
                      disabled={!newSectionTitle.trim()}
                      className='bg-purple-600 hover:bg-purple-700 text-white'
                    >
                      Add Section
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Edit Section Modal */}
          {showEditSectionModal && (
            <div className='fixed inset-0 bg-red-900/50 flex items-center justify-center z-50 p-4 overflow-hidden'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='glassmorphism-card rounded-lg p-6 w-full max-w-md'
              >
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-white'>
                    Edit Section
                  </h2>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setShowEditSectionModal(false);
                      setEditingSection(null);
                      setNewSectionTitle('');
                    }}
                    className='text-white hover:bg-white/10'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='editSectionTitle' className='text-white'>
                      Section Title
                    </Label>
                    <Input
                      id='editSectionTitle'
                      value={newSectionTitle}
                      onChange={e => setNewSectionTitle(e.target.value)}
                      placeholder='Enter section title'
                      className='mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      onKeyPress={e => e.key === 'Enter' && handleEditSection()}
                    />
                  </div>

                  <div className='flex justify-end space-x-3'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setShowEditSectionModal(false);
                        setEditingSection(null);
                        setNewSectionTitle('');
                      }}
                      className='border-gray-600 text-white hover:bg-gray-700'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEditSection}
                      disabled={!newSectionTitle.trim()}
                      className='bg-yellow-600 hover:bg-yellow-700 text-white'
                    >
                      Update Section
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Add Step Modal */}
          {showAddStepModal && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='glassmorphism-card rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
              >
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-white'>
                    Add New Step
                  </h2>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowAddStepModal(false)}
                    className='text-white hover:bg-white/10'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <form onSubmit={handleAddStep} className='space-y-4'>
                  <div>
                    <Label htmlFor='category' className='text-white'>
                      Process Item *
                    </Label>
                    <select
                      id='category'
                      value={newStep.category}
                      onChange={e =>
                        setNewStep({ ...newStep, category: e.target.value })
                      }
                      className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      style={{ colorScheme: 'dark' }}
                      required
                    >
                      <option value='' className='bg-gray-800 text-white'>
                        Select a process item
                      </option>
                      {filteredProcessItems.map(item => (
                        <option
                          key={item._id}
                          value={item.categoryName}
                          className='bg-gray-800 text-white'
                        >
                          {item.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor='title' className='text-white'>
                      Step Title *
                    </Label>
                    <Input
                      id='title'
                      value={newStep.title}
                      onChange={e =>
                        setNewStep({ ...newStep, title: e.target.value })
                      }
                      className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                      placeholder='Enter step title'
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='content' className='text-white'>
                      Step Content *
                    </Label>
                    <textarea
                      id='content'
                      value={newStep.content}
                      onChange={e =>
                        setNewStep({ ...newStep, content: e.target.value })
                      }
                      className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]'
                      placeholder='Enter step content'
                      required
                    />
                  </div>

                  <div className='flex space-x-3 pt-4'>
                    <Button
                      type='submit'
                      className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Step
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowAddStepModal(false)}
                      className='flex-1 border-white/20 text-white hover:bg-white/10'
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}

          {/* Bulk Insert Tasks Modal */}
          {showBulkTaskModal && (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-2'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-white/95 backdrop-blur-md border border-white/30 rounded-lg p-4 overflow-y-auto shadow-2xl relative'
                style={{
                  position: 'absolute',
                  left: `${modalPosition.x}px`,
                  top: `${modalPosition.y}px`,
                  width: `${modalSize.width}px`,
                  height: `${modalSize.height}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  minWidth: '400px',
                  minHeight: '300px',
                  maxWidth: '95vw',
                  maxHeight: '95vh',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className='flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing'
                  onMouseDown={handleMouseDown}
                >
                  <div className='flex-1'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Bulk Insert Tasks
                    </h2>
                    <p className='text-gray-600 text-sm mt-1'>
                      Select multiple tasks to insert at once • Drag to move
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setShowBulkTaskModal(false);
                      setSelectedTasks([]);
                      setModalPosition({ x: 0, y: 0 });
                      setModalSize({ width: 800, height: 600 });
                    }}
                    className='text-gray-600 hover:bg-gray-100 flex-shrink-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div className='mb-4 space-y-3'>
                  <Input
                    placeholder='Search tasks...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500'
                  />

                  {/* Process Item Filter Dropdown */}
                  <div className='flex items-center space-x-2'>
                    <label className='text-sm font-medium text-gray-700 whitespace-nowrap'>
                      Filter by Process Item:
                    </label>
                    <select
                      value={selectedProcessItem}
                      onChange={e => setSelectedProcessItem(e.target.value)}
                      className='flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>All Process Items</option>
                      {processItems.map(item => (
                        <option key={item._id} value={item.categoryName}>
                          {item.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center space-x-4'>
                    <Button
                      size='sm'
                      onClick={handleSelectAllTasks}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      {selectedTasks.length === filteredTasks.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                    <span className='text-gray-600 text-sm'>
                      {selectedTasks.length} of {filteredTasks.length} tasks
                      selected
                    </span>
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      onClick={() => {
                        setShowBulkTaskModal(false);
                        setSelectedTasks([]);
                        setModalPosition({ x: 0, y: 0 });
                        setModalSize({ width: 800, height: 600 });
                      }}
                      variant='outline'
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() =>
                        handleBulkInsertTasks(selectedTasks, selectedSectionId)
                      }
                      disabled={selectedTasks.length === 0}
                      className='bg-green-600 hover:bg-green-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Insert {selectedTasks.length} Tasks
                    </Button>
                  </div>
                </div>

                <div className='space-y-0.5 max-h-[600px] overflow-y-auto'>
                  {filteredTasks.map(task => (
                    <div
                      key={task._id}
                      className='bg-gray-50 rounded p-3 border border-gray-200 hover:bg-gray-100 transition-all duration-200 group cursor-pointer'
                      onClick={() => handleTaskSelection(task._id)}
                    >
                      <div className='flex items-center space-x-4'>
                        {/* Selection Circle with Arrow */}
                        <div className='flex items-center space-x-3'>
                          <div
                            className={`h-5 w-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 ${
                              selectedTasks.includes(task._id)
                                ? 'bg-blue-600 border-blue-600'
                                : 'bg-white border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {selectedTasks.includes(task._id) && (
                              <div className='h-2 w-2 bg-white rounded-full'></div>
                            )}
                          </div>

                          {/* Live Arrow Indicator */}
                          <div
                            className={`transition-all duration-200 ${
                              selectedTasks.includes(task._id)
                                ? 'opacity-100 translate-x-0'
                                : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                            }`}
                          >
                            <svg
                              className='w-4 h-4 text-blue-600'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Process Item Badge */}
                        <Badge className='bg-purple-500 text-white flex-shrink-0 text-xs px-3 py-1'>
                          {task.categoryName}
                        </Badge>

                        {/* Usage Count */}
                        <span className='text-gray-500 text-xs flex-shrink-0'>
                          Used {task.usageCount}
                        </span>

                        {/* Task Description */}
                        <p className='text-gray-700 text-sm flex-1 truncate'>
                          {task.step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resize Handle */}
                <div
                  className='absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity'
                  onMouseDown={handleResizeStart}
                  onMouseMove={handleResizeMove}
                  onMouseUp={handleMouseUp}
                  style={{
                    background:
                      'linear-gradient(-45deg, transparent 30%, #666 30%, #666 40%, transparent 40%, transparent 60%, #666 60%, #666 70%, transparent 70%)',
                  }}
                />
              </motion.div>
            </div>
          )}

          {/* Insert Document ID Modal */}
          {showInsertDocIdModal && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='glassmorphism-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h2 className='text-xl font-semibold text-white'>
                      Add Document ID to Process Item
                    </h2>
                    <p className='text-white/70 text-sm mt-1'>
                      Add Document ID to the section title (header badge) or
                      insert into content area
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setShowInsertDocIdModal(false)}
                    className='text-white hover:bg-white/10'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div className='mb-4'>
                  <Input
                    placeholder='Search document IDs...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='bg-white/10 border-white/20 text-white placeholder:text-white/60'
                  />
                </div>

                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {filteredDocumentIds.map(docId => (
                    <div
                      key={docId._id}
                      className='bg-white/5 rounded-lg p-4 border border-white/10'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4 flex-1'>
                          <div className='flex-1'>
                            <p className='text-white font-medium text-sm'>
                              {docId.description || 'Process Item'}
                            </p>
                          </div>
                          <div className='flex-1'>
                            <Badge className='bg-green-500 text-white'>
                              {docId.docId}
                            </Badge>
                          </div>
                        </div>
                        <div className='ml-4'>
                          <Button
                            size='sm'
                            onClick={() => {
                              handleInsertDocumentIdForProcessItem(
                                docId,
                                selectedSectionId
                              );
                            }}
                            className='bg-green-600 hover:bg-green-700 text-white font-medium'
                          >
                            <Plus className='h-4 w-4 mr-1' />
                            Add DocId
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Add Image Modal */}
          {showAddImageModal && (
            <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-hidden flex items-center justify-center'>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-white/95 backdrop-blur-md border border-white/30 rounded-lg p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto'
              >
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Upload Image
                  </h2>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearImageModal}
                    className='text-gray-600 hover:bg-gray-100'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-4'>
                  {/* Image Format & Size Notes */}
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <h3 className='text-blue-800 font-semibold mb-2'>
                      📋 Upload Guidelines
                    </h3>
                    <div className='text-blue-700 text-sm space-y-1'>
                      <p>
                        <strong>Supported Formats:</strong> JPEG, JPG, PNG, GIF,
                        WebP
                      </p>
                      <p>
                        <strong>Maximum Size:</strong> 5MB per image
                      </p>
                      <p>
                        <strong>Recommended:</strong> 1920x1080 or smaller for
                        best performance
                      </p>
                      <p>
                        <strong>Quality:</strong> High resolution images will be
                        automatically optimized
                      </p>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <Label
                      htmlFor='imageFile'
                      className='text-gray-900 font-medium'
                    >
                      Upload Image File *
                    </Label>
                    <div className='mt-2'>
                      <input
                        id='imageFile'
                        type='file'
                        accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                        onChange={handleFileSelect}
                        className='hidden'
                      />
                      <label
                        htmlFor='imageFile'
                        className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors'
                      >
                        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                          <ImageIcon className='w-8 h-8 mb-2 text-gray-500' />
                          <p className='mb-2 text-sm text-gray-700'>
                            <span className='font-semibold'>
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                          <p className='text-xs text-gray-500'>
                            JPEG, PNG, GIF, WebP (MAX. 5MB)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* File Info Display */}
                    {selectedImageFile && (
                      <div className='mt-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
                        <div className='flex items-center space-x-2'>
                          <ImageIcon className='h-4 w-4 text-green-600' />
                          <span className='text-green-800 text-sm font-medium'>
                            {selectedImageFile.name}
                          </span>
                          <span className='text-green-600 text-xs'>
                            ({(selectedImageFile.size / 1024 / 1024).toFixed(2)}{' '}
                            MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div>
                      <Label className='text-gray-900 font-medium'>
                        Preview
                      </Label>
                      <div className='mt-2 border border-gray-200 rounded-lg p-2 bg-gray-50'>
                        <img
                          src={imagePreview}
                          alt='Preview'
                          className='max-w-full h-auto max-h-48 rounded'
                        />
                      </div>
                    </div>
                  )}

                  {/* Alternative URL Input */}
                  <div className='border-t border-gray-200 pt-4'>
                    <Label
                      htmlFor='imageUrl'
                      className='text-gray-900 font-medium'
                    >
                      Or Enter Image URL
                    </Label>
                    <Input
                      id='imageUrl'
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      className='bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 mt-2'
                      placeholder='https://example.com/image.jpg'
                    />
                    <p className='text-gray-600 text-xs mt-1'>
                      Use this if you have an image URL instead of uploading a
                      file
                    </p>
                  </div>

                  <div className='flex space-x-3 pt-4'>
                    <Button
                      onClick={() => handleAddImage(selectedSectionId)}
                      disabled={!selectedImageFile && !newImageUrl.trim()}
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <ImageIcon className='h-4 w-4 mr-2' />
                      {selectedImageFile ? 'Upload Image' : 'Add Image'}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={clearImageModal}
                      className='flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white'
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons - For Single Editor View */}
        {!showSplitScreen && (
          <div className='fixed bottom-8 right-8 z-50 flex flex-col space-y-3'>
            {/* Scroll to Top Button */}
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className='bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-500/25 rounded-full p-3 h-12 w-12 flex items-center justify-center'
              title='Scroll to Top'
            >
              <ArrowUp className='h-5 w-5' />
            </Button>

            {/* Add Section Button */}
            <Button
              onClick={() => setShowAddSectionModal(true)}
              className='bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 rounded-full p-4 h-14 w-14 flex items-center justify-center'
              title='Add New Section'
            >
              <Plus className='h-6 w-6' />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
