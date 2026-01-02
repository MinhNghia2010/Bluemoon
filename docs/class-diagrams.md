# Sơ Đồ Lớp - Apartment Fee Management App

## Mục lục
1. [Sơ Đồ Lớp Phân Tích (BCE Pattern)](#1-sơ-đồ-lớp-phân-tích-bce-pattern)
2. [Sơ Đồ Lớp Chi Tiết](#2-sơ-đồ-lớp-chi-tiết)

---

## 1. Sơ Đồ Lớp Phân Tích (BCE Pattern)

### 1.1 Tổng Quan Hệ Thống

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    %% Boundary Classes
    class LoginView {
        <<boundary>>
    }
    class DashboardView {
        <<boundary>>
    }
    class HouseholdsView {
        <<boundary>>
    }
    class FeeCollectionView {
        <<boundary>>
    }
    class ParkingView {
        <<boundary>>
    }
    class UtilitiesView {
        <<boundary>>
    }
    class StatisticsView {
        <<boundary>>
    }
    class SettingsView {
        <<boundary>>
    }
    
    %% Control Classes
    class AuthController {
        <<control>>
    }
    class HouseholdController {
        <<control>>
    }
    class MemberController {
        <<control>>
    }
    class FeeCategoryController {
        <<control>>
    }
    class PaymentController {
        <<control>>
    }
    class ParkingController {
        <<control>>
    }
    class UtilityController {
        <<control>>
    }
    class StatisticsController {
        <<control>>
    }
    class UserController {
        <<control>>
    }
    
    %% Entity Classes
    class User {
        <<entity>>
    }
    class Household {
        <<entity>>
    }
    class HouseholdMember {
        <<entity>>
    }
    class FeeCategory {
        <<entity>>
    }
    class Payment {
        <<entity>>
    }
    class ParkingSlot {
        <<entity>>
    }
    class UtilityBill {
        <<entity>>
    }
    class Setting {
        <<entity>>
    }
    
    %% Boundary -> Control relationships
    LoginView --> AuthController
    HouseholdsView --> HouseholdController
    HouseholdsView --> MemberController
    FeeCollectionView --> PaymentController
    FeeCollectionView --> FeeCategoryController
    ParkingView --> ParkingController
    UtilitiesView --> UtilityController
    StatisticsView --> StatisticsController
    SettingsView --> UserController
    
    %% Control -> Entity relationships
    AuthController --> User
    HouseholdController --> Household
    MemberController --> HouseholdMember
    FeeCategoryController --> FeeCategory
    PaymentController --> Payment
    PaymentController --> Household
    ParkingController --> ParkingSlot
    UtilityController --> UtilityBill
    StatisticsController --> Household
    StatisticsController --> Payment
    StatisticsController --> ParkingSlot
    StatisticsController --> UtilityBill
    UserController --> User
```

### 1.2 Sơ Đồ Lớp Phân Tích - Quản Lý Hộ Gia Đình

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction LR
    
    class HouseholdsView {
        <<boundary>>
    }
    class HouseholdForm {
        <<boundary>>
    }
    class HouseholdDetailModal {
        <<boundary>>
    }
    
    class HouseholdController {
        <<control>>
        +getAllHouseholds() json
        +getHouseholdById() json
        +createHousehold() json
        +updateHousehold() json
        +deleteHousehold() json
    }
    
    class MemberController {
        <<control>>
        +getAllMembers() json
        +getMemberById() json
        +createMember() json
        +updateMember() json
        +deleteMember() json
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
        -area : Float
        -floor : Int
        -phone : String
        -email : String
        -status : String
        -balance : Float
        -moveInDate : Date
    }
    
    class HouseholdMember {
        <<entity>>
        -id : String
        -name : String
        -dateOfBirth : Date
        -cccd : String
        -residenceType : String
        -relationToOwner : String
        -status : String
        -moveInDate : Date
        -moveOutDate : Date
    }
    
    HouseholdsView --> HouseholdController
    HouseholdForm --> HouseholdController
    HouseholdDetailModal --> HouseholdController
    HouseholdDetailModal --> MemberController
    
    HouseholdController --> Household
    MemberController --> HouseholdMember
    
    Household "1" -- "*" HouseholdMember : members
    Household "1" -- "0..1" HouseholdMember : owner
```

### 1.3 Sơ Đồ Lớp Phân Tích - Quản Lý Khoản Thu

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction LR
    
    class FeeCollectionView {
        <<boundary>>
    }
    class PaymentForm {
        <<boundary>>
    }
    class FeeCategoriesView {
        <<boundary>>
    }
    class CategoryForm {
        <<boundary>>
    }
    
    class PaymentController {
        <<control>>
        +getAllPayments() json
        +getPaymentById() json
        +createPayment() json
        +updatePayment() json
        +deletePayment() json
        +generateMonthlyPayments() json
    }
    
    class FeeCategoryController {
        <<control>>
        +getAllCategories() json
        +getCategoryById() json
        +createCategory() json
        +updateCategory() json
        +deleteCategory() json
    }
    
    class FeeCategory {
        <<entity>>
        -id : String
        -name : String
        -amount : Float
        -frequency : String
        -description : String
        -isActive : Boolean
    }
    
    class Payment {
        <<entity>>
        -id : String
        -amount : Float
        -status : String
        -dueDate : Date
        -paymentDate : Date
        -paymentMethod : String
        -notes : String
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
        -balance : Float
    }
    
    FeeCollectionView --> PaymentController
    PaymentForm --> PaymentController
    FeeCategoriesView --> FeeCategoryController
    CategoryForm --> FeeCategoryController
    
    PaymentController --> Payment
    PaymentController --> Household
    FeeCategoryController --> FeeCategory
    
    FeeCategory "1" -- "*" Payment : payments
    Household "1" -- "*" Payment : payments
```

### 1.4 Sơ Đồ Lớp Phân Tích - Quản Lý Đỗ Xe

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction LR
    
    class ParkingView {
        <<boundary>>
    }
    class ParkingSlotForm {
        <<boundary>>
    }
    class ParkingSlotList {
        <<boundary>>
    }
    
    class ParkingController {
        <<control>>
        +getAllParkingSlots() json
        +getParkingSlotById() json
        +createParkingSlot() json
        +updateParkingSlot() json
        +deleteParkingSlot() json
    }
    
    class ParkingSlot {
        <<entity>>
        -id : String
        -slotNumber : String
        -type : String
        -licensePlate : String
        -status : String
        -monthlyFee : Float
    }
    
    class HouseholdMember {
        <<entity>>
        -id : String
        -name : String
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
    }
    
    ParkingView --> ParkingController
    ParkingSlotForm --> ParkingController
    ParkingSlotList --> ParkingController
    
    ParkingController --> ParkingSlot
    
    Household "1" -- "*" ParkingSlot : parkingSlots
    HouseholdMember "1" -- "*" ParkingSlot : ownedVehicles
```

### 1.5 Sơ Đồ Lớp Phân Tích - Quản Lý Tiện Ích

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction LR
    
    class UtilitiesView {
        <<boundary>>
    }
    class UtilityBillForm {
        <<boundary>>
    }
    class UtilityBillList {
        <<boundary>>
    }
    
    class UtilityController {
        <<control>>
        +getAllUtilityBills() json
        +getUtilityBillById() json
        +createUtilityBill() json
        +updateUtilityBill() json
        +deleteUtilityBill() json
    }
    
    class UtilityBill {
        <<entity>>
        -id : String
        -month : String
        -periodStart : Date
        -periodEnd : Date
        -dueDate : Date
        -electricityUsage : Float
        -electricityRate : Float
        -electricityCost : Float
        -waterUsage : Float
        -waterRate : Float
        -waterCost : Float
        -internetCost : Float
        -totalAmount : Float
        -status : String
        -paidDate : Date
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
    }
    
    UtilitiesView --> UtilityController
    UtilityBillForm --> UtilityController
    UtilityBillList --> UtilityController
    
    UtilityController --> UtilityBill
    
    Household "1" -- "*" UtilityBill : utilityBills
```

### 1.6 Sơ Đồ Lớp Phân Tích - Xác Thực & Quản Lý Người Dùng

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction LR
    
    class LoginView {
        <<boundary>>
    }
    class SettingsView {
        <<boundary>>
    }
    class UserManagement {
        <<boundary>>
    }
    class ChangePasswordForm {
        <<boundary>>
    }
    
    class AuthController {
        <<control>>
        +login() json
        +register() json
        +logout() void
    }
    
    class UserController {
        <<control>>
        +getAllUsers() json
        +getUserById() json
        +createUser() json
        +updateUser() json
        +deleteUser() json
        +changePassword() json
    }
    
    class AuthService {
        <<control>>
        +hashPassword() String
        +verifyPassword() Boolean
        +generateToken() String
        +verifyToken() Object
    }
    
    class User {
        <<entity>>
        -id : String
        -username : String
        -password : String
        -name : String
        -email : String
        -role : String
        -createdAt : Date
    }
    
    LoginView --> AuthController
    SettingsView --> UserController
    UserManagement --> UserController
    ChangePasswordForm --> UserController
    
    AuthController --> AuthService
    UserController --> AuthService
    AuthController --> User
    UserController --> User
```

---

## 2. Sơ Đồ Lớp Chi Tiết

### 2.1 Sơ Đồ Lớp Chi Tiết - Tổng Quan Entity

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    class User {
        -id : String
        -username : String
        -password : String
        -name : String
        -email : String
        -role : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class Household {
        -id : String
        -unit : String
        -area : Float
        -floor : Int
        -moveInDate : DateTime
        -phone : String
        -email : String
        -status : String
        -balance : Float
        -ownerId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class HouseholdMember {
        -id : String
        -name : String
        -dateOfBirth : DateTime
        -cccd : String
        -profilePic : String
        -residenceType : String
        -relationToOwner : String
        -status : String
        -moveInDate : DateTime
        -moveOutDate : DateTime
        -note : String
        -householdId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class FeeCategory {
        -id : String
        -name : String
        -amount : Float
        -frequency : String
        -description : String
        -isActive : Boolean
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class Payment {
        -id : String
        -amount : Float
        -status : String
        -dueDate : DateTime
        -paymentDate : DateTime
        -paymentMethod : String
        -notes : String
        -householdId : String
        -feeCategoryId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class ParkingSlot {
        -id : String
        -slotNumber : String
        -type : String
        -licensePlate : String
        -status : String
        -monthlyFee : Float
        -householdId : String
        -memberId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class UtilityBill {
        -id : String
        -periodStart : DateTime
        -periodEnd : DateTime
        -month : String
        -dueDate : DateTime
        -electricityUsage : Float
        -electricityRate : Float
        -electricityCost : Float
        -waterUsage : Float
        -waterRate : Float
        -waterCost : Float
        -internetCost : Float
        -totalAmount : Float
        -status : String
        -paidDate : DateTime
        -householdId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class TemporaryAbsence {
        -id : String
        -registrationNumber : String
        -destination : String
        -startDate : DateTime
        -endDate : DateTime
        -reason : String
        -status : String
        -memberId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class TemporaryResidence {
        -id : String
        -registrationNumber : String
        -registrantPhone : String
        -currentAddress : String
        -startDate : DateTime
        -endDate : DateTime
        -reason : String
        -status : String
        -memberId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class Setting {
        -id : String
        -key : String
        -value : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    %% Relationships
    Household "1" -- "0..1" HouseholdMember : owner
    Household "1" -- "*" HouseholdMember : members
    Household "1" -- "*" Payment : payments
    Household "1" -- "*" ParkingSlot : parkingSlots
    Household "1" -- "*" UtilityBill : utilityBills
    
    FeeCategory "1" -- "*" Payment : payments
    
    HouseholdMember "1" -- "*" ParkingSlot : ownedVehicles
    HouseholdMember "1" -- "*" TemporaryAbsence : temporaryAbsences
    HouseholdMember "1" -- "*" TemporaryResidence : temporaryResidences
```

### 2.2 Sơ Đồ Lớp Chi Tiết - Quản Lý Khoản Thu (Full Stack)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    %% Boundary Layer
    class FeeCollectionView {
        <<boundary>>
        -payments : Payment[]
        -households : Household[]
        -stats : Object
        +render() void
        +handleMarkAsPaid() void
        +handleGenerateFees() void
    }
    
    class PaymentForm {
        <<boundary>>
        -formData : Object
        -categories : FeeCategory[]
        -households : Household[]
        +onSubmit() void
        +validateForm() boolean
    }
    
    %% Control Layer
    class PaymentController {
        <<control>>
        +GET /api/payments
        +GET /api/payments/:id
        +POST /api/payments
        +PUT /api/payments/:id
        +DELETE /api/payments/:id
        +PUT /api/payments (generate)
    }
    
    class FeeCategoryController {
        <<control>>
        +GET /api/fee-categories
        +GET /api/fee-categories/:id
        +POST /api/fee-categories
        +PUT /api/fee-categories/:id
        +DELETE /api/fee-categories/:id
    }
    
    %% Entity Layer
    class FeeCategory {
        <<entity>>
        -id : String
        -name : String
        -amount : Float
        -frequency : Enum~monthly|quarterly|annual|one-time~
        -description : String
        -isActive : Boolean
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class Payment {
        <<entity>>
        -id : String
        -amount : Float
        -status : Enum~pending|collected|overdue~
        -dueDate : DateTime
        -paymentDate : DateTime
        -paymentMethod : Enum~cash|bank_transfer|card~
        -notes : String
        -householdId : String
        -feeCategoryId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
        -balance : Float
        -status : Enum~active|inactive~
    }
    
    %% Relationships
    FeeCollectionView --> PaymentController
    PaymentForm --> PaymentController
    PaymentForm --> FeeCategoryController
    
    PaymentController --> Payment
    PaymentController --> Household
    FeeCategoryController --> FeeCategory
    
    FeeCategory "1" -- "*" Payment
    Household "1" -- "*" Payment
```

### 2.3 Sơ Đồ Lớp Chi Tiết - Quản Lý Hộ Gia Đình (Full Stack)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    %% Boundary Layer
    class HouseholdsView {
        <<boundary>>
        -households : Household[]
        -selectedHousehold : Household
        -searchTerm : String
        -statusFilter : String
        +render() void
        +handleSearch() void
        +handleFilter() void
        +handleDelete() void
    }
    
    class HouseholdForm {
        <<boundary>>
        -formData : Object
        -members : HouseholdMember[]
        -isEditMode : Boolean
        +onSubmit() void
        +validateForm() boolean
    }
    
    class HouseholdDetailModal {
        <<boundary>>
        -household : Household
        -members : HouseholdMember[]
        -payments : Payment[]
        -parkingSlots : ParkingSlot[]
        -utilityBills : UtilityBill[]
        +render() void
        +switchTab() void
    }
    
    %% Control Layer
    class HouseholdController {
        <<control>>
        +GET /api/households
        +GET /api/households/:id
        +POST /api/households
        +PUT /api/households/:id
        +DELETE /api/households/:id
        -validateRequiredFields() void
        -checkUnpaidBills() Object
        -cascadeDeleteOnOwnerRemoval() void
    }
    
    class MemberController {
        <<control>>
        +GET /api/members
        +GET /api/members/:id
        +POST /api/members
        +PUT /api/members/:id
        +DELETE /api/members/:id
        -validateCCCDUnique() boolean
        -checkOwnerExists() boolean
    }
    
    %% Entity Layer
    class Household {
        <<entity>>
        -id : String
        -unit : String
        -area : Float
        -floor : Int
        -moveInDate : DateTime
        -phone : String
        -email : String
        -status : Enum~active|inactive~
        -balance : Float
        -ownerId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class HouseholdMember {
        <<entity>>
        -id : String
        -name : String
        -dateOfBirth : DateTime
        -cccd : String
        -profilePic : String
        -residenceType : Enum~permanent|temporary~
        -relationToOwner : String
        -status : Enum~living|moved_out|deceased~
        -moveInDate : DateTime
        -moveOutDate : DateTime
        -note : String
        -householdId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    %% Relationships
    HouseholdsView --> HouseholdController
    HouseholdForm --> HouseholdController
    HouseholdDetailModal --> HouseholdController
    HouseholdDetailModal --> MemberController
    
    HouseholdController --> Household
    MemberController --> HouseholdMember
    
    Household "1" -- "0..1" HouseholdMember : owner
    Household "1" -- "*" HouseholdMember : members
```

### 2.4 Sơ Đồ Lớp Chi Tiết - Quản Lý Đỗ Xe (Full Stack)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    %% Boundary Layer
    class ParkingView {
        <<boundary>>
        -parkingSlots : ParkingSlot[]
        -members : HouseholdMember[]
        -stats : Object
        -typeFilter : String
        -statusFilter : String
        +render() void
        +handleFilter() void
        +handleSubmit() void
        +handleDelete() void
    }
    
    class ParkingSlotForm {
        <<boundary>>
        -formData : Object
        -members : HouseholdMember[]
        -isEditMode : Boolean
        +onSubmit() void
        +validateForm() boolean
        +handleClearOwner() void
        +autoCalculateFee() void
    }
    
    %% Control Layer
    class ParkingController {
        <<control>>
        +GET /api/parking
        +GET /api/parking/:id
        +POST /api/parking
        +PUT /api/parking/:id
        +DELETE /api/parking/:id
        -validateSlotNumber() boolean
        -calculateFeeAndStatus() Object
    }
    
    %% Entity Layer
    class ParkingSlot {
        <<entity>>
        -id : String
        -slotNumber : String
        -type : Enum~car|motorcycle|bicycle~
        -licensePlate : String
        -status : Enum~available|occupied|reserved~
        -monthlyFee : Float
        -householdId : String
        -memberId : String
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    class HouseholdMember {
        <<entity>>
        -id : String
        -name : String
        -householdId : String
    }
    
    class Household {
        <<entity>>
        -id : String
        -unit : String
        -phone : String
    }
    
    %% Relationships
    ParkingView --> ParkingController
    ParkingSlotForm --> ParkingController
    
    ParkingController --> ParkingSlot
    
    Household "1" -- "*" ParkingSlot
    HouseholdMember "1" -- "*" ParkingSlot : ownedVehicles
```

### 2.5 Sơ Đồ Lớp Chi Tiết - Xác Thực (Full Stack)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffcc', 'primaryBorderColor': '#333'}}}%%
classDiagram
    direction TB
    
    %% Boundary Layer
    class LoginView {
        <<boundary>>
        -username : String
        -password : String
        -error : String
        -isLoading : Boolean
        +handleLogin() void
        +validateForm() boolean
    }
    
    class SettingsView {
        <<boundary>>
        -user : User
        -users : User[]
        +render() void
        +switchTab() void
    }
    
    class UserManagement {
        <<boundary>>
        -users : User[]
        -selectedUser : User
        +handleCreate() void
        +handleUpdate() void
        +handleDelete() void
    }
    
    class ChangePasswordForm {
        <<boundary>>
        -currentPassword : String
        -newPassword : String
        -confirmPassword : String
        +handleSubmit() void
        +validatePasswords() boolean
    }
    
    %% Control Layer
    class AuthController {
        <<control>>
        +POST /api/auth/login
        +POST /api/auth/register
        -validateCredentials() boolean
    }
    
    class UserController {
        <<control>>
        +GET /api/users
        +POST /api/users
        +PUT /api/users/:id
        +DELETE /api/users/:id
        +POST /api/users/change-password
        -validatePasswordLength() boolean
    }
    
    class AuthService {
        <<control>>
        +hashPassword(password) String
        +verifyPassword(plain, hashed) Boolean
        +generateToken(payload) String
        +verifyToken(token) Object
    }
    
    %% Entity Layer
    class User {
        <<entity>>
        -id : String
        -username : String
        -password : String
        -name : String
        -email : String
        -role : Enum~admin|manager|staff~
        -createdAt : DateTime
        -updatedAt : DateTime
    }
    
    %% Relationships
    LoginView --> AuthController
    SettingsView --> UserController
    UserManagement --> UserController
    ChangePasswordForm --> UserController
    
    AuthController --> AuthService
    UserController --> AuthService
    AuthController --> User
    UserController --> User
```

---

## 3. Chú Thích Ký Hiệu

| Ký hiệu | Mô tả |
|---------|-------|
| `<<boundary>>` | Lớp giao diện người dùng (Views, Forms, Components) |
| `<<control>>` | Lớp điều khiển (API Routes, Controllers, Services) |
| `<<entity>>` | Lớp thực thể dữ liệu (Database Models) |
| `--` | Quan hệ liên kết (Association) |
| `-->` | Quan hệ phụ thuộc (Dependency) |
| `"1" -- "*"` | Quan hệ một-nhiều |
| `"0..1"` | Quan hệ tùy chọn (0 hoặc 1) |

---

## 4. Ánh Xạ Code Thực Tế

| Lớp Phân Tích | File/Folder Thực Tế |
|---------------|---------------------|
| **Boundary Classes** | `components/` folder |
| HouseholdsView | `components/HouseholdsView.tsx` |
| FeeCollectionView | `components/FeeCollectionView.tsx` |
| ParkingView | `components/ParkingView.tsx` |
| UtilitiesView | `components/UtilitiesView.tsx` |
| LoginView | `components/Login.tsx` |
| **Control Classes** | `app/api/` folder |
| HouseholdController | `app/api/households/route.ts` |
| PaymentController | `app/api/payments/route.ts` |
| ParkingController | `app/api/parking/route.ts` |
| AuthController | `app/api/auth/login/route.ts` |
| **Entity Classes** | `prisma/schema.prisma` |
| Household | Prisma model Household |
| Payment | Prisma model Payment |
| ParkingSlot | Prisma model ParkingSlot |
