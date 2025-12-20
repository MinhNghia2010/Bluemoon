'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'

interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

interface ValidatedInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'number' | 'password'
  className?: string
  error?: string
  rules?: ValidationRule[]
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternMessage?: string
  showValidation?: boolean
  validateOnChange?: boolean
  name?: string
}

// Pre-defined validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{9,15}$/,
  cccd: /^[0-9]{12}$/,
  number: /^[0-9]+$/,
  positiveNumber: /^[0-9]*\.?[0-9]+$/,
}

export function ValidatedInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  error,
  rules = [],
  required = false,
  minLength,
  maxLength,
  pattern,
  patternMessage,
  showValidation = true,
  validateOnChange = true,
  name,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationMessage, setValidationMessage] = useState('')

  const validate = (val: string): { valid: boolean; message: string } => {
    // Required check
    if (required && !val.trim()) {
      return { valid: false, message: 'This field is required' }
    }

    // If empty and not required, it's valid
    if (!val.trim() && !required) {
      return { valid: true, message: '' }
    }

    // Min length check
    if (minLength && val.length < minLength) {
      return { valid: false, message: `Minimum ${minLength} characters required` }
    }

    // Max length check
    if (maxLength && val.length > maxLength) {
      return { valid: false, message: `Maximum ${maxLength} characters allowed` }
    }

    // Pattern check
    if (pattern && !pattern.test(val)) {
      return { valid: false, message: patternMessage || 'Invalid format' }
    }

    // Custom rules
    for (const rule of rules) {
      if (!rule.test(val)) {
        return { valid: false, message: rule.message }
      }
    }

    return { valid: true, message: '' }
  }

  useEffect(() => {
    if (touched && validateOnChange) {
      const result = validate(value)
      setIsValid(result.valid)
      setValidationMessage(result.message)
    }
  }, [value, touched])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = () => {
    setTouched(true)
    const result = validate(value)
    setIsValid(result.valid)
    setValidationMessage(result.message)
  }

  // Determine border color
  const getBorderClass = () => {
    if (error) return 'border-red-500'
    if (showValidation && touched && isValid === true) return 'border-green-500'
    if (showValidation && touched && isValid === false) return 'border-red-500'
    return ''
  }

  const showIcon = showValidation && touched && isValid !== null && value.length > 0

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`input-default text-sm ${showIcon ? 'pr-10' : ''} ${getBorderClass()}`}
      />
      {/* Validation indicator */}
      {showIcon && (
        <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${isValid ? 'text-green-500' : 'text-red-500'}`}>
          {isValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      )}
      {/* Error message */}
      {touched && !isValid && validationMessage && (
        <p className="mt-1 text-sm text-red-500">{validationMessage}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
