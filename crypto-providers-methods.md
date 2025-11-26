# Cryptographic Methods of Game Providers

This document provides a detailed analysis of the cryptographic procedures, mathematics, and methods used by three game providers: BCH, Bustadice, and Stake.

## 1. Bitcoin Cash (BCH) Method

### Procedure
1. **Seed Generation**: The algorithm uses a client seed and server seed, both 32 characters long by default.
2. **HMAC Generation**: Creates an HMAC-SHA256 hash using the server seed as the key and the concatenated string `clientSeed:nonce:currentRound` as the message.
3. **Byte Generation**: Implements a generator function that yields bytes from the HMAC digest, allowing for continued generation of bytes across multiple rounds if needed.
4. **Float Generation**: Converts 4 bytes at a time to a floating point value between 0 and 1 by treating each byte as a fractional part of the number.
5. **Multiplier Calculation**: Uses the formula to convert the float to a multiplier with a house edge of 2%.

### Mathematics
- **Float Conversion**: The float is calculated as:
  ```
  float = sum(byte[i] / 256^(i+1)) for i = 0 to 3
  ```
  This generates a uniformly distributed random number in the range [0, 1).
- **Multiplier Formula**: 
  ```
  m = 100,000,000
  n = floor(float * m) + 1
  crashPoint = max((m / n) * (1 - houseEdge), 1)
  multiplier = floor(crashPoint * 100) / 100
  ```
  With houseEdge = 0.02 (2%), ensuring the minimum multiplier is 1.

### Cryptography
- **Algorithm**: HMAC-SHA256
- **Key**: Server seed
- **Message**: Concatenated string of client seed, nonce, and current round number
- **Output**: 32-byte buffer (not hexadecimal) used to generate the random float value
- **Byte Processing**: Individual byte values (0-255) from the buffer are used directly in float calculation

## 2. Bustadice Method

### Procedure
1. **Server Seed Structure**: The server seed is split into two parts - an audit seed and a game seed, each 16 characters, concatenated with an underscore.
2. **Wager Hash Generation**: Creates an HMAC hash using the audit seed and the nonce.
3. **Combined Hash**: Creates another HMAC hash using the concatenated string of game seed, client seed, and nonce as the key, with the wager hash as the message.
4. **Hash Truncation**: Takes the first 13 characters (52/4) of the resulting hash.
5. **Multiplier Calculation**: Converts the truncated hash to an integer and calculates the multiplier using the formula 99/(1-X) where X is the normalized hash value.

### Mathematics
- **Normalization**: 
  ```
  X = parseInt(hash, 16) / 2^52
  ```
  This creates a uniformly distributed value in the range [0, 1).
- **Multiplier Formula**:
  ```
  multiplier = floor(99 / (1 - X)) / 100
  ```
  Ensures the multiplier is between 1.01 and 9900.
- **Edge Cases**: If multiplier <= 1, it's set to 1.01 to ensure minimum payout.

### Cryptography
- **Algorithm**: HMAC-SHA256
- **Step 1**: Key = auditSeed, Message = nonce
- **Step 2**: Key = gameSeed|clientSeed|nonce, Message = wagerHash
- **Output**: Final hash used to generate the multiplier with a uniform distribution

## 3. Stake Method

### Procedure
1. **Server Seed Structure**: Similar to Bustadice, the server seed is split into two parts - an audit seed and a game seed (16 characters each).
2. **Wager Hash Generation**: Creates an HMAC hash using the audit seed and the nonce.
3. **Combined Hash**: Creates another HMAC hash using the concatenated string of game seed, client seed, and nonce as the key, with the wager hash as the message.
4. **Hash Truncation**: Takes the first 13 characters (52/4) of the resulting hash.
5. **Multiplier Calculation**: Converts the truncated hash to an integer and calculates the multiplier using the same formula as Bustadice.

### Mathematics
- **Normalization**: 
  ```
  X = parseInt(hash, 16) / 2^52
  ```
  This creates a uniformly distributed value in the range [0, 1).
- **Multiplier Formula**:
  ```
  multiplier = floor(99 / (1 - X)) / 100
  ```
  Ensures the multiplier is between 1.01 and 9900.
- **Edge Cases**: If multiplier <= 1, it's set to 1.01 to ensure minimum payout.

### Cryptography
- **Algorithm**: HMAC-SHA256
- **Step 1**: Key = auditSeed, Message = nonce
- **Step 2**: Key = gameSeed|clientSeed|nonce, Message = wagerHash
- **Output**: Final hash used to generate the multiplier with a uniform distribution

## Comparison of Methods

### Key Differences
1. **BCH Method**:
   - Uses a 2% house edge
   - Generates random values using bytes directly from the HMAC
   - Has a minimum multiplier of 1.00x

2. **Bustadice Method**:
   - Has a variable multiplier range from 1.01x to 9900x
   - Uses a two-part server seed (audit and game seeds)
   - Uses a normalization based on 2^52 possible values

3. **Stake Method**:
   - Identical to Bustadice in all mathematical aspects
   - The implementation differs only in documentation and structure

### Commonalities
- All methods use HMAC-SHA256 as the core cryptographic function
- All use a combination of client seed, server seed, and nonce
- All are designed to be provably fair
- All ensure uniform distribution of outcomes