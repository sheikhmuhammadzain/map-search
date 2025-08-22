import { useState, useEffect, useRef } from "react"

/**
 * Custom hook that debounces a value with improved cleanup
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousValueRef = useRef<T>(value)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If value hasn't changed significantly, don't debounce
    if (previousValueRef.current === value) {
      return
    }

    previousValueRef.current = value

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
