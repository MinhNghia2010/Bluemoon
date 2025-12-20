// API client for frontend

const API_BASE = '/api'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  token?: string
}

async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiCall<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { username, password }
    }),

  register: (data: { username: string; password: string; name: string; email: string }) =>
    apiCall<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: data
    }),

  me: (token: string) =>
    apiCall<any>('/auth/me', { token })
}

// Households API
export const householdsApi = {
  getAll: (params?: { status?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return apiCall<any[]>(`/households${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    apiCall<any>(`/households/${id}`),

  create: (data: any) =>
    apiCall<any>('/households', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/households/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/households/${id}`, { method: 'DELETE' })
}

// Fee Categories API
export const feeCategoriesApi = {
  getAll: () =>
    apiCall<any[]>('/fee-categories'),

  getById: (id: string) =>
    apiCall<any>(`/fee-categories/${id}`),

  create: (data: any) =>
    apiCall<any>('/fee-categories', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/fee-categories/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/fee-categories/${id}`, { method: 'DELETE' })
}

// Payments API
export const paymentsApi = {
  getAll: (params?: { status?: string; householdId?: string; categoryId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.householdId) searchParams.set('householdId', params.householdId)
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
    const query = searchParams.toString()
    return apiCall<any[]>(`/payments${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    apiCall<any>(`/payments/${id}`),

  create: (data: any) =>
    apiCall<any>('/payments', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/payments/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/payments/${id}`, { method: 'DELETE' }),

  generateMonthly: (data: { feeCategoryId: string; month?: number; year?: number }) =>
    apiCall<any>('/payments', { method: 'PUT', body: data })
}

// Parking API
export const parkingApi = {
  getAll: (params?: { status?: string; type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.type) searchParams.set('type', params.type)
    const query = searchParams.toString()
    return apiCall<any[]>(`/parking${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    apiCall<any>(`/parking/${id}`),

  create: (data: any) =>
    apiCall<any>('/parking', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/parking/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/parking/${id}`, { method: 'DELETE' })
}

// Utilities API
export const utilitiesApi = {
  getAll: (params?: { status?: string; type?: string; householdId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.householdId) searchParams.set('householdId', params.householdId)
    const query = searchParams.toString()
    return apiCall<any[]>(`/utilities${query ? `?${query}` : ''}`)
  },

  getById: (id: string) =>
    apiCall<any>(`/utilities/${id}`),

  create: (data: any) =>
    apiCall<any>('/utilities', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/utilities/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/utilities/${id}`, { method: 'DELETE' })
}

// Statistics API
export const statisticsApi = {
  get: () =>
    apiCall<any>('/statistics')
}

// Settings API
export const settingsApi = {
  get: () =>
    apiCall<Record<string, string>>('/settings'),

  update: (data: Record<string, string>) =>
    apiCall<void>('/settings', { method: 'PUT', body: data })
}

// Users API
export const usersApi = {
  getAll: () =>
    apiCall<any[]>('/users'),

  getById: (id: string) =>
    apiCall<any>(`/users/${id}`),

  create: (data: { username: string; password: string; name: string; email: string; role?: string }) =>
    apiCall<any>('/users', { method: 'POST', body: data }),

  update: (id: string, data: any) =>
    apiCall<any>(`/users/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) =>
    apiCall<void>(`/users/${id}`, { method: 'DELETE' }),

  changePassword: (data: { userId: string; currentPassword: string; newPassword: string }) =>
    apiCall<{ message: string }>('/users/change-password', { method: 'POST', body: data })
}

