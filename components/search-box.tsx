"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, GraduationCap, ShoppingBag, Coffee, Hospital, Car, X, Crosshair } from "lucide-react"
import type { google } from "google-maps"

interface SearchBoxProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
}

const searchCategories = [
  { name: "All", icon: Search, types: [] },
  { name: "Universities", icon: GraduationCap, types: ["university", "school"] },
  { name: "Shopping", icon: ShoppingBag, types: ["shopping_mall", "store", "supermarket"] },
  { name: "Restaurants", icon: Coffee, types: ["restaurant", "food", "cafe"] },
  { name: "Hospitals", icon: Hospital, types: ["hospital", "pharmacy", "doctor"] },
  { name: "Gas Stations", icon: Car, types: ["gas_station"] },
  { name: "Places", icon: MapPin, types: ["establishment"] },
]

export function SearchBox({ onPlaceSelect }: SearchBoxProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [activeCategory, setActiveCategory] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      console.log("[v0] Initializing Google Places services")
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      const mapDiv = document.createElement("div")
      const map = new window.google.maps.Map(mapDiv)
      placesService.current = new window.google.maps.places.PlacesService(map)
    }
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setActiveIndex(-1)

    if (value.length > 2 && autocompleteService.current) {
      setIsLoading(true)
      console.log("[v0] Searching for places:", value, "Category:", searchCategories[activeCategory].name)

      const searchRequest: google.maps.places.AutocompletionRequest = {
        input: value,
        ...(searchCategories[activeCategory].types.length > 0 && {
          types: searchCategories[activeCategory].types as any,
        }),
      }

      autocompleteService.current.getPlacePredictions(searchRequest, (predictions, status) => {
        setIsLoading(false)
        console.log("[v0] Places API response:", status, predictions?.length || 0, "results")
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions)
          setIsOpen(true)
        } else {
          setPredictions([])
          setIsOpen(false)
        }
      })
    } else {
      setPredictions([])
      setIsOpen(false)
      setIsLoading(false)
    }
  }

  const handlePlaceSelect = (placeId: string, description: string) => {
    if (placesService.current) {
      setIsLoading(true)
      console.log("[v0] Getting place details for:", description)
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
          console.log("[v0] Place details response:", status, place?.name)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setQuery(description)
            setIsOpen(false)
            onPlaceSelect(place)
          }
        },
      )
    }
  }

  const handleCategorySelect = (index: number) => {
    setActiveCategory(index)
    if (query.length > 2) {
      handleInputChange(query) // Re-search with new category
    }
  }

  const selectPredictionByIndex = (index: number) => {
    const item = predictions[index]
    if (!item) return
    handlePlaceSelect(item.place_id, item.description)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, predictions.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault()
        selectPredictionByIndex(activeIndex)
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setPredictions([])
    setIsOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  const useMyLocation = () => {
    if (!navigator.geolocation || !placesService.current) return
    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const request: google.maps.places.PlaceDetailsRequest = {
          placeId: "",
        } as any
        // Reverse geocode via Places nearby one result
        const mapDiv = document.createElement("div")
        const tempMap = new window.google.maps.Map(mapDiv, { center: { lat: latitude, lng: longitude }, zoom: 15 })
        const svc = new window.google.maps.places.PlacesService(tempMap)
        const location = new window.google.maps.LatLng(latitude, longitude)
        svc.nearbySearch({ location, radius: 50 }, (results, status) => {
          setIsLoading(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0]) {
            onPlaceSelect(results[0])
            setQuery(results[0].name || "Current location")
            setIsOpen(false)
          }
        })
      },
      () => setIsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {searchCategories.map((category, index) => {
          const Icon = category.icon
          return (
            <button
              key={category.name}
              onClick={() => handleCategorySelect(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === index
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {category.name}
            </button>
          )
        })}
      </div>

      <div className="relative">
        {isLoading ? (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent"></div>
          </div>
        ) : (
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder={`Search for ${searchCategories[activeCategory].name.toLowerCase()}...`}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="pl-12 pr-4 py-3 h-12 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={useMyLocation}
          aria-label="Use my location"
          title="Use my location"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <Crosshair className="h-4 w-4" />
        </button>
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {predictions.map((prediction, idx) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
              className={`w-full text-left p-4 transition-colors border-b border-border last:border-b-0 ${
                idx === activeIndex ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
                {prediction.types && prediction.types.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prediction.types.slice(0, 2).map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
