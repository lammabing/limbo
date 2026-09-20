# API Documentation - Limbo Game

This document provides detailed information about the Limbo Game REST API endpoints.

## Base URL

```
http://localhost:3145
```

**Note:** The default port is `3145`. You can change it by setting the `PORT` environment variable.

## Authentication

The API does not require authentication for local development. In production, consider implementing appropriate authentication mechanisms.

## Endpoints

### POST /play

Place a bet and get the game result.

**URL:** `/play`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": "number",
  "betAmount": "number",
  "targetMultiplier": "number"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientSeed` | string | Yes | Client-provided seed for provably fair system |
| `serverSeed` | string | Yes | Server-provided seed for provably fair system |
| `nonce` | number | Yes | Unique counter for each bet |
| `betAmount` | number | Yes | Amount to bet |
| `targetMultiplier` | number | Yes | Target multiplier for winning |

**Response:**

**Success Response (200 OK):**

```json
{
  "success": true,
  "multiplier": 2.45,
  "won": true,
  "profit": 145,
  "clientSeed": "clientSeed123",
  "serverSeed": "serverSeed456",
  "nonce": 1
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `multiplier` | number | The generated multiplier for this round |
| `won` | boolean | Whether the bet was a win |
| `profit` | number | Profit/loss from this bet |
| `clientSeed` | string | Client seed used |
| `serverSeed` | string | Server seed used |
| `nonce` | number | Nonce used for this bet |

**Error Responses:**

**400 Bad Request - Missing Parameters:**
```json
{
  "error": "Missing required parameters"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

### POST /generateSeeds

Generate new client and server seeds for a game session.

**URL:** `/generateSeeds`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:** None

**Response:**

**Success Response (200 OK):**

```json
{
  "success": true,
  "clientSeed": "aB3dE5gH7jK9mN1pQ3sT5vW7yZ2bD4fH",
  "serverSeed": "xY9wV7uT5sR3qP1oN9mL7kJ5iH3gF1eD"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `clientSeed` | string | Generated client seed (32 characters) |
| `serverSeed` | string | Generated server seed (32 characters) |

**Error Responses:**

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

### POST /verify

Verify a game result for fairness by recalculating the multiplier.

**URL:** `/verify`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": "number",
  "expectedMultiplier": "number"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientSeed` | string | Yes | Client seed used in the game |
| `serverSeed` | string | Yes | Server seed used in the game |
| `nonce` | number | Yes | Nonce used in the game |
| `expectedMultiplier` | number | Yes | The multiplier to verify |

**Response:**

**Success Response (200 OK):**

```json
{
  "success": true,
  "isValid": true,
  "calculatedMultiplier": 2.45,
  "expectedMultiplier": 2.45
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `isValid` | boolean | Whether the expected multiplier matches the calculated one |
| `calculatedMultiplier` | number | Multiplier calculated from seeds |
| `expectedMultiplier` | number | Multiplier that was expected |

**Error Responses:**

**400 Bad Request - Missing Parameters:**
```json
{
  "error": "Missing required parameters"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

### POST /getSeeds

Get seed information for verification purposes.

**URL:** `/getSeeds`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "clientSeed": "string",
  "serverSeed": "string",
  "nonce": "number"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientSeed` | string | Yes | Client seed |
| `serverSeed` | string | Yes | Server seed |
| `nonce` | number | Yes | Nonce value |

**Response:**

**Success Response (200 OK):**

```json
{
  "success": true,
  "seedInfo": {}
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `seedInfo` | object | Seed information (implementation dependent) |

**Error Responses:**

**400 Bad Request - Missing Parameters:**
```json
{
  "error": "Missing required parameters"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Static Routes

### GET /

Serves the main game interface (index.html).

**URL:** `/`

**Method:** `GET`

**Response:** HTML page

---

### GET /verifier

Serves the bet verifier interface (verifier.html).

**URL:** `/verifier`

**Method:** `GET`

**Response:** HTML page

---

## Crypto Provider Configuration

The game supports multiple cryptographic implementations. You can switch between them using the `CRYPTO_PROVIDER` environment variable:

| Provider | Value | Description |
|----------|-------|-------------|
| BCH (Default) | `bch` | Original BCH implementation with 2% house edge |
| Bustadice | `bustadice` | Alternative Bustadice implementation |
| Stake | `stake` | Stake.com implementation |

**Usage:**

```bash
# Start with BCH provider (default)
npm start

# Start with Bustadice provider
CRYPTO_PROVIDER=bustadice npm start

# Start with Stake provider
CRYPTO_PROVIDER=stake npm start
```

---

## Provably Fair Algorithm

The game uses a provably fair system based on HMAC-SHA256 hashing.

### How It Works

1. **Seed Generation**: Client and server seeds are generated
2. **Nonce**: A counter increments with each bet
3. **Hash Generation**: HMAC-SHA256 hash is created from seeds and nonce
4. **Multiplier Calculation**: Hash is converted to a multiplier

### Formula (BCH Provider)

```javascript
// Generate HMAC-SHA256 hash
const hmac = crypto.createHmac('sha256', serverSeed);
hmac.update(`${clientSeed}:${nonce}:${currentRound}`);
const buffer = hmac.digest();

// Convert to float
const float = bytesToFloat(buffer);

// Calculate multiplier
const m = 100_000_000;
const n = Math.floor(float * m) + 1;
const crashPoint = Math.max((m / n) * (1 - houseEdge), 1);

return Math.floor(crashPoint * 100) / 100;
```

**House Edge:** 2% (0.02)

---

## Error Handling

All API endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Missing or invalid parameters
- **500 Internal Server Error**: Server-side errors

Error responses include an `error` field with a descriptive message.

---

## Rate Limiting

Currently, the API does not implement rate limiting. For production deployments, consider implementing rate limiting to prevent abuse.

---

## CORS

The API serves static files from the same origin. For cross-origin requests, configure CORS in the Express server.

---

## Example Usage

### JavaScript (Fetch API)

```javascript
// Place a bet
const response = await fetch('/play', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clientSeed: 'myClientSeed',
    serverSeed: 'myServerSeed',
    nonce: 1,
    betAmount: 100,
    targetMultiplier: 2.0
  })
});

const result = await response.json();
console.log(result);
```

### cURL

```bash
# Generate seeds
curl -X POST http://localhost:3145/generateSeeds

# Place a bet
curl -X POST http://localhost:3145/play \
  -H "Content-Type: application/json" \
  -d '{
    "clientSeed": "myClientSeed",
    "serverSeed": "myServerSeed",
    "nonce": 1,
    "betAmount": 100,
    "targetMultiplier": 2.0
  }'

# Verify a bet
curl -X POST http://localhost:3145/verify \
  -H "Content-Type: application/json" \
  -d '{
    "clientSeed": "myClientSeed",
    "serverSeed": "myServerSeed",
    "nonce": 1,
    "expectedMultiplier": 2.45
  }'
```

---

## Support

For questions or issues, please create an issue on the GitHub repository.
