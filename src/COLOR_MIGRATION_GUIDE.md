# Color Migration Guide - BlueMoon v2.0

## ✅ Đã Hoàn Thành (Completed)

### CSS Variables trong `/styles/globals.css`
Đã thêm tất cả CSS variables và utility classes:

```css
/* Brand Colors */
--brand-primary: #5030e5;
--brand-primary-hover: #4024c4;
--brand-primary-light: rgba(80, 48, 229, 0.08);
--brand-primary-medium: rgba(80, 48, 229, 0.2);

/* Category/Chart Colors */
--color-maintenance: #5030e5;
--color-parking: #7AC555;
--color-utilities: #d58d49;
--color-parking-light: rgba(122, 197, 85, 0.2);
--color-utilities-light: rgba(213, 141, 73, 0.2);
```

### Utility Classes Mới
```css
.bg-brand-primary          → background: #5030e5
.bg-brand-primary-hover    → background: #4024c4  
.bg-brand-primary-light    → background: rgba(80, 48, 229, 0.08)
.bg-brand-primary-medium   → background: rgba(80, 48, 229, 0.2)
.text-brand-primary        → color: #5030e5
.border-brand-primary      → border-color: #5030e5
```

### Shared Components Đã Update
- ✅ `/components/shared/FilterButtons.tsx`
- ✅ `/components/Sidebar.tsx`  
- ✅ `/components/Login.tsx`
- ✅ `/components/fee-collection/PaymentFilters.tsx`

---

## 📋 Hướng Dẫn Replace Colors Còn Lại

### Pattern Cần Thay Thế

#### 1. Background Colors
```tsx
// ❌ Old (hardcoded)
className="bg-[#5030e5]"
className="bg-[#4024c4]"  
className="bg-[rgba(80,48,229,0.08)]"
className="bg-[rgba(80,48,229,0.2)]"

// ✅ New (CSS variables)
className="bg-brand-primary"
className="bg-brand-primary-hover"
className="bg-brand-primary-light"
className="bg-brand-primary-medium"
```

#### 2. Text Colors
```tsx
// ❌ Old
className="text-[#5030e5]"
className="text-[#7AC555]"
className="text-[#d58d49]"

// ✅ New
className="text-brand-primary"
className="text-color-parking"
className="text-color-utilities"
```

#### 3. Border & Focus States
```tsx
// ❌ Old
className="border-[#5030e5]"
className="focus:border-[#5030e5]"
className="focus:ring-[#5030e5]"

// ✅ New  
className="border-brand-primary"
className="focus:border-brand-primary"
className="focus:ring-brand-primary"
```

#### 4. Hover States
```tsx
// ❌ Old
className="hover:bg-[#4024c4]"

// ✅ New
className="hover:bg-brand-primary-hover"
```

#### 5. Buttons (sử dụng btn-primary utility class)
```tsx
// ❌ Old
className="bg-[#5030e5] text-white px-[20px] py-[12px] rounded-[6px] hover:bg-[#4024c4]"

// ✅ New (Option 1 - utility class)
className="btn-primary"

// ✅ New (Option 2 - Tailwind classes)
className="bg-brand-primary text-white px-[20px] py-[12px] rounded-[6px] hover:bg-brand-primary-hover"
```

---

## 🔍 Files Cần Update (Remaining)

### Priority 1 - Core Components
- `/components/households/HouseholdCard.tsx` (line 32)
- `/components/households/HouseholdDetailModal.tsx` (line 87)
- `/components/households/HouseholdFilters.tsx` (line 24)
- `/components/households/AddHouseholdForm.tsx` (lines 41, 57, 73, 89, 105, 120)

### Priority 2 - Fee Categories
- `/components/fee-categories/CategoryDetailModal.tsx` (lines 23, 80)
- `/components/fee-categories/CategoryList.tsx` (line 18)

### Priority 3 - Settings
- `/components/settings/ApartmentInfoForm.tsx` (lines 9-11, 37, 51, 63, 75, 87)
- `/components/settings/ChangePasswordForm.tsx` (lines 59, 76, 93, 112)
- `/components/settings/SystemPreferences.tsx` (lines 13, 24, 35, 46)

### Priority 4 - Other Views
- `/components/FeeCollectionView.tsx` (line 103)
- `/components/StatisticsView.tsx` (line 77)
- `/components/shared/icons.tsx` (lines 37-39)

---

## 🎨 Category/Frequency Colors

### Frequency Badge Colors
```tsx
// ❌ Old
case 'monthly': return { bg: 'bg-[rgba(80,48,229,0.2)]', text: 'text-[#5030e5]' };
case 'quarterly': return { bg: 'bg-[rgba(223,168,116,0.2)]', text: 'text-[#d58d49]' };
case 'annual': return { bg: 'bg-[rgba(122,197,85,0.2)]', text: 'text-[#7AC555]' };

// ✅ New
case 'monthly': return { bg: 'bg-brand-primary-medium', text: 'text-brand-primary' };
case 'quarterly': return { bg: 'bg-color-utilities-light', text: 'text-color-utilities' };
case 'annual': return { bg: 'bg-color-parking-light', text: 'text-color-parking' };
```

---

## 🛠️ Quick Find & Replace

Sử dụng search trong editor để tìm và replace:

### Search Patterns:
1. `bg-\[#5030e5\]` → `bg-brand-primary`
2. `text-\[#5030e5\]` → `text-brand-primary`
3. `hover:bg-\[#4024c4\]` → `hover:bg-brand-primary-hover`
4. `focus:border-\[#5030e5\]` → `focus:border-brand-primary`
5. `focus:ring-\[#5030e5\]` → `focus:ring-brand-primary`
6. `bg-\[rgba\(80,48,229,0\.08\)\]` → `bg-brand-primary-light`
7. `bg-\[rgba\(80,48,229,0\.2\)\]` → `bg-brand-primary-medium`

---

## ✨ Benefits

1. **Dễ maintain**: Chỉ cần thay đổi 1 chỗ trong globals.css
2. **Dark mode support**: Tất cả colors tự động support dark mode
3. **Type safety**: Tailwind autocomplete sẽ gợi ý các classes
4. **Consistent**: Tất cả components dùng chung color system
5. **Performance**: Browser cache CSS variables tốt hơn JIT colors

---

## 📝 Notes

- Tất cả CSS variables đã được định nghĩa trong `:root` và `.dark`
- Dark mode tự động apply với localStorage key: `'bluemoon-theme'`
- Không cần thay đổi SVG icons - đã dùng `var(--brand-primary)`
- Các màu secondary (#787486) đã có trong `--text-secondary`

