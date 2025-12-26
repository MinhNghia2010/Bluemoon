'use client'

import { useState, useEffect } from 'react';
import { PageHeader } from './shared/PageHeader';
import { CategoryList } from './fee-categories/CategoryList';
import { CategoryForm } from './fee-categories/CategoryForm';
import { CategoryDetailModal } from './fee-categories/CategoryDetailModal';
import { feeCategoriesApi } from '@/lib/api';
import { toast } from 'sonner';

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
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
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
