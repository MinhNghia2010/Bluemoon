'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PageHeader } from './shared/PageHeader';
import { feeCategoriesApi } from '@/lib/api';
import { toast } from 'sonner';

// Skeleton Components
const CategoryListSkeleton = () => (
  <div className="bg-bg-white rounded-[16px] overflow-hidden shadow-lg border border-border-light">
    {/* Table Header */}
    <div className="grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[16px] bg-neutral-50 border-b border-border-light">
      <div className="text-sm font-medium text-text-secondary">Category Name</div>
      <div className="text-sm font-medium text-text-secondary">Amount</div>
      <div className="text-sm font-medium text-text-secondary">Frequency</div>
      <div className="text-sm font-medium text-text-secondary">Description</div>
      <div className="text-sm font-medium text-text-secondary text-center">Actions</div>
    </div>
    {/* Skeleton Rows */}
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="animate-pulse grid grid-cols-[2fr_1fr_1fr_2fr_80px] gap-[20px] px-[24px] py-[20px] border-b border-neutral-100">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div>
      </div>
    ))}
  </div>
);

const CategoryFormSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-44 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
      </div>
    </div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8">
      <div className="space-y-5">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-2"></div>
            <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>
        ))}
        <div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-2"></div>
          <div className="h-24 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-24"></div>
        <div className="h-11 bg-gray-300 dark:bg-gray-600 rounded-md w-32"></div>
      </div>
    </div>
  </div>
);

// Lazy load heavy components
const CategoryList = dynamic(() => import('./fee-categories/CategoryList').then(mod => ({ default: mod.CategoryList })), {
  loading: () => <CategoryListSkeleton />,
  ssr: false
});

const CategoryForm = dynamic(() => import('./fee-categories/CategoryForm').then(mod => ({ default: mod.CategoryForm })), {
  loading: () => <CategoryFormSkeleton />,
  ssr: false
});

const CategoryDetailModal = dynamic(() => import('./fee-categories/CategoryDetailModal').then(mod => ({ default: mod.CategoryDetailModal })), {
  ssr: false
});

interface FeeCategory {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description: string;
  active: boolean;
  isActive?: boolean;
}

type ViewMode = 'list' | 'add' | 'edit';

// Get initial state from localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem('bluemoon-feecategories-state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return null;
};

export function FeeCategoriesView() {
  const initialState = getInitialState();
  
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(initialState?.viewMode || 'list');
  const [selectedCategory, setSelectedCategory] = useState<FeeCategory | null>(null);
  const [showModal, setShowModal] = useState(initialState?.showModal || false);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(initialState?.selectedCategoryId || null);

  // Save view state to localStorage
  useEffect(() => {
    const state = {
      viewMode,
      selectedCategoryId: selectedCategory?.id || null,
      showModal
    };
    localStorage.setItem('bluemoon-feecategories-state', JSON.stringify(state));
  }, [viewMode, selectedCategory?.id, showModal]);

  // Restore selected category after data loads
  useEffect(() => {
    if (pendingCategoryId && categories.length > 0) {
      const category = categories.find(c => c.id === pendingCategoryId);
      if (category) {
        setSelectedCategory(category);
      }
      setPendingCategoryId(null);
    }
  }, [categories, pendingCategoryId]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await feeCategoriesApi.getAll();
      setCategories(data.map((c: any) => ({
        ...c,
        active: c.isActive,
        description: c.description || ''
      })));
    } catch (error) {
      toast.error('Failed to load fee categories');
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category: FeeCategory) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleEditFromModal = () => {
    setShowModal(false);
    setViewMode('edit');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const handleSave = async (data: Partial<FeeCategory>) => {
    try {
      if (viewMode === 'edit' && selectedCategory) {
        await feeCategoriesApi.update(selectedCategory.id, {
          ...data,
          isActive: data.active
        });
        toast.success('Category updated successfully');
      } else {
        await feeCategoriesApi.create({
          ...data,
          isActive: true
        });
        toast.success('Category created successfully');
      }
      
      await fetchCategories();
      setViewMode('list');
      setSelectedCategory(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await feeCategoriesApi.delete(id);
      toast.success('Category deleted successfully');
      setShowModal(false);
      setSelectedCategory(null);
      await fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedCategory(null);
  };

  // Show form for add or edit mode
  if (viewMode === 'add' || viewMode === 'edit') {
    return (
      <CategoryForm
        category={viewMode === 'edit' ? selectedCategory : null}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Show list view
  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Fee Categories"
        description="Configure apartment fee types and amounts"
        buttonLabel="Add Category"
        onButtonClick={() => setViewMode('add')}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="animate-pulse">
          {/* Category Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-6 h-44">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
                </div>
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-28 mb-3"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Categories List */}
          <CategoryList 
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />

          {/* Detail Modal */}
          <CategoryDetailModal 
            category={selectedCategory}
            onClose={handleCloseModal}
            onEdit={handleEditFromModal}
            onDelete={() => selectedCategory && handleDelete(selectedCategory.id)}
          />
        </>
      )}
    </div>
  );
}
