"use client"

import { useState, useEffect } from "react"
import { SearchBox } from "@/components/search-box"
import { MapComponent } from "@/components/map-component"

interface PlaceResult {
  name?: string
  geometry?: {
    location?: {
      lat(): number
      lng(): number
    }
  }
}

export default function HomePage() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 31.5204, lng: 74.3587 }) // Default to Lahore
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        console.log("[v0] Google Maps already loaded")
        setIsGoogleMapsLoaded(true)
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
      if (!apiKey) {
        console.error("[v0] Google Maps API key not found")
        return
      }

      console.log("[v0] Loading Google Maps script...")
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization&callback=initMap`
      script.async = true
      script.defer = true

      // Global callback function
      ;(window as any).initMap = () => {
        console.log("[v0] Google Maps loaded successfully")
        setIsGoogleMapsLoaded(true)
      }

      script.onerror = () => {
        console.error("[v0] Failed to load Google Maps script")
      }

      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const handlePlaceSelect = (place: PlaceResult) => {
    console.log("[v0] Place selected:", place.name)
    setSelectedPlace(place)
    if (place.geometry?.location) {
      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      }
      console.log("[v0] Map center updated to:", newCenter)
      setMapCenter(newCenter)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Find places fast. See patterns instantly.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Search any location and visualize activity with an intuitive heatmap.
          </p>
        </div>

        {!isGoogleMapsLoaded ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Google Maps...</p>
              <p className="text-sm text-muted-foreground mt-2">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? "API key found" : "API key missing"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <SearchBox onPlaceSelect={handlePlaceSelect} />
            </div>

            <div className="w-full">
              <MapComponent center={mapCenter} selectedPlace={selectedPlace} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
