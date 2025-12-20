'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarIcon, Check, X } from 'lucide-react'
import { format, parse, isValid } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerInputProps {
  value: Date | string | undefined | null
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: (date: Date) => boolean
  error?: boolean
  className?: string
  displayFormat?: string
  showValidation?: boolean
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  disabled,
  error = false,
  className = '',
  displayFormat = 'dd/MM/yyyy',
  showValidation = true
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('__/__/____')
  const [isValidDate, setIsValidDate] = useState<boolean | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Convert value to Date object
  const dateValue = value 
    ? (typeof value === 'string' ? new Date(value) : value)
    : undefined

  // Update input value when date changes externally
  useEffect(() => {
    if (dateValue && isValid(dateValue)) {
      setInputValue(format(dateValue, displayFormat))
      setIsValidDate(true)
    } else {
      setInputValue('__/__/____')
      setIsValidDate(null)
    }
  }, [dateValue, displayFormat])

  // Check if current input represents a valid date
  const checkDateValidity = (formatted: string): boolean => {
    const digits = formatted.replace(/[^0-9]/g, '')
    if (digits.length !== 8) return false
    
    try {
      const dateStr = formatted.replace(/_/g, '')
      const parsed = parse(dateStr, 'dd/MM/yyyy', new Date())
      
      // Check if it's a valid date
      if (!isValid(parsed)) return false
      
      // Check year range
      if (parsed.getFullYear() < 1900 || parsed.getFullYear() > 2100) return false
      
      // Check if day/month are within valid ranges
      const day = parseInt(digits.slice(0, 2))
      const month = parseInt(digits.slice(2, 4))
      
      if (month < 1 || month > 12) return false
      if (day < 1 || day > 31) return false
      
      // Check if the parsed date matches the input (handles invalid dates like 31/02)
      const parsedDay = parsed.getDate()
      const parsedMonth = parsed.getMonth() + 1
      if (parsedDay !== day || parsedMonth !== month) return false
      
      // Check if date is disabled
      if (disabled && disabled(parsed)) return false
      
      return true
    } catch {
      return false
    }
  }

  // Format input with fixed slashes (dd/mm/yyyy mask)
  const formatWithMask = (value: string, cursorPos: number): { formatted: string; newCursor: number } => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 8)
    
    let formatted = ''
    let newCursor = cursorPos
    
    for (let i = 0; i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/'
      }
      formatted += digits[i] || '_'
    }
    
    // Calculate new cursor position
    const digitsBeforeCursor = value.slice(0, cursorPos).replace(/\D/g, '').length
    if (digitsBeforeCursor <= 2) {
      newCursor = digitsBeforeCursor
    } else if (digitsBeforeCursor <= 4) {
      newCursor = digitsBeforeCursor + 1 // Account for first slash
    } else {
      newCursor = digitsBeforeCursor + 2 // Account for both slashes
    }
    
    return { formatted, newCursor }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPos = e.target.selectionStart || 0
    const { formatted, newCursor } = formatWithMask(e.target.value, cursorPos)
    
    setInputValue(formatted)
    
    // Restore cursor position after React re-renders
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursor, newCursor)
      }
    }, 0)

    // Check validity and update state
    const digits = formatted.replace(/[^0-9]/g, '')
    if (digits.length === 8) {
      const valid = checkDateValidity(formatted)
      setIsValidDate(valid)
      
      if (valid) {
        const parsed = parse(formatted.replace(/_/g, ''), 'dd/MM/yyyy', new Date())
        onChange(parsed)
      } else {
        onChange(undefined)
      }
    } else if (digits.length > 0) {
      setIsValidDate(null) // Still typing
      onChange(undefined)
    } else {
      setIsValidDate(null)
      onChange(undefined)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const cursorPos = input.selectionStart || 0
    
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      // Find the previous digit position to delete
      let targetPos = cursorPos - 1
      
      // Skip over slashes
      while (targetPos >= 0 && (inputValue[targetPos] === '/' || inputValue[targetPos] === '_')) {
        if (inputValue[targetPos] === '/') {
          targetPos--
        } else {
          break
        }
      }
      
      if (targetPos >= 0) {
        // Replace the digit at targetPos with underscore
        const digits = inputValue.replace(/\D/g, '')
        let digitIndex = 0
        let actualDigitIndex = -1
        
        for (let i = 0; i < inputValue.length && i <= targetPos; i++) {
          if (inputValue[i] !== '/' && inputValue[i] !== '_') {
            actualDigitIndex = digitIndex
            digitIndex++
          } else if (inputValue[i] === '_') {
            digitIndex++
          }
        }
        
        if (actualDigitIndex >= 0) {
          const newDigits = digits.slice(0, actualDigitIndex) + digits.slice(actualDigitIndex + 1)
          const { formatted, newCursor } = formatWithMask(newDigits, targetPos)
          setInputValue(formatted)
          setIsValidDate(null)
          onChange(undefined)
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.setSelectionRange(newCursor, newCursor)
            }
          }, 0)
        }
      }
    } else if (e.key === 'Delete') {
      e.preventDefault()
      
      // Delete character at cursor position
      if (cursorPos < inputValue.length) {
        let targetPos = cursorPos
        
        // Skip over slashes
        while (targetPos < inputValue.length && inputValue[targetPos] === '/') {
          targetPos++
        }
        
        // Only delete if there's a digit at target position
        if (targetPos < inputValue.length && /\d/.test(inputValue[targetPos])) {
          const digits = inputValue.replace(/[^0-9]/g, '')
          let digitCount = 0
          let actualDigitIndex = -1
          
          for (let i = 0; i < inputValue.length; i++) {
            if (/\d/.test(inputValue[i])) {
              if (i === targetPos) {
                actualDigitIndex = digitCount
              }
              digitCount++
            }
          }
          
          if (actualDigitIndex >= 0 && actualDigitIndex < digits.length) {
            const newDigits = digits.slice(0, actualDigitIndex) + digits.slice(actualDigitIndex + 1)
            const { formatted } = formatWithMask(newDigits, cursorPos)
            setInputValue(formatted)
            setIsValidDate(null)
            onChange(undefined)
            
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.setSelectionRange(cursorPos, cursorPos)
              }
            }, 0)
          }
        }
      }
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date)
      setInputValue(format(date, displayFormat))
      setIsValidDate(true)
    }
    setOpen(false)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all on focus for easy replacement
    e.target.select()
  }

  // Determine border color based on validation
  const getBorderClass = () => {
    if (error) return 'border-red-500'
    if (showValidation && isValidDate === true) return 'border-green-500'
    if (showValidation && isValidDate === false) return 'border-red-500'
    return ''
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`input-default text-sm pr-16 font-mono ${getBorderClass()}`}
      />
      {/* Validation indicator */}
      {showValidation && isValidDate !== null && (
        <div className={`absolute right-10 top-1/2 -translate-y-1/2 ${isValidDate ? 'text-green-500' : 'text-red-500'}`}>
          {isValidDate ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-primary transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-bg-white border-border-light" align="end">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleCalendarSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
