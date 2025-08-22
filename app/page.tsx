"use client"

import { useState, useEffect } from "react"
import MapsSearchBar from "@/components/maps-search-bar"
import { MapComponent } from "@/components/map-component"
import type { google } from "google-maps"

type PlaceResult = google.maps.places.PlaceResult

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

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log("[v0] User location:", newCenter)
        setMapCenter(newCenter)
        
        // Create a mock place result for user's location
        const userLocationPlace: PlaceResult = {
          name: "Your Location",
          geometry: {
            location: new window.google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            ),
            viewport: new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(
                position.coords.latitude - 0.01,
                position.coords.longitude - 0.01
              ),
              new window.google.maps.LatLng(
                position.coords.latitude + 0.01,
                position.coords.longitude + 0.01
              )
            ),
          },
          formatted_address: "Your Current Location",
          place_id: "user-location",
        }
        setSelectedPlace(userLocationPlace)
      },
      (error) => {
        console.error("Error getting user location:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-5xl tracking-tighter md:text-4xl font-semibold text-foreground mb-3 text-3d">
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
              <MapsSearchBar 
                onPlaceSelect={handlePlaceSelect}
                onUseLocation={handleUseLocation}
              />
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
