import ethers from "ethers"
import {getNativeToken, readWallets} from "../utils/common.js"
import axios from "axios"
import {Table} from "console-table-printer"
import {createObjectCsvWriter} from "csv-writer"


let columns = [
    { name: 'n', alignment: 'left', color: 'green'},
    { name: 'wallet', color: 'green', alignment: "right"},
    { name: 'native', alignment: 'right', color: 'cyan'},
    { name: 'usd', alignment: 'right', color: 'cyan'},
    { name: 'USDT', alignment: 'right', color: 'cyan'},
    { name: 'USDC', alignment: 'right', color: 'cyan'},
    { name: 'DAI', alignment: 'right', color: 'cyan'},
]

let headers = [
    { id: 'n', title: 'n'},
    { id: 'wallet', title: 'wallet'},
    { id: 'native', title: 'native'},
    { id: 'usd', title: 'usd'},
    { id: 'USDT', title: 'USDT'},
    { id: 'USDC', title: 'USDC'},
    { id: 'DAI', title: 'DAI'},
]

const priceApi = 'https://min-api.cryptocompare.com/data/price'
const networks = {
    'ETH': {
        provider: new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com'),
        'nativePrice': await axios.get(priceApi+'?fsym=ETH&tsyms=USD').then(r => { return r.data.USD}),
        'USDT': {
            address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
            decimals: 6
        },
        'USDC': {
            address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            decimals: 18
        },
        'DAI': {
            address: '0x6b175474e89094c44da98b954eedeac495271d0f',
            decimals: 18
        }
    },
    'Arbitrum': {
        provider: new ethers.providers.JsonRpcProvider('https://arbitrum.llamarpc.com'),
        'nativePrice': await axios.get(priceApi+'?fsym=ETH&tsyms=USD').then(r => { return r.data.USD}),
        'USDT': {
            address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            decimals: 6
        },
        'USDC': {
            address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            decimals: 18
        },
        'USDC.e': {
            address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
            decimals: 6
        },
        'DAI': {
            address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            decimals: 18
        }
    },
    'Optimism': {
        provider: new ethers.providers.JsonRpcProvider('https://optimism.llamarpc.com'),
        'nativePrice': await axios.get(priceApi+'?fsym=ETH&tsyms=USD').then(r => { return r.data.USD}),
        'USDT': {
            address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
            decimals: 6
        },
        'USDC': {
            address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
            decimals: 18
        },
        'DAI': {
            address: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
            decimals: 18
        }
    },
    'Polygon': {
        provider: new ethers.providers.JsonRpcProvider('https://polygon.llamarpc.com'),
        'USDT': {
            address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
            decimals: 6
        },
        'USDC': {
            address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
            decimals: 18
        },
        'DAI': {
            address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            decimals: 18
        },
        'nativePrice': await axios.get(priceApi+'?fsym=MATIC&tsyms=USD').then(r => { return r.data.USD})
    },
    'BSC': {
        provider: new ethers.providers.JsonRpcProvider('https://binance.llamarpc.com'),
        'USDT': {
            address: '0x55d398326f99059ff775485246999027b3197955',
            decimals: 18
        },
        'USDC': {
            address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
            decimals: 18
        },
        'DAI': {
            address: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
            decimals: 18
        },
        'nativePrice': await axios.get(priceApi+'?fsym=BNB&tsyms=USD').then(r => { return r.data.USD})
    },
    'Avalanche': {
        provider: new ethers.providers.JsonRpcProvider('https://avax.meowrpc.com'),
        'USDT': {
            address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
            decimals: 6
        },
        'USDC': {
            address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
            decimals: 18
        },
        'USDC.e': {
            address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
            decimals: 18
        },
        'DAI': {
            address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
            decimals: 18
        },
        'nativePrice': await axios.get(priceApi+'?fsym=AVAX&tsyms=USD').then(r => { return r.data.USD})
    },
    'Base': {
        provider: new ethers.providers.JsonRpcProvider('https://base.meowrpc.com'),
        'USDT': {
            address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
            decimals: 18
        },
        'USDC': {
            address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
            decimals: 6
        },
        'nativePrice': await axios.get(priceApi+'?fsym=ETH&tsyms=USD').then(r => { return r.data.USD})
    },
    'Core': {
        provider: new ethers.providers.JsonRpcProvider('https://rpc.coredao.org'),
        'USDT': {
            address: '0x900101d06a7426441ae63e9ab3b9b0f63be145f1',
            decimals: 6
        },
        'USDC': {
            address: '0xa4151b2b3e269645181dccf2d426ce75fcbdeca9',
            decimals: 6
        },
        'nativePrice': await axios.get(priceApi+'?fsym=CORE&tsyms=USD').then(r => { return r.data.USD})
    }
}

let wallets = readWallets('./addresses/evm.txt')
let walletsData = []
let csvData = []
let stables = ['USDT', 'USDC', 'USDC.e', 'DAI']
const p = new Table({
    columns: columns
})

async function fetchWallet(wallet, index, network) {
    let nativeBalance = 0

    try {
        const nativeBalanceWei = await networks[network].provider.getBalance(wallet)
        nativeBalance = parseInt(nativeBalanceWei)  / Math.pow(10, 18)
    } catch (e) {}

    let walletData = {
        n: index,
        wallet: wallet,
        native: nativeBalance.toFixed(3),
        usd: nativeBalance > 0 ? (nativeBalance * networks[network].nativePrice).toFixed(2) : 0
    }

    walletData['USDC'] = 0
    walletData['USDC.e'] = 0
    walletData['USDT'] = 0
    walletData['DAI'] = 0

    try {
        for (const stable of stables) {
            if (networks[network][stable]) {
                let tokenContract = new ethers.Contract(networks[network][stable].address, ['function balanceOf(address) view returns (uint256)'], networks[network].provider)
                let balance = await tokenContract.balanceOf(wallet)
                walletData[stable] = parseInt(balance) / Math.pow(10, networks[network][stable].decimals)
                walletData[stable] = walletData[stable] > 0 ? walletData[stable].toFixed(2) : 0
            }
        }

        walletData['USDC'] = parseFloat(walletData['USDC']) + parseFloat(walletData['USDC.e'])
        delete walletData['USDC.e']
    } catch (e) {}

    walletsData.push(walletData)
}

async function fetchWallets(network) {
    const walletPromises = wallets.map((account, index) => fetchWallet(account, index+1, network))
    return Promise.all(walletPromises)
}

async function collectData(network) {
    if (!network) {
        network = 'ETH'
    }
    walletsData = []
    csvData = []
    await fetchWallets(network)

    let totalRow = {
        native: 0,
        usd: 0,
        USDT: 0,
        USDC: 0,
        DAI: 0,
    }

    walletsData.forEach((obj) => {
        for (const key in totalRow) {
            totalRow[key] += parseFloat(obj[key]) || 0
        }
        obj.native = obj.native  + ' ' + getNativeToken(network)
    })

    for (const key in totalRow) {
        totalRow[key] = totalRow[key] > 0 ? parseFloat(totalRow[key]).toFixed(key === 'native' ? 3 : 2) : 0
    }

    totalRow.native = totalRow.native  + ' ' + getNativeToken(network)

    totalRow.n = wallets.length+1
    totalRow.wallet = 'TOTAL'

    walletsData.push(totalRow)

    columns.push({
        name: network, alignment: "right", color: 'cyan'
    })

    headers.push({
        id: network, title: network
    })

    walletsData.sort((a, b) => a.n - b.n)

    p.addRows(walletsData)

    p.table.rows.map((row) => {
        csvData.push(row.text)
    })
}

async function saveToCsv(network) {
    const csvWriter = createObjectCsvWriter({
        path: `./results/balances_${network}.csv`,
        header: headers
    })

    csvWriter.writeRecords(csvData).then().catch()
}

export async function balancesFetchDataAndPrintTable(network) {
    await collectData(network)

    p.printTable()
    await saveToCsv(network)
}

export async function balancesData(network) {
    wallets = readWallets('./addresses/evm.txt')
    walletsData = []
    await collectData(network)
    await saveToCsv(network)
    return walletsData
}