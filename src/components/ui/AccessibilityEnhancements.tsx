/**
 * Accessibility Enhancements for Wine Pokédx
 * WCAG 2.1 AA compliant components and utilities
 */

import React, { 
  ReactNode, 
  KeyboardEvent, 
  useRef, 
  useEffect, 
  useState,
  createContext,
  useContext
} from 'react'
import { motion } from 'framer-motion'

// Accessibility context for app-wide settings
interface AccessibilityContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'extra-large'
  setReducedMotion: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal')

  useEffect(() => {
    // Detect user preferences
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    setReducedMotion(hasReducedMotion)
    setHighContrast(hasHighContrast)

    // Apply CSS classes based on preferences
    if (hasReducedMotion) {
      document.documentElement.classList.add('reduced-motion')
    }
    if (hasHighContrast) {
      document.documentElement.classList.add('high-contrast')
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion)
    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-extra-large')
    document.documentElement.classList.add(`font-${fontSize}`)
  }, [reducedMotion, highContrast, fontSize])

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        highContrast,
        fontSize,
        setReducedMotion,
        setHighContrast,
        setFontSize
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

// Skip Link Component
export const SkipLink = () => (
  <a
    href="#main-content"
    className="skip-link absolute -top-10 left-4 bg-blue-600 text-white px-4 py-2 rounded 
               focus:top-4 z-50 font-medium transition-all duration-200
               focus:outline-none focus:ring-2 focus:ring-blue-400"
    tabIndex={0}
  >
    Skip to main content
  </a>
)

// Enhanced focus management
export const FocusManager = ({ children }: { children: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        const firstFocusable = focusableElements[0] as HTMLElement
        const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown as any)
    return () => document.removeEventListener('keydown', handleKeyDown as any)
  }, [])

  return (
    <div ref={containerRef} className="focus-within:outline-none">
      {children}
    </div>
  )
}

// Screen reader announcements
export const ScreenReaderAnnouncement = ({ 
  message, 
  priority = 'polite',
  clear = true 
}: { 
  message: string
  priority?: 'polite' | 'assertive'
  clear?: boolean 
}) => {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    setAnnouncement(message)
    
    if (clear) {
      const timer = setTimeout(() => setAnnouncement(''), 1000)
      return () => clearTimeout(timer)
    }
  }, [message, clear])

  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role={priority === 'assertive' ? 'alert' : 'status'}
    >
      {announcement}
    </div>
  )
}

// Accessible button with enhanced keyboard support
interface AccessibleButtonProps {
  children: ReactNode
  onClick: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLButtonElement>) => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
}

export const AccessibleButton = ({
  children,
  onClick,
  onKeyDown,
  disabled = false,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescribedBy,
  className = ''
}: AccessibleButtonProps) => {
  const { reducedMotion } = useAccessibility()

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onClick()
    }
    onKeyDown?.(e)
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role="button"
      tabIndex={0}
    >
      {!reducedMotion && (
        <motion.span
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-block"
        >
          {children}
        </motion.span>
      )}
      {reducedMotion && children}
    </button>
  )
}

// Accessible modal dialog
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  initialFocus?: React.RefObject<HTMLElement>
}

export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  initialFocus
}: AccessibleModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus management
      const focusElement = initialFocus?.current || titleRef.current
      focusElement?.focus()

      // Trap focus within modal
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown as any)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown as any)
        document.body.style.overflow = 'auto'
      }
    }
  }, [isOpen, onClose, initialFocus])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2
            ref={titleRef}
            id="modal-title"
            className="text-xl font-semibold mb-4 focus:outline-none"
            tabIndex={-1}
          >
            {title}
          </h2>
          
          {children}
          
          <div className="mt-6 flex justify-end space-x-3">
            <AccessibleButton
              variant="secondary"
              onClick={onClose}
              ariaLabel="Close modal"
            >
              Close
            </AccessibleButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// Accessible form input with proper labeling
interface AccessibleInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  ariaDescribedBy?: string
}

export const AccessibleInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  ariaDescribedBy
}: AccessibleInputProps) => {
  const errorId = error ? `${id}-error` : undefined
  const helpId = helpText ? `${id}-help` : undefined
  
  const describedBy = [ariaDescribedBy, errorId, helpId]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
        `}
      />
      
      {helpText && (
        <p id={helpId} className="mt-1 text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible star rating component
interface AccessibleStarRatingProps {
  rating: number
  maxRating?: number
  onRatingChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export const AccessibleStarRating = ({
  rating,
  maxRating = 5,
  onRatingChange,
  readOnly = false,
  size = 'md',
  label = 'Wine rating'
}: AccessibleStarRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, starIndex: number) => {
    if (readOnly) return

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault()
        onRatingChange?.(Math.max(1, starIndex - 1))
        break
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault()
        onRatingChange?.(Math.min(maxRating, starIndex + 1))
        break
      case 'Home':
        e.preventDefault()
        onRatingChange?.(1)
        break
      case 'End':
        e.preventDefault()
        onRatingChange?.(maxRating)
        break
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex space-x-1"
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const starIndex = index + 1
        const isFilled = starIndex <= (hoverRating || rating)

        return (
          <button
            key={starIndex}
            type="button"
            role="radio"
            aria-checked={starIndex <= rating}
            aria-label={`${starIndex} star${starIndex === 1 ? '' : 's'}`}
            className={`
              ${sizeClasses[size]} ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm
              ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
            `}
            onClick={() => !readOnly && onRatingChange?.(starIndex)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
            onMouseEnter={() => !readOnly && setHoverRating(starIndex)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            tabIndex={readOnly ? -1 : 0}
          >
            <svg
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )
      })}
      
      <span className="sr-only">
        {rating} out of {maxRating} stars
      </span>
    </div>
  )
}

// Accessible loading state
export const AccessibleLoading = ({ 
  message = 'Loading...', 
  size = 'md' 
}: { 
  message?: string
  size?: 'sm' | 'md' | 'lg' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div 
      className="flex items-center justify-center space-x-3"
      role="status"
      aria-live="polite"
    >
      <div 
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

// Accessible card component
interface AccessibleCardProps {
  children: ReactNode
  title?: string
  description?: string
  onClick?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void
  className?: string
  ariaLabel?: string
  tabIndex?: number
}

export const AccessibleCard = ({
  children,
  title,
  description,
  onClick,
  onKeyDown,
  className = '',
  ariaLabel,
  tabIndex = onClick ? 0 : -1
}: AccessibleCardProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault()
      onClick()
    }
    onKeyDown?.(e)
  }

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md border border-gray-200 p-4
        ${onClick ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
        transition-shadow duration-200 ${className}
      `}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel || title}
      aria-describedby={description ? `${title}-description` : undefined}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-gray-900">
          {title}
        </h3>
      )}
      
      {description && (
        <p id={`${title}-description`} className="text-gray-600 text-sm mb-3">
          {description}
        </p>
      )}
      
      {children}
    </div>
  )
}

// High contrast theme toggle
export const AccessibilityControls = () => {
  const {
    reducedMotion,
    highContrast,
    fontSize,
    setReducedMotion,
    setHighContrast,
    setFontSize
  } = useAccessibility()

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Reduce motion</span>
        </label>
        
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">High contrast</span>
        </label>
        
        <div>
          <label className="block text-sm font-medium mb-2">Font size</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="extra-large">Extra Large</option>
          </select>
        </div>
      </div>
    </div>
  )
}

// Export all accessibility components
export default {
  AccessibilityProvider,
  useAccessibility,
  SkipLink,
  FocusManager,
  ScreenReaderAnnouncement,
  AccessibleButton,
  AccessibleModal,
  AccessibleInput,
  AccessibleStarRating,
  AccessibleLoading,
  AccessibleCard,
  AccessibilityControls
}