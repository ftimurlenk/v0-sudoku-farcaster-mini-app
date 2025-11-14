# Smart Contract Deployment Guide

This guide explains how to deploy the SudokuScore smart contract to Base Network.

## Prerequisites

1. A wallet with Base ETH for gas fees
2. Your wallet's private key
3. Remix IDE, Hardhat, or Foundry for compilation and deployment

## Option 1: Deploy with Remix (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `SudokuScore.sol` and paste the contract code from `contracts/SudokuScore.sol`
3. Compile the contract:
   - Click on "Solidity Compiler" tab
   - Select compiler version `0.8.20` or higher
   - Click "Compile SudokuScore.sol"
4. Deploy the contract:
   - Click on "Deploy & Run Transactions" tab
   - Change environment to "Injected Provider - MetaMask"
   - Make sure MetaMask is connected to Base Network
     - Base Mainnet RPC: `https://mainnet.base.org`
     - Base Sepolia Testnet RPC: `https://sepolia.base.org`
     - Chain ID: 8453 (mainnet) or 84532 (sepolia)
   - Click "Deploy"
   - Confirm the transaction in MetaMask
5. Copy the deployed contract address
6. Update `lib/score-contract.ts`:
   \`\`\`typescript
   export const SUDOKU_SCORE_CONTRACT_ADDRESS = '0xYourContractAddress' as `0x${string}`
   \`\`\`

## Option 2: Deploy with Hardhat

1. Install dependencies:
   \`\`\`bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   \`\`\`

2. Initialize Hardhat:
   \`\`\`bash
   npx hardhat init
   \`\`\`

3. Configure `hardhat.config.js`:
   \`\`\`javascript
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.8.20",
     networks: {
       baseSepolia: {
         url: "https://sepolia.base.org",
         accounts: [process.env.DEPLOYER_PRIVATE_KEY]
       },
       base: {
         url: "https://mainnet.base.org",
         accounts: [process.env.DEPLOYER_PRIVATE_KEY]
       }
     }
   };
   \`\`\`

4. Create deployment script `scripts/deploy.js`:
   \`\`\`javascript
   async function main() {
     const SudokuScore = await ethers.getContractFactory("SudokuScore");
     const contract = await SudokuScore.deploy();
     await contract.waitForDeployment();
     console.log("Contract deployed to:", await contract.getAddress());
   }
   
   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   \`\`\`

5. Deploy:
   \`\`\`bash
   # For testnet
   npx hardhat run scripts/deploy.js --network baseSepolia
   
   # For mainnet
   npx hardhat run scripts/deploy.js --network base
   \`\`\`

## Option 3: Deploy with Foundry

1. Install Foundry:
   \`\`\`bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   \`\`\`

2. Initialize Foundry project:
   \`\`\`bash
   forge init
   \`\`\`

3. Copy contract to `src/SudokuScore.sol`

4. Deploy:
   \`\`\`bash
   # For testnet
   forge create --rpc-url https://sepolia.base.org \
     --private-key $DEPLOYER_PRIVATE_KEY \
     src/SudokuScore.sol:SudokuScore
   
   # For mainnet
   forge create --rpc-url https://mainnet.base.org \
     --private-key $DEPLOYER_PRIVATE_KEY \
     src/SudokuScore.sol:SudokuScore
   \`\`\`

## Network Information

### Base Mainnet
- RPC URL: `https://mainnet.base.org`
- Chain ID: `8453`
- Block Explorer: https://basescan.org

### Base Sepolia (Testnet)
- RPC URL: `https://sepolia.base.org`
- Chain ID: `84532`
- Block Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## After Deployment

1. Copy the deployed contract address
2. Update `SUDOKU_SCORE_CONTRACT_ADDRESS` in `lib/score-contract.ts`
3. Verify the contract on Basescan (optional but recommended):
   - Go to Basescan
   - Search for your contract address
   - Click "Verify and Publish"
   - Enter contract details and source code

## Testing the Contract

After deployment, you can test the contract functions:

1. Connect your wallet in the app
2. Complete a Sudoku puzzle
3. Click "Save to Blockchain"
4. Check the transaction on Basescan
5. View the leaderboard to see your score

## Gas Costs (Approximate)

- Contract Deployment: ~0.001 ETH
- Save Score: ~0.0001 ETH per transaction
- View Leaderboard: Free (read-only)

## Troubleshooting

- **Insufficient funds**: Make sure you have enough Base ETH for gas
- **Wrong network**: Verify you're connected to Base Network
- **Transaction failed**: Check gas limit and contract address
- **Contract not found**: Verify the contract address in `lib/score-contract.ts`
