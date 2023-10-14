# Social Network 3.0
About A decentralized social network application that allows users to post small snippets of text data to the blockchain.

## Prerequisites
- Node: v20.5.0
- Yarn: 3.6.4

## Getting Started

**1\. Clone the Project**

```
git clone git@github.com:yk-saito/social-network-3.0.git
```

**2\. Install Dependencies**

Navigate to the cloned project and install the dependencies.

```
yarn
```

**3\. Deploy Smart Contract**

Deploy to `Sepolia` testnet.

Copy the `.env.example` file located in the `packages/contract` directory and create a `.env` file.

- ETHERSCAN_API_KEY: [Getting an API key - Etherscan](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics)
- ALCHEMY_SEPOLIA_HTTPS: [How to Deploy a Smart Contract to the Sepolia Testnet - Web3 University](https://www.web3.university/article/how-to-deploy-a-smart-contract-to-the-sepolia-testnet)
- PRIVATE_KEY: [How to export an account's private key - MetaMask](https://support.metamask.io/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key#:~:text=On%20the%20'Account%20details'%20page,to%20display%20your%20private%20key.)

Run the following command to deploy the contract:

```
yarn contract deploy:sepolia
```

Expected display:

```
Deploying contracts with account:  YOUR_ACCOUNT_ADDRESS
Account balance:  6889445448797036090
Contract deployed to:  0x8bd4c052CeDb19330a508369E519e48153e8CBD9
```

**4\. Starting the Client**

Copy the `.env.example` file from the `packages/client` directory and create a `.env.local` file.

Set with the address of the contract you just deployed.

e.g.

```
REACT_APP_CONTRACT_ADDRESS=0x8bd4c052CeDb19330a508369E519e48153e8CBD9
```

Run the next command to start the client:

```
yarn client start
```

Expected display:

```bash
Compiled successfully!

You can now view web in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.11.8:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

Let's access [http://localhost:3000](http://localhost:3000) !
