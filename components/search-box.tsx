"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, GraduationCap, ShoppingBag, Coffee, Hospital, Car } from "lucide-react"
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
          className="pl-12 pr-4 py-3 h-12 text-base border border-border rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden max-h-80 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePlaceSelect(prediction.place_id, prediction.description)}
              className="w-full text-left p-4 hover:bg-muted transition-colors border-b border-border last:border-b-0"
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
