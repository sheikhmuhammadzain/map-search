"use client"

/**
 * Maps Search Bar Component
 * Adapted from kokonutui for Google Maps integration
 * Integrates with Google Places API for location search
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "motion/react"
import {
  Search,
  Send,
  MapPin,
  Crosshair,
  Coffee,
  GraduationCap,
  ShoppingBag,
  Hospital,
  Car,
  Building,
} from "lucide-react"
import useDebounce from "@/hooks/use-debounce"
import type { google } from "google-maps"

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
  short?: string
  end?: string
  action?: () => void
}

interface MapsSearchBarProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  onUseLocation?: () => void
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: "auto",
      transition: {
        height: { duration: 0.4 },
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 },
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  },
} as const

function MapsSearchBar({ onPlaceSelect, onUseLocation }: MapsSearchBarProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [requestId, setRequestId] = useState(0) // Track request IDs for race condition prevention
  const debouncedQuery = useDebounce(query, 300)

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  // Quick actions for maps
  const quickActions: Action[] = useMemo(() => [
    {
      id: "use-location",
      label: "Use my location",
      icon: <Crosshair className="h-4 w-4 text-blue-500" />,
      description: "Current position",
      short: "⌘ L",
      end: "Location",
      action: onUseLocation,
    },
    {
      id: "restaurants",
      label: "Find restaurants",
      icon: <Coffee className="h-4 w-4 text-orange-500" />,
      description: "Nearby dining",
      short: "⌘ R",
      end: "Category",
      action: () => setQuery("restaurants near me"),
    },
    {
      id: "universities",
      label: "Find universities",
      icon: <GraduationCap className="h-4 w-4 text-purple-500" />,
      description: "Education",
      short: "⌘ U",
      end: "Category",
      action: () => setQuery("universities near me"),
    },
    {
      id: "shopping",
      label: "Find shopping",
      icon: <ShoppingBag className="h-4 w-4 text-green-500" />,
      description: "Retail stores",
      short: "⌘ S",
      end: "Category",
      action: () => setQuery("shopping malls near me"),
    },
    {
      id: "hospitals",
      label: "Find hospitals",
      icon: <Hospital className="h-4 w-4 text-red-500" />,
      description: "Healthcare",
      short: "⌘ H",
      end: "Category",
      action: () => setQuery("hospitals near me"),
    },
    {
      id: "gas-stations",
      label: "Find gas stations",
      icon: <Car className="h-4 w-4 text-blue-600 ml" />,
      description: "Fuel stations",
      short: "⌘ G",
      end: "Category",
      action: () => setQuery("gas stations near me"),
    },
  ], [onUseLocation])

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      const mapDiv = document.createElement("div")
      const map = new window.google.maps.Map(mapDiv)
      placesService.current = new window.google.maps.places.PlacesService(map)
    }
  }, [])

  // Search for places when query changes (with debouncing and request cancellation)
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2 || !autocompleteService.current) {
      setPredictions([])
      setIsLoading(false)
      return
    }

    // Generate new request ID to track this specific request
    const currentRequestId = requestId + 1
    setRequestId(currentRequestId)
    setIsLoading(true)

    const searchRequest: google.maps.places.AutocompletionRequest = {
      input: debouncedQuery,
    }

    console.log(`[MapsSearchBar] Making API call #${currentRequestId} for: "${debouncedQuery}"`)

    autocompleteService.current.getPlacePredictions(searchRequest, (predictions, status) => {
      // Only update if this request is still the most recent one
      if (currentRequestId === requestId + 1) {
        setIsLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions.slice(0, 5)) // Limit to 5 results
          console.log(`[MapsSearchBar] Request #${currentRequestId} found ${predictions.length} results for: "${debouncedQuery}"`)
        } else {
          setPredictions([])
          console.log(`[MapsSearchBar] Request #${currentRequestId} no results or error for: "${debouncedQuery}"`, status)
        }
      } else {
        console.log(`[MapsSearchBar] Ignoring outdated request #${currentRequestId} for: "${debouncedQuery}"`)
      }
    })
  }, [debouncedQuery])

  // Update request ID when debounced query changes
  useEffect(() => {
    setRequestId(prev => prev + 1)
  }, [debouncedQuery])

  // Clear predictions when query is cleared
  useEffect(() => {
    if (!query) {
      setPredictions([])
      setIsLoading(false)
    }
  }, [query])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setActiveIndex(-1)
  }, [])

  const handlePlaceSelect = useCallback((placeId: string, description: string) => {
    if (!placesService.current) return

    setIsLoading(true)
    placesService.current.getDetails(
      {
        placeId: placeId,
        fields: [
          "geometry",
          "name",
          "formatted_address",
          "types",
          "rating",
          "price_level",
          "photos",
          "opening_hours",
        ],
      },
      (place, status) => {
        setIsLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          setQuery(description)
          setIsFocused(false)
          onPlaceSelect(place)
        }
      }
    )
  }, [onPlaceSelect])

  const handleActionClick = useCallback((action: Action) => {
    if (action.action) {
      action.action()
    }
    setIsFocused(false)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = predictions.length + (query.length === 0 ? quickActions.length : 0)
    
    if (!isFocused || totalItems === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0) {
          if (query.length === 0 && activeIndex < quickActions.length) {
            // Quick action selected
            handleActionClick(quickActions[activeIndex])
          } else if (predictions.length > 0) {
            // Place prediction selected
            const adjustedIndex = query.length === 0 ? activeIndex - quickActions.length : activeIndex
            if (adjustedIndex >= 0 && predictions[adjustedIndex]) {
              handlePlaceSelect(predictions[adjustedIndex].place_id, predictions[adjustedIndex].description)
            }
          }
        }
        break
      case "Escape":
        setIsFocused(false)
        setActiveIndex(-1)
        break
    }
  }, [isFocused, activeIndex, predictions, quickActions, query.length, handleActionClick, handlePlaceSelect])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    setActiveIndex(-1)
  }, [])

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsFocused(false)
      setActiveIndex(-1)
    }, 200)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery("")
    setPredictions([])
    setActiveIndex(-1)
  }, [])

  // Show quick actions when no query, predictions when searching
  const showQuickActions = query.length === 0 && isFocused
  const showPredictions = query.length > 0 && predictions.length > 0 && isFocused

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex flex-col justify-start items-center">
        <div className="w-full sticky top-0 bg-background z-10 pb-1">
          <label
            className="text-xs font-medium text-muted-foreground mb-2 block text-center"
            htmlFor="maps-search"
          >
            Search locations or choose a category
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for places, addresses, or landmarks..."
              value={query}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={isFocused && (showQuickActions || showPredictions)}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `item-${activeIndex}` : undefined
              }
              id="maps-search"
              autoComplete="off"
              className="pl-12 pr-12 py-3 h-12 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            
            {/* Search icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent" />
              ) : (
                <Search className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Send/Clear icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4">
              <AnimatePresence mode="popLayout">
                {query.length > 0 ? (
                  <motion.button
                    key="clear"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence>
            {(showQuickActions || showPredictions) && (
              <motion.div
                className="w-full border border-border rounded-lg shadow-lg overflow-hidden bg-background mt-2"
                variants={ANIMATION_VARIANTS.container}
                role="listbox"
                aria-label="Search results"
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <motion.ul role="none" className="max-h-80 overflow-y-auto">
                  {/* Quick Actions */}
                  {showQuickActions && quickActions.map((action, index) => (
                    <motion.li
                      key={action.id}
                      id={`item-${index}`}
                      className={`px-4 py-3 flex items-center justify-between hover:bg-muted cursor-pointer transition-colors ${
                        activeIndex === index ? "bg-muted" : ""
                      }`}
                      variants={ANIMATION_VARIANTS.item}
                      layout
                      onClick={() => handleActionClick(action)}
                      role="option"
                      aria-selected={activeIndex === index}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground" aria-hidden="true">
                          {action.icon}
                        </span>
                        <div>
                          <span className="text-sm font-medium text-foreground">
                            {action.label}
                          </span>
                          {action.description && (
                            <div className="text-xs text-muted-foreground">
                              {action.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {action.short && (
                          <span
                            className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                            aria-label={`Keyboard shortcut: ${action.short}`}
                          >
                            {action.short}
                          </span>
                        )}
                        {action.end && (
                          <span className="text-xs text-muted-foreground">
                            {action.end}
                          </span>
                        )}
                      </div>
                    </motion.li>
                  ))}

                  {/* Place Predictions */}
                  {showPredictions && predictions.map((prediction, index) => {
                    const itemIndex = showQuickActions ? quickActions.length + index : index
                    return (
                      <motion.li
                        key={prediction.place_id}
                        id={`item-${itemIndex}`}
                        className={`px-4 py-3 flex items-start gap-3 hover:bg-muted cursor-pointer transition-colors border-t border-border ${
                          activeIndex === itemIndex ? "bg-muted" : ""
                        }`}
                        variants={ANIMATION_VARIANTS.item}
                        layout
                        onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
                        role="option"
                        aria-selected={activeIndex === itemIndex}
                      >
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">
                            {prediction.structured_formatting.main_text}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {prediction.structured_formatting.secondary_text}
                          </div>
                        </div>
                        {prediction.types && prediction.types.length > 0 && (
                          <div className="flex items-center">
                            <Building className="h-3 w-3 text-muted-foreground" />
                          </div>
                        )}
                      </motion.li>
                    )
                  })}
                </motion.ul>
                
                {/* Footer */}
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Use ↑↓ to navigate • Enter to select</span>
                    <span>ESC to cancel</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MapsSearchBar
