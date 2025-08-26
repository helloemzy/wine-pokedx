# Wine Pokédx API Documentation

## Overview

The Wine Pokédx API provides comprehensive endpoints for managing wine collections, battles, trading, and social features. Built with Next.js API routes and PostgreSQL, it follows RESTful conventions with Pokemon-inspired game mechanics.

**Base URL**: `https://wine-pokedx.app/api` (Production)  
**Development**: `http://localhost:3000/api`

## Authentication

All protected routes require authentication via NextAuth.js sessions.

```typescript
// Authentication headers
{
  "Authorization": "Bearer <session-token>",
  "Content-Type": "application/json"
}
```

## Core Wine Management

### GET `/api/wines`
Retrieve user's wine collection with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (max: 100, default: 20)
- `type` (string): Filter by wine type
- `rarity` (string): Filter by rarity tier
- `region` (string): Filter by wine region
- `search` (string): Search across name, producer, region
- `sort` (string): Sort field (rating, dateAdded, name, rarity)
- `order` (string): Sort order (asc, desc)

**Response:**
```typescript
{
  "wines": [
    {
      "id": 123,
      "name": "Château Margaux 2015",
      "year": 2015,
      "region": "Bordeaux, France",
      "producer": "Château Margaux",
      "type": "Red Wine",
      "grape": "Cabernet Sauvignon Blend",
      "rating": 5,
      "rarity": "Legendary",
      "baseStats": {
        "power": 98,
        "elegance": 95,
        "complexity": 92,
        "longevity": 96,
        "terroir": 94,
        "rarity": 99
      },
      "individualValues": {
        "power": 31,
        "elegance": 28,
        "complexity": 30,
        "longevity": 29,
        "terroir": 31,
        "rarity": 31
      },
      "experiencePoints": 2847,
      "level": 34,
      "captured": true,
      "dateAdded": "2024-08-25T10:30:00Z",
      "tastingNotes": {
        "appearance": "Deep garnet with purple edges",
        "nose": "Blackcurrant, cedar, graphite, violet",
        "palate": "Full-bodied, silky tannins, exceptional balance",
        "finish": "Long, complex, hints of tobacco and dark chocolate"
      },
      "wsetAnalysis": {
        "sweetness": 1,
        "acidity": 3,
        "tannin": 4,
        "body": 5,
        "flavor": 5,
        "finish": 5,
        "quality": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 127,
    "pages": 7
  },
  "stats": {
    "totalWines": 127,
    "averageRating": 4.2,
    "totalExperience": 45627,
    "collectionLevel": 18,
    "uniqueRegions": 23,
    "rarityDistribution": {
      "Common": 45,
      "Uncommon": 32,
      "Rare": 28,
      "Epic": 15,
      "Legendary": 7
    }
  }
}
```

### POST `/api/wines`
Add a new wine to the collection.

**Request Body:**
```typescript
{
  "name": "Dom Pérignon Vintage 2012",
  "year": 2012,
  "region": "Champagne, France",
  "producer": "Dom Pérignon",
  "type": "Sparkling Wine",
  "grape": "Chardonnay, Pinot Noir",
  "rating": 5,
  "tastingNotes": "Exceptional vintage with complex minerality...",
  "purchasePrice": 250.00,
  "purchaseLocation": "Harrods Wine Shop",
  "scanData": {
    "barcode": "3185370001234",
    "confidence": 0.95,
    "timestamp": "2024-08-25T10:30:00Z"
  }
}
```

**Response:**
```typescript
{
  "success": true,
  "wine": {
    // Complete wine object with generated stats
    "id": 128,
    "rarity": "Epic", // Auto-calculated
    "baseStats": { ... }, // Generated based on producer/region/vintage
    "individualValues": { ... }, // Randomly generated IVs
    "experiencePoints": 0,
    "level": 1
  },
  "rewards": {
    "experienceGained": 100,
    "badgesUnlocked": ["First Champagne"],
    "achievementsUnlocked": ["French Connection"]
  }
}
```

### GET `/api/wines/{id}`
Get detailed information about a specific wine.

### PATCH `/api/wines/{id}`
Update wine information (rating, tasting notes, etc.).

### DELETE `/api/wines/{id}`
Remove wine from collection.

## Search & Discovery

### GET `/api/search`
Advanced search across wines with AI-powered recommendations.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Search type (text, image, voice)
- `filters` (object): Advanced filters
- `recommendations` (boolean): Include AI recommendations

**Response:**
```typescript
{
  "results": [
    {
      "wine": { /* wine object */ },
      "relevanceScore": 0.92,
      "matchReasons": ["name", "region", "producer"]
    }
  ],
  "suggestions": [
    "Did you mean 'Burgundy'?",
    "Try searching for 'Pinot Noir from Burgundy'"
  ],
  "recommendations": [
    {
      "wine": { /* recommended wine */ },
      "reason": "Similar to wines you've rated highly",
      "confidence": 0.85
    }
  ],
  "facets": {
    "regions": { "Burgundy": 15, "Bordeaux": 12 },
    "types": { "Red Wine": 20, "White Wine": 7 },
    "rarities": { "Rare": 8, "Epic": 3, "Legendary": 1 }
  }
}
```

## Battle System

### GET `/api/battles`
List available battles and battle history.

### POST `/api/battles`
Create a new wine battle.

**Request Body:**
```typescript
{
  "type": "ranked", // ranked, casual, tournament
  "opponentId": 456, // null for AI opponent
  "wineIds": [123, 124, 125], // User's battle team (3 wines)
  "battleMode": "classic", // classic, speed, endurance
  "wager": {
    "type": "experience", // experience, items, wines
    "amount": 100
  }
}
```

### GET `/api/battles/{id}`
Get battle details and real-time status.

### POST `/api/battles/{id}/move`
Submit a battle move.

**Request Body:**
```typescript
{
  "moveId": "elegant_finish",
  "wineId": 123,
  "targetId": 456, // Opponent's wine
  "metadata": {
    "powerLevel": 85,
    "accuracy": 95,
    "criticalHit": false
  }
}
```

## Trading System

### GET `/api/trades`
List active trades and trade history.

**Query Parameters:**
- `type` (string): direct, market, auction, mystery
- `status` (string): active, pending, completed, cancelled
- `userId` (number): Filter by user

### POST `/api/trades`
Create a new trade offer.

**Request Body:**
```typescript
{
  "type": "direct", // direct, market, auction, mystery
  "targetUserId": 456, // For direct trades
  "offerWines": [123, 124], // Wines being offered
  "requestWines": [789, 790], // Wines being requested (direct only)
  "marketPrice": 150.00, // For market trades
  "auctionData": { // For auctions
    "startingBid": 100.00,
    "reservePrice": 200.00,
    "duration": 86400, // 24 hours in seconds
    "autoExtend": true
  },
  "mysteryBox": { // For mystery trades
    "theme": "french_reds",
    "rarity": "rare_plus",
    "quantity": 3
  },
  "message": "Beautiful Bordeaux collection for trade!"
}
```

### GET `/api/trades/{id}`
Get trade details.

### POST `/api/trades/{id}/accept`
Accept a trade offer.

### POST `/api/trades/{id}/counter`
Make a counter-offer.

## Guild System

### GET `/api/guilds`
List available guilds.

### POST `/api/guilds`
Create a new guild.

### GET `/api/guilds/{id}`
Get guild details.

### POST `/api/guilds/{id}/join`
Join a guild.

### POST `/api/guilds/{id}/events`
Create guild event.

## Market & Economy

### GET `/api/market`
Get market overview and trending wines.

**Response:**
```typescript
{
  "trending": [
    {
      "wine": { /* wine object */ },
      "priceChange": 15.5, // Percentage change
      "volume": 127, // Trade volume
      "averagePrice": 89.99
    }
  ],
  "recommendations": [
    {
      "wine": { /* wine object */ },
      "investment": "strong_buy", // strong_buy, buy, hold, sell
      "roi": 23.5, // Expected ROI percentage
      "riskLevel": "medium"
    }
  ],
  "priceAlerts": [
    {
      "wineId": 123,
      "threshold": 150.00,
      "currentPrice": 142.50,
      "trending": "up"
    }
  ]
}
```

### GET `/api/market/prices/{wineId}`
Get price history for a specific wine.

### POST `/api/market/alerts`
Set price alerts.

## Statistics & Leaderboards

### GET `/api/stats`
Get user statistics and achievements.

### GET `/api/leaderboard`
Get global leaderboards.

**Query Parameters:**
- `type` (string): collection_size, experience, battles_won, trades_completed
- `timeframe` (string): daily, weekly, monthly, all_time
- `guild` (number): Filter by guild

## User Management

### GET `/api/profile`
Get user profile.

### PATCH `/api/profile`
Update user profile.

### GET `/api/achievements`
Get user achievements and badges.

### POST `/api/achievements/claim`
Claim available achievements.

## WebSocket Events

Real-time events via Socket.IO:

### Battle Events
- `battle:move` - Battle move made
- `battle:result` - Battle finished
- `battle:update` - Battle state changed

### Trade Events
- `trade:offer` - New trade offer received
- `trade:accepted` - Trade accepted
- `trade:completed` - Trade completed

### Social Events
- `guild:message` - New guild message
- `guild:event` - Guild event created
- `friend:online` - Friend came online

## Error Handling

All errors follow consistent format:

```typescript
{
  "error": true,
  "code": "WINE_NOT_FOUND",
  "message": "Wine with ID 123 not found",
  "details": {
    "timestamp": "2024-08-25T10:30:00Z",
    "path": "/api/wines/123",
    "method": "GET"
  },
  "suggestions": [
    "Check the wine ID",
    "Verify the wine belongs to your collection"
  ]
}
```

### Error Codes

**4xx Client Errors:**
- `400 BAD_REQUEST` - Invalid request data
- `401 UNAUTHORIZED` - Authentication required
- `403 FORBIDDEN` - Insufficient permissions
- `404 NOT_FOUND` - Resource not found
- `409 CONFLICT` - Resource conflict
- `422 VALIDATION_ERROR` - Validation failed

**5xx Server Errors:**
- `500 INTERNAL_ERROR` - Server error
- `503 SERVICE_UNAVAILABLE` - Temporary unavailability
- `504 TIMEOUT` - Request timeout

## Rate Limiting

API endpoints are rate limited:

- **Authenticated users**: 1000 requests/hour
- **Search endpoints**: 100 requests/hour
- **Battle moves**: 60 requests/minute
- **Trade operations**: 30 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635724800
X-RateLimit-Window: 3600
```

## Caching

API responses are cached:

- **Wine data**: 5 minutes (stale-while-revalidate)
- **Battle data**: 30 seconds
- **Market data**: 1 minute
- **Static data**: 1 hour (regions, types, rarities)

Cache headers:
```
Cache-Control: public, max-age=300, stale-while-revalidate=900
ETag: "abc123"
Last-Modified: Mon, 25 Aug 2024 10:30:00 GMT
```

## SDK & Libraries

**Official JavaScript SDK:**
```bash
npm install @wine-pokedx/sdk
```

```typescript
import { WinePokedxClient } from '@wine-pokedx/sdk';

const client = new WinePokedxClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://wine-pokedx.app/api'
});

// Get collection
const wines = await client.wines.list({ limit: 50 });

// Add wine
const newWine = await client.wines.create({
  name: 'Château Latour 2010',
  // ... other properties
});

// Start battle
const battle = await client.battles.create({
  wineIds: [123, 124, 125],
  type: 'ranked'
});
```

## Webhooks

Configure webhooks for real-time notifications:

### POST `/api/webhooks`
Register webhook endpoint.

**Webhook Payload:**
```typescript
{
  "id": "webhook_123",
  "event": "wine.added",
  "timestamp": "2024-08-25T10:30:00Z",
  "data": {
    "wine": { /* wine object */ },
    "user": { /* user object */ }
  },
  "signature": "sha256=abc123..." // HMAC signature
}
```

### Events
- `wine.added` - New wine added to collection
- `battle.completed` - Battle finished
- `trade.completed` - Trade completed
- `achievement.unlocked` - New achievement
- `guild.event` - Guild event occurred

---

## Support

**Documentation**: https://docs.wine-pokedx.app  
**Status Page**: https://status.wine-pokedx.app  
**Support**: support@wine-pokedx.app  
**Discord**: https://discord.gg/wine-pokedx

**GitHub**: https://github.com/wine-pokedx/api  
**Changelog**: https://github.com/wine-pokedx/api/releases