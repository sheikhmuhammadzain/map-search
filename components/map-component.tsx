"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, DollarSign, MapPin } from "lucide-react"
import type { google } from "google-maps"

interface MapComponentProps {
  center: { lat: number; lng: number }
  selectedPlace?: google.maps.places.PlaceResult | null
}

export function MapComponent({ center, selectedPlace }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.PlaceResult[]>([])
  const [placeDetails, setPlaceDetails] = useState<google.maps.places.PlaceResult | null>(null)

  const generateRealHeatmapData = async (center: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return []

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const points: google.maps.visualization.WeightedLocation[] = []

    const placeTypes = [
      "restaurant",
      "shopping_mall",
      "university",
      "hospital",
      "school",
      "bank",
      "gas_station",
      "pharmacy",
      "gym",
      "tourist_attraction",
    ]

    console.log("[v0] Generating real heatmap data from Google Places API")

    for (const placeType of placeTypes) {
      try {
        const places = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
          const request = {
            location: new window.google.maps.LatLng(center.lat, center.lng),
            radius: 5000,
            type: placeType as any,
          }

          service.nearbySearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results)
            } else {
              resolve([])
            }
          })
        })

        places.forEach((place) => {
          if (place.geometry?.location) {
            let weight = 0.3

            if (place.rating) {
              weight += (place.rating / 5) * 0.4
            }

            if (place.user_ratings_total) {
              const reviewWeight = Math.min(place.user_ratings_total / 1000, 1) * 0.3
              weight += reviewWeight
            }

            if (["restaurant", "shopping_mall", "university", "tourist_attraction"].includes(placeType)) {
              weight += 0.2
            }

            points.push({
              location: place.geometry.location,
              weight: Math.min(weight, 1),
            })
          }
        })

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.log("[v0] Error fetching places for type:", placeType, error)
      }
    }

    console.log("[v0] Generated", points.length, "real heatmap points from Google Places data")
    return points
  }

  const searchNearbyPlaces = (location: google.maps.LatLng) => {
    if (!mapInstanceRef.current) return

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const request = {
      location: location,
      radius: 2000,
      type: "establishment",
    }

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        console.log("[v0] Found", results.length, "nearby places")
        setNearbyPlaces(results.slice(0, 5))
      }
    })
  }

  const getPriceLevelText = (priceLevel?: number) => {
    if (priceLevel === undefined) return null
    const levels = ["Free", "$", "$$", "$$$", "$$$$"]
    return levels[priceLevel] || null
  }

  const getPlaceDetails = (placeId: string) => {
    if (!mapInstanceRef.current) return

    const service = new window.google.maps.places.PlacesService(mapInstanceRef.current)
    const request = {
      placeId: placeId,
      fields: ["name", "formatted_address", "rating", "price_level", "types", "geometry"],
    }

    service.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        console.log("[v0] Got detailed place info:", place.name)
        setPlaceDetails(place)
      }
    })
  }

  const getOpenStatus = (place: google.maps.places.PlaceResult) => {
    return null
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      console.log("[v0] Window not available yet")
      return
    }

    if (!window.google) {
      console.log("[v0] Google Maps not loaded yet")
      return
    }

    if (!mapRef.current) {
      console.log("[v0] Map container not ready")
      return
    }

    try {
      console.log("[v0] Initializing Google Map with center:", center)
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 12,
        styles: [
          {
            featureType: "all",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#f1f5f9" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#f8fafc" }],
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "simplified" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: "cooperative",
      })

      mapInstanceRef.current = map
      console.log("[v0] Map initialized successfully")

      generateRealHeatmapData(center).then((heatmapData) => {
        if (heatmapData.length > 0) {
          const heatmap = new window.google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
            radius: 25,
            opacity: 0.7,
            gradient: [
              "rgba(0, 255, 255, 0)",
              "rgba(0, 255, 255, 1)",
              "rgba(0, 191, 255, 1)",
              "rgba(0, 127, 255, 1)",
              "rgba(0, 63, 255, 1)",
              "rgba(0, 0, 255, 1)",
              "rgba(0, 0, 223, 1)",
              "rgba(0, 0, 191, 1)",
              "rgba(0, 0, 159, 1)",
              "rgba(0, 0, 127, 1)",
              "rgba(63, 0, 91, 1)",
              "rgba(127, 0, 63, 1)",
              "rgba(191, 0, 31, 1)",
              "rgba(255, 0, 0, 1)",
            ],
          })

          heatmapRef.current = heatmap
          console.log("[v0] Real heatmap layer added successfully")
        }
      })

      setIsLoaded(true)
    } catch (error) {
      console.error("[v0] Error initializing map:", error)
    }
  }, [center])

  useEffect(() => {
    if (mapInstanceRef.current && selectedPlace?.geometry?.location) {
      const newCenter = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng(),
      }

      console.log("[v0] Updating map center and heatmap for:", selectedPlace.name)
      mapInstanceRef.current.panTo(newCenter)
      mapInstanceRef.current.setZoom(15)

      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      const marker = new window.google.maps.Marker({
        position: selectedPlace.geometry.location,
        map: mapInstanceRef.current,
        title: selectedPlace.name,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="white" strokeWidth="2"/>
              <circle cx="16" cy="16" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16),
        },
      })

      markerRef.current = marker

      searchNearbyPlaces(selectedPlace.geometry.location)

      if (selectedPlace.place_id) {
        getPlaceDetails(selectedPlace.place_id)
      } else {
        setPlaceDetails(selectedPlace)
      }

      setTimeout(() => {
        if (heatmapRef.current) {
          heatmapRef.current.setMap(null)
        }

        generateRealHeatmapData(newCenter).then((heatmapData) => {
          if (heatmapData.length > 0) {
            const heatmap = new window.google.maps.visualization.HeatmapLayer({
              data: heatmapData,
              map: mapInstanceRef.current,
              radius: 25,
              opacity: 0.7,
              gradient: [
                "rgba(0, 255, 255, 0)",
                "rgba(0, 255, 255, 1)",
                "rgba(0, 191, 255, 1)",
                "rgba(0, 127, 255, 1)",
                "rgba(0, 63, 255, 1)",
                "rgba(0, 0, 255, 1)",
                "rgba(0, 0, 223, 1)",
                "rgba(0, 0, 191, 1)",
                "rgba(0, 0, 159, 1)",
                "rgba(0, 0, 127, 1)",
                "rgba(63, 0, 91, 1)",
                "rgba(127, 0, 63, 1)",
                "rgba(191, 0, 31, 1)",
                "rgba(255, 0, 0, 1)",
              ],
            })

            heatmapRef.current = heatmap
          }
        })
      }, 500)
    }
  }, [selectedPlace])

  const displayPlace = placeDetails || selectedPlace

  return (
    <div className="relative w-full h-[70vh] rounded-lg overflow-hidden border border-border bg-muted">
      <div ref={mapRef} className="w-full h-full" />

      {displayPlace && (
        <div className="absolute top-4 left-4 max-w-sm space-y-3">
          <Card className="bg-background/95 backdrop-blur-sm border-border shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{displayPlace.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {displayPlace.formatted_address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {displayPlace.types?.slice(0, 3).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {displayPlace.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{displayPlace.rating}</span>
                    </div>
                  )}

                  {getPriceLevelText(displayPlace.price_level) && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{getPriceLevelText(displayPlace.price_level)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {nearbyPlaces.length > 0 && (
            <Card className="bg-background/95 backdrop-blur-sm border-border shadow-lg">
              <CardContent className="p-4">
                <h4 className="font-medium text-foreground mb-3">Nearby Places</h4>
                <div className="space-y-2">
                  {nearbyPlaces.map((place, index) => (
                    <div key={place.place_id || index} className="flex items-center justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{place.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{place.types?.[0]?.replace(/_/g, " ")}</p>
                      </div>
                      {place.rating && (
                        <div className="flex items-center gap-1 ml-2">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{place.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-foreground border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
