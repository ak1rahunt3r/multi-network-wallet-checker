import '../utils/common.js'
import {readWallets, getBalance, timestampToDate} from '../utils/common.js'
import axios from "axios"
import { Table } from 'console-table-printer'
import { createObjectCsvWriter } from 'csv-writer'
import moment from 'moment'
import cliProgress from 'cli-progress'

const csvWriter = createObjectCsvWriter({
    path: './results/aptos.csv',
    header: [
        { id: 'n', title: '№'},
        { id: 'wallet', title: 'wallet'},
        { id: 'APT', title: 'APT'},
        { id: 'USDC', title: 'USDC'},
        { id: 'USDT', title: 'USDT'},
        { id: 'DAI', title: 'DAI'},
        { id: 'TX Count', title: 'TX Count'},
        { id: 'Days', title: 'Days'},
        { id: 'Weeks', title: 'Weeks'},
        { id: 'Months', title: 'Months'},
        { id: 'First tx', title: 'First tx'},
        { id: 'Last tx', title: 'Last tx'},
        { id: 'Total gas spent', title: 'Total gas spent'}
    ]
})

const p = new Table({
    columns: [
        { name: 'n', color: 'green', alignment: "right"},
        { name: 'wallet', color: 'green', alignment: "right"},
        { name: 'APT', alignment: 'right', color: 'cyan'},
        { name: 'USDC', alignment: 'right', color: 'cyan'},
        { name: 'USDT', alignment: 'right', color: 'cyan'},
        { name: 'DAI', alignment: 'right', color: 'cyan'},
        { name: 'TX Count', alignment: 'right', color: 'cyan'},
        { name: 'Days', alignment: 'right', color: 'cyan'},
        { name: 'Weeks', alignment: 'right', color: 'cyan'},
        { name: 'Months', alignment: 'right', color: 'cyan'},
        { name: 'First tx', alignment: 'right', color: 'cyan'},
        { name: 'Last tx', alignment: 'right', color: 'cyan'},
        { name: 'Total gas spent', alignment: 'right', color: 'cyan'},
    ],
    sort: (row1, row2) => +row1.n - +row2.n
})

const apiUrl = "https://api.apscan.io"

let stats = []
let jsonData = []
const filterSymbol = ['APT', 'USDT', 'USDC', 'DAI']

async function getBalances(wallet) {
    filterSymbol.forEach(symbol => {
        stats[wallet].balances[symbol] = 0
    })

    try {
        await axios.get(apiUrl+'/accounts?address=eq.'+wallet).then(response => {
            if (response.data.length) {
                let balances = response.data[0].all_balances

                Object.values(balances).forEach(balance => {
                    if (balance.coin_info) {
                        if (filterSymbol.includes(balance.coin_info.symbol)) {
                            stats[wallet].balances[balance.coin_info.symbol] = getBalance(balance.balance, balance.coin_info.decimals)
                        }
                    }
                })
            }
        }).catch()
    } catch (e) {
        return e.toString()
    }
}

async function getTxs(wallet) {
    const uniqueDays = new Set()
    const uniqueWeeks = new Set()
    const uniqueMonths = new Set()

    let totalGasUsed = 0
    let txs = []
    let startRange = 0, endRange = 50
    let isAllTxCollected = false

    while (!isAllTxCollected) {
        try {
            await axios.get(apiUrl + '/user_transactions?sender=eq.' + wallet, {
                headers: {
                    range: `${startRange}-${endRange}`
                }
            }).then(response => {
                let items = response.data
                if (items.length) {
                    Object.values(items).forEach(tx => {
                        txs.push(tx)
                    })
                    startRange = startRange + 50
                    endRange = endRange + 50
                } else {
                    isAllTxCollected = true
                }
            }).catch()
        } catch (e) {
            return e.toString()
        }
    }

    stats[wallet].txcount = txs.length

    Object.values(txs).forEach(tx => {
        const date = new Date(timestampToDate(tx.time_microseconds / 1000000))
        uniqueDays.add(date.toDateString())
        uniqueWeeks.add(date.getFullYear() + '-' + date.getWeek())
        uniqueMonths.add(date.getFullYear() + '-' + date.getMonth())
        totalGasUsed += parseInt(tx.gas_used) / Math.pow(10, 6)
    })

    const numUniqueDays = uniqueDays.size
    const numUniqueWeeks = uniqueWeeks.size
    const numUniqueMonths = uniqueMonths.size

    if (txs.length) {
        stats[wallet].first_tx_date = new Date(timestampToDate(txs[txs.length - 1].time_microseconds / 1000000))
        stats[wallet].last_tx_date = new Date(timestampToDate(txs[0].time_microseconds / 1000000))
        stats[wallet].unique_days = numUniqueDays
        stats[wallet].unique_weeks = numUniqueWeeks
        stats[wallet].unique_months = numUniqueMonths
        stats[wallet].total_gas = totalGasUsed
    }
}

async function fetchWallet(wallet, index) {
    wallet = wallet.replace('0x0', '0x')

    stats[wallet] = {
        balances: []
    }

    await getBalances(wallet)
    await getTxs(wallet)
    progressBar.update(iteration)
    let usdAptValue = (stats[wallet].balances['APT']*aptPrice).toFixed(2)
    let usdGasValue = (stats[wallet].total_gas*aptPrice).toFixed(2)
    let row = {
        n: index,
        wallet: wallet,
        'APT': stats[wallet].balances['APT'].toFixed(2) + ` ($${usdAptValue})`,
        'USDC': stats[wallet].balances['USDC'].toFixed(2),
        'USDT': stats[wallet].balances['USDT'].toFixed(2),
        'DAI': stats[wallet].balances['DAI'].toFixed(2),
        'TX Count': stats[wallet].txcount,
        'Days': stats[wallet].unique_days,
        'Weeks': stats[wallet].unique_weeks,
        'Months': stats[wallet].unique_months,
        'First tx': moment(stats[wallet].first_tx_date).format("DD.MM.YY"),
        'Last tx': moment(stats[wallet].last_tx_date).format("DD.MM.YY"),
        'Total gas spent': stats[wallet].total_gas ? stats[wallet].total_gas.toFixed(4)  + ` ($${usdGasValue})` : 0
    }

    p.addRow(row)
    jsonData.push({
        n: index,
        wallet: wallet,
        'APT': stats[wallet].balances['APT'].toFixed(2),
        'APT USDVALUE': usdAptValue,
        'USDC': stats[wallet].balances['USDC'].toFixed(2),
        'USDT': stats[wallet].balances['USDT'].toFixed(2),
        'DAI': stats[wallet].balances['DAI'].toFixed(2),
        'TX Count': stats[wallet].txcount,
        'Days': stats[wallet].unique_days ?? 0,
        'Weeks': stats[wallet].unique_weeks ?? 0,
        'Months': stats[wallet].unique_months ?? 0,
        'First tx': stats[wallet].txcount ? stats[wallet].first_tx_date : '—',
        'Last tx': stats[wallet].txcount ? stats[wallet].last_tx_date : '—',
        'Total gas spent': stats[wallet].total_gas ? stats[wallet].total_gas.toFixed(4) : 0,
        'Total gas spent USDVALUE': stats[wallet].total_gas ? usdGasValue : 0
    })

    iteration++
}

let aptPrice = 0
await axios.get('https://min-api.cryptocompare.com/data/price?fsym=APT&tsyms=USD').then(response => {
    aptPrice = response.data.USD
})

let wallets = readWallets('./addresses/aptos.txt')
let iterations = wallets.length
let iteration = 1
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

function fetchWallets() {
    const walletPromises = wallets.map((account, index) => fetchWallet(account, index+1))
    return Promise.all(walletPromises)
}

async function saveToCsv() {
    let csvData = []
    p.table.rows.map((row) => {
        csvData.push(row.text)
    })

    csvData.sort((a, b) => a.n - b.n)

    csvWriter.writeRecords(csvData).then().catch()
}

export async function aptosFetchDataAndPrintTable() {
    progressBar.start(iterations, 0)
    await fetchWallets()
    await saveToCsv()
    progressBar.stop()
    p.printTable()
}

export async function aptosData() {
    wallets = readWallets('./addresses/aptos.txt')
    jsonData = []
    await fetchWallets()
    await saveToCsv()

    return jsonData
}