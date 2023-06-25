const ccxt = require('ccxt')
const moment = require('moment')
const delay = require('delay')
// const { toArray } = require('ccxt/js/src/base/functions')

const binance = new ccxt.binance({
        'apiKey': 'HNpqCokaWlzrcNa22uN7mMe0hNPzM2zd2GCBjETV1yPPmJo8hBd1CGxuywgO8SWc',
        'secret': '5Sw3g1wDYZ9nyfaAkdtMfnkg2sPamX4Tae9u6Y8YtkA99TWOOp7ofQyeUMrLizZk',
})
binance.setSandboxMode(true)
var lastBuy = 20
var totalBuy = 0.0
const multi = 1.05
var currentBuy = 0.0
var totalUnit = 0.0
var currentPrice = 0.0
var lastPrice = 0.0
var totalAsset = 0
var currentAsset = 0
var i = 0
async function job() {
    // console.log('total asset: ', totalAsset)
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    const price = await binance.fetchOHLCV('APE/BUSD', '1s', undefined, 1)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    var currentUnit = 0.0
    if ((currentPrice*totalUnit*0.999 - totalBuy*1001) > (totalBuy)*1.002){
        direction = 'sell'
        currentUnit = totalUnit
    }
    else {
        if ((totalBuy < 10000.0) && ((currentPrice - lastPrice)/lastPrice) < -0.001) {
            direction = 'buy'
            currentBuy = lastBuy * multi
            currentUnit = (currentBuy)/currentPrice
            totalBuy = totalBuy + currentBuy
            totalUnit = totalUnit + currentUnit
            lastBuy = currentBuy
            lastPrice = currentPrice
        }
        else {
            if (i++==5){
                if(totalBuy > 20){
                    console.log('---> ',(currentPrice*totalUnit*0.999 - totalBuy*1001) - (totalBuy)*1.002,'Totalbuy: ', totalBuy,'Totalunit: ', totalUnit, )
                }
                console.log('Current P:', currentPrice, 'Last P: ', lastPrice,'Totalasset: ', (total.BTC-1)*currentPrice + total.BUSD)
                i = 0
            }
            console.log('- current diff is: ', (currentPrice - lastPrice)/lastPrice, '%')
            direction = 'no'
        }
    }
    
    if (direction != 'no') {
            console.log(direction, ' amount: ', currentBuy, '- unit: ', currentUnit)
            const order = await binance.createMarketOrder('APE/BUSD', direction, currentUnit)
            if(direction == 'sell') {
                currentBuy = 20
                currentUnit = 0
                totalBuy = 0
                totalUnit = 0
            }
            else {
                currentAsset = (total.APE)*currentPrice + total.BUSD
                // console.log('Asset diff = ',currentAsset - totalAsset ,' $')
                totalAsset = currentAsset 
                console.log('Totalbuy: ', totalBuy,'Totalunit: ', totalUnit, 'Totalasset: ', totalAsset)

            }
    }
    // (total.BTC-1) * currentPrice + total.BUSD

    
}

async function job2(){
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    const price = await binance.fetchOHLCV('APE/BUSD', '1s', undefined, 1)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    console.log('Last price: ',lastPrice,'current price: ',currentPrice,'Diff: ',(currentPrice - lastPrice)/lastPrice)
    lastPrice = currentPrice
}

async function job3(){
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    const price = await binance.fetchOHLCV('APE/BUSD', '1s', undefined, 2)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    const order = await binance.createMarketOrder('APE/BUSD', 'sell', total.BTC-1)

}

async function fetchBalance() {
    const balance = await binance.fetchBalance(); // returns huge object with all balances
    console.log(balance.free) // returns 'free' or available balance of USDT
  }

async function main(){
    
    const balance = await binance.fetchBalance()
    console.log(balance)
    const total = balance.total
    // 1st buy - always buy
    const price = await binance.fetchOHLCV('APE/BUSD', '1m', undefined, 2)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    // currentUnit = (20)/currentPrice 
    
    // console.log(aPrice)
    // console.log(total)
    // const odr = await binance.createMarketOrder('APE/USDT', direction)
    // const response = await binance.fetchOrderBook ('APE/BUSD')
    // const order = await binance.createMarketBuyOrder('APE/BUSD',currentUnit, undefined)
    // console.log(currentUnit)
    // totalAsset = (total.APE) * currentPrice + total.BUSD
    console.log('Total asset: ', totalAsset, ' $')

    // const order = await binance.createMarketOrder('BTC/BUSD', 'buy', currentUnit)
    // console.log(order)
    // totalBuy = currentUnit*currentPrice
    // totalUnit = currentUnit
    lastPrice = currentPrice
    // lastBuy = totalBuy
    // console.log('Buy amount: ', currentBuy)

    while(true){
        await job()
        await delay(5*1000)
    }
}

fetchBalance()