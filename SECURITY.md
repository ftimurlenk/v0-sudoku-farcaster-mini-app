# Security Implementation for Sudoku Leaderboard

This document explains how the leaderboard is protected from manipulation.

## Architecture

The leaderboard uses a three-layer security system:

### 1. Farcaster Authentication
- Users must authenticate with Farcaster Quick Auth before submitting scores
- JWT tokens are issued by Farcaster's auth server
- Ensures only verified Farcaster users can submit scores

### 2. Backend Validation
- All game completions are validated server-side (`/api/validate-score`)
- Validates:
  - Farcaster JWT token authenticity
  - Sudoku solution correctness
  - Score calculation accuracy
  - Reasonable completion times (anti-cheat)
  - Puzzle integrity (original numbers preserved)
- Backend signs validated scores with a private key

### 3. Smart Contract Verification
- Contract only accepts scores with valid signatures from the validator wallet
- Uses ECDSA signature verification (ecrecover)
- Prevents replay attacks with unique game IDs
- Only the validator wallet can approve score submissions

## Deployment Steps

### Step 1: Generate Validator Wallet

\`\`\`bash
# Generate a new wallet for the validator
# Save the private key securely - this will sign all valid scores
\`\`\`

### Step 2: Deploy Smart Contract

Deploy `contracts/SudokuScore.sol` to Base Network:

1. Deploy the contract
2. Note the contract address
3. Call `setValidator(validatorAddress)` with your validator wallet's address
4. Update `NEXT_PUBLIC_SUDOKU_CONTRACT_ADDRESS` in your environment variables

### Step 3: Configure Environment Variables

\`\`\`bash
# Set in Vercel or your hosting platform
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
VALIDATOR_PRIVATE_KEY=0x... # Validator wallet private key
NEXT_PUBLIC_SUDOKU_CONTRACT_ADDRESS=0x... # Deployed contract address
\`\`\`

### Step 4: Update Farcaster Manifest

Update `public/.well-known/farcaster.json` with your production domain.

## Attack Prevention

### Prevented Attack Vectors

1. **Direct Contract Calls**: ❌ Blocked
   - Users cannot call `saveScore()` directly
   - Contract rejects any score without a valid validator signature

2. **Score Manipulation**: ❌ Blocked
   - Backend recalculates and verifies scores
   - Mismatched scores are rejected

3. **Solution Faking**: ❌ Blocked
   - Backend validates the entire Sudoku solution
   - Checks rows, columns, and 3x3 boxes

4. **Speed Hacking**: ❌ Blocked
   - Minimum completion times enforced per difficulty
   - Suspiciously fast times are rejected

5. **Replay Attacks**: ❌ Blocked
   - Each game has a unique gameId
   - Contract tracks used gameIds
   - Same game cannot be submitted twice

6. **Identity Spoofing**: ❌ Blocked
   - Farcaster JWT tokens verified on backend
   - Only authenticated Farcaster users can submit

## Security Best Practices

1. **Keep Validator Key Secure**
   - Store in environment variables only
   - Never commit to Git
   - Rotate if compromised

2. **Monitor Contract**
   - Watch for unusual activity
   - Can update validator address if needed

3. **Rate Limiting**
   - Consider adding rate limits to API endpoints
   - Prevent spam attacks

4. **Audit Trail**
   - All score submissions emit events
   - Can track and investigate suspicious activity

## Contract Functions

### Public Functions
- `getLeaderboard()` - View top 10 scores
- `getPlayerBestScore(address)` - View player's best score
- `getPlayerScores(address)` - View all player scores
- `saveScore()` - Submit score (requires signature)

### Admin Functions
- `setValidator(address)` - Update validator address (owner only)

## Conclusion

This multi-layer approach ensures that:
- Only legitimate game completions are recorded
- Scores cannot be manipulated
- The leaderboard represents real achievements
- The system is resistant to common attack vectors
