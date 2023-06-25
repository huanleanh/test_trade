
const ccxt = require('ccxt')
const moment = require('moment')
const delay = require('delay')
// const { toArray } = require('ccxt/js/src/base/functions')

const future = new ccxt.binanceusdm({
    'apiKey': '8e90a9a37e87bd3d791dbcbcd82f9180d1a769cfbcce4fb73f57745e5be6a7e6',
    'secret': 'd5c0c07b3f8d30b0e25246fb37b978eb5a0553075d27c5f5bfb692f27225544e',
})
const binance = new ccxt.binance({
        'apiKey': '8e90a9a37e87bd3d791dbcbcd82f9180d1a769cfbcce4fb73f57745e5be6a7e6',
        'secret': 'd5c0c07b3f8d30b0e25246fb37b978eb5a0553075d27c5f5bfb692f27225544e',
})
binance.setSandboxMode(true)
var lastBuy = 10
var totalLost = 0.0
const multi = 1.1
var currentBuy = 0.0
var totalUnit = 0.0
var currentPrice = 0.0
var lastPrice = 0.0
var totalAsset = 0
var currentAsset = 0
var i = 0
var initUSDT = 0
var direction = 'no'
var finish = false
async function job() {
    // console.log('total asset: ', totalAsset)
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    const price = await binance.fetchOHLCV('XRP/USDT', '1s', undefined, 1)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    var currentUnit = 0.0
    if ((total.XRP - 50000)*0.999*currentPrice + total.USDT > initUSDT*1.001 && total.XRP>50001 && initUSDT > 10055.87533){
        console.log('<--- Greater than initUSDT -> sell')
        direction = 'sell'
        currentUnit = (total.XRP - 50000)
    }else{
        if(totalLost==0 && currentPrice>lastPrice){
            lastPrice = currentPrice
        }
        else{
            if ((currentPrice*totalUnit)*0.999 - totalLost > totalLost*1.001 && total.XRP>50001 && initUSDT > 10055.87533){
                direction = 'sell'
                currentUnit = totalUnit
                console.log('<--- Profit > 0.1% -> sell')
    
            }
            else {
                if ((totalLost < 10000.0) && ((currentPrice - lastPrice)/lastPrice) < -0.00001) {
                    direction = 'buy'
                    currentBuy = lastBuy * multi
                    currentUnit = (currentBuy)/currentPrice
                    totalLost = totalLost + currentBuy
                    totalUnit = totalUnit + currentUnit
                    lastBuy = currentBuy
                    lastPrice = currentPrice
                }
                else {
                    
                    // console.log('- current diff is: ', (currentPrice - lastPrice)/lastPrice, '%')
                    direction = 'no'
                }
            }
        }
    }
    if (i++==5){
        // if(totalLost > 20){
        //     console.log('profit: ',currentPrice*totalUnit - totalLost,'Totalbuy: ', totalLost,'Totalunit: ', totalUnit, )
        // }
        // console.log('profit: ',currentPrice*totalUnit - totalLost,'Totalbuy: ', totalLost,'Totalunit: ', totalUnit, )

        console.log('Current P:', currentPrice, ', diff: ', currentPrice-lastPrice,', Totalasset: ', (total.XRP-50000)*currentPrice + total.USDT)
        i = 0
    }
    if (direction != 'no') {
            console.log('---> ', direction, ' amount: ', currentBuy, '- unit: ', currentUnit)
            const order = await binance.createMarketOrder('XRP/USDT', direction, currentUnit)
            const order2 = await binance.future

            if(direction == 'sell') {
                currentBuy = 20
                currentUnit = 0
                totalLost = 0
                totalUnit = 0
            }
            else {
                currentAsset = (total.XRP - 50000)*currentPrice + total.USDT
                // console.log('Asset diff = ',currentAsset - totalAsset ,' $')
                totalAsset = currentAsset 
                console.log('XRP: ', total.XRP, ' - USDT: ', total.USDT)
                console.log('Totalbuy: ', totalLost,'Totalunit: ', totalUnit, 'Totalasset: ', totalAsset)

            }
    }

}

async function job2(){
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    while(true){
    
        const price = await binance.fetchOHLCV('XRP/USDT', '1s', undefined, 2)
        const aPrice = price.map(price => {
            return {
                timeStamp: moment(price[0]).format(),
                open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
            }
        })
        currentPrice = aPrice[aPrice.length-1].close
        console.log(currentPrice, ' - ', (total.XRP-50000)*currentPrice + total.USDT )
        if ( currentPrice <0.4626 || currentPrice > 0.4648){
            
            // const order = await binance.createMarketOrder('XRP/USDT', 'sell', total.XRP-50000)

        }

        await delay(1*1000)
    }
}

async function job3(){
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    const price = await binance.fetchOHLCV('XRP/USDT', '1s', undefined, 2)
    const aPrice = price.map(price => {
        return {
            timeStamp: moment(price[0]).format(),
            open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
        }
    })
    currentPrice = aPrice[aPrice.length-1].close
    console.log('-> ', currentPrice*(total.XRP-50000)+total.USDT, 'current value: ', currentPrice)
    // if ( currentPrice >= 0.46 || currentPrice <= 0.4519){
    //     const order = await binance.createMarketOrder('XRP/USDT', 'sell', 10000)
    //     const order2 = await binance.createMarketOrder('XRP/USDT', 'sell',total.XRP-50000)
    //     finish = true

    // }
}

async function sell(){
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    console.log('XRP: ', total.XRP, ' - USDT: ', total.USDT)
    // initUSDT = total.USDT
    if ( total.XRP > 50001){
            const order = await binance.createMarketOrder('XRP/USDT', 'sell',total.XRP-50000)
    }
    console.log('XRP: ', total.XRP, ' - USDT: ', total.USDT)
}
async function main(){
    
    const balance = await binance.fetchBalance()
    // console.log(balance)
    const total = balance.total
    initUSDT = total.USDT
    console.log('XRP: ', total.XRP, ' - USDT: ', total.USDT)
    // 1st buy - always buy
    const price = await binance.fetchOHLCV('XRP/USDT', '1s', undefined, 2)
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
    // const response = await binance.fetchOrderBook ('APE/USDT')
    // const order = await binance.createMarketBuyOrder('APE/USDT',currentUnit, undefined)
    // console.log(currentUnit)
    totalAsset = (total.XRP-50000) * currentPrice + total.USDT
    totalUnit = (total.XRP-50000)
    totalLost = initUSDT - total.USDT
    console.log('Total asset: ', totalAsset, ' $')

    // const order = await binance.createMarketOrder('XRP/USDT', 'buy', currentUnit)
    // console.log(order)
    // totalBuy = currentUnit*currentPrice
    // totalUnit = currentUnit
    lastPrice = currentPrice
    // lastBuy = totalBuy
    // console.log('Buy amount: ', currentBuy)

    while(!finish){
        await job()
        await delay(1*1000)
    }
}

main()

