
# App Planning Document

## Overview
A trip planning and recording application that helps users organize and document their travels. Users can plan upcoming trips and keep a record of their past adventures.

## Requirements
### Technical Requirements
- [x] Supabase project setup and configuration
- [x] Supabase Authentication integration
- [x] User authentication system
- [x] Database to store trip information
- [x] Cloud storage for photos/documents
- [ ] Mobile-responsive design
- [-] Maps API integration (e.g., Google Maps, Mapbox)
- [ ] Geolocation services
- [ ] Integration with Places API for location data
- [ ] Calendar component for date selection
- [-] Autocomplete location search
- [ ] Firestore security rules
- [ ] Supabase Storage rules
- [ ] Google Maps Platform setup
- [ ] Offline data persistence with Firestore

### Functional Requirements
- [ ] User account creation and management
- [ ] Trip creation and editing capabilities
- [ ] Location/destination management
- [ ] Date and itinerary planning
- [ ] Trip expense tracking

## Features
### Core Features
- [ ] User Authentication Flow
    - Login/Register system
    - Password recovery
    - Profile management

- [ ] Trip Dashboard (Home Screen)
    - [ ] Future trips section
    - [ ] Past trips section
    - [ ] Quick "Create Trip" button
    - [ ] Trip search and filtering

- [ ] Trip Creation Flow
    1. Basic Trip Info
        - Trip name
        - Location selection
            - Location search with autocomplete
            - Multiple destination support
            - Real location data from Places API
        - Date selection
            - Interactive calendar
            - Multi-day selection
            - Start/End date picking
   
    2. Trip Details
        - Per-day itinerary planning
        - Accommodation details
        - Transportation info

- [ ] Interactive trip planner with itinerary builder
    - Day-by-day itinerary planning
    - Time slots for activities/visits
    - Points of interest management
    - Walking routes and navigation
    - Estimated travel times between locations
- [ ] Interactive map integration
    - Visual route planning
    - Walking directions
    - Points of interest markers
    - Save custom locations
    - Distance calculation
- [ ] Location/destination saving with details
- [ ] Photo album for each trip
- [ ] Basic expense tracking
- [ ] Travel document management system
    - Airline tickets storage
    - Hotel reservations
    - Car rental bookings
    - Restaurant reservations
    - Activity/tour bookings
    - Automated reminder system for check-in times

### Future Enhancements
- [ ] Trip sharing with other users
- [ ] Map integration for route planning
- [ ] Weather forecasts for destinations
- [ ] Packing list generator
- [ ] OCR for automatic ticket/reservation data extraction
- [ ] Calendar integration for travel dates and reminders

## Technical Stack
- Frontend: React/Next.js (suggested for modern web app development)
- Backend Services (Firebase):
    - Authentication: Firebase Auth
    - Database: Firestore
    - Storage: Firebase Storage
    - Hosting: Firebase Hosting
    - Functions: Firebase Cloud Functions (for serverless operations)
- Other Services:
    - Google Maps Platform
        - Places API
        - Maps JavaScript API
        - Directions API
    - PDF viewer integration

## Timeline
- Phase 1: Core user system and basic trip creation
- Phase 2: Trip planning features and photo management
- Phase 3: Enhanced features (sharing, maps, weather)

## Notes
- Ensure GDPR compliance for user data
- Focus on mobile-first design as users will likely access while traveling
- Consider offline functionality for travel scenarios
- Implement secure storage for sensitive travel documents
- Add document expiry notifications

## Database Structure (Firestore)
```json
{
  "users": {
    "userId": {
      "profile": {
        "name": "string",
        "email": "string",
        "photoURL": "string"
      },
      "trips": {
        "tripId": {
          "name": "string",
          "locations": [
            {
              "name": "string",
              "coordinates": {
                "lat": number,
                "lng": number
              },
              "placeId": "string"
            }
          ],
          "dates": {
            "start": "timestamp",
            "end": "timestamp"
          },
          "itinerary": {
            "day1": {
              "activities": [
                {
                  "timeStart": "string",
                  "timeEnd": "string",
                  "type": "string",
                  "name": "string",
                  "notes": "string",
                  "priority": "string",
                  "coordinates": {
                    "lat": number,
                    "lng": number
                  }
                }
              ]
            }
          },
          "documents": {
            "documentId": {
              "type": "string",
              "url": "string",
              "name": "string",
              "uploadDate": "timestamp"
            }
          }
        }
      }
    }
  }
}
```

{
  "day": 1,
  "date": "2024-05-01",
  "activities": [
    {
      "timeStart": "09:00",
      "timeEnd": "11:00",
      "type": "museum",
      "name": "Louvre Museum",
      "notes": "Book tickets online, arrive early",
      "priority": "high",
      "reservationNeeded": true,
      "estimatedCost": "17 EUR"
    },
    // More activities...
  ],
  "route": {
    "startPoint": {
      "name": "Hotel Name",
      "coordinates": [48.8566, 2.3522]
    },
    "waypoints": [
      {
        "name": "Louvre Museum",
        "coordinates": [48.8606, 2.3376],
        "estimatedTimeToNext": "15 mins",
        "distance": "1.2 km"
      }
      // More waypoints...
    ]
  }
}


-----------

Add top bar with name of the page
Initial page is the list of trips

Trip page should have tabs with booking, planner and map
