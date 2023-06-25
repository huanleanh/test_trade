const ccxt = require('ccxt')
const moment = require('moment')
const delay = require('delay')

// const { toArray } = require('ccxt/js/src/base/functions')

const future2 = new ccxt.binanceusdm({
    'apiKey': 'Y7lTnxDG3UZgaFSejhXwKye7Rp5IgA7hVkGIH9rKvmVcnm4FCaM0IHcMJYWOUdOF',
    'secret': 'hlTDIn7BixakG7uqbDB3Z6E3V3ZFof7NHw3yMdjcTcRL2IGYoEC1Uf2dQTakIoo7',
})

const future = new ccxt.binance({
    'apiKey': 'Ge78MvDKuFIlhPo46zFyE743dn8esEShBwjEKEtuRF6y5ZaLuv5ZNjSd6O9HEZxM',
    'secret': 'Lk7uuVecrIgqLGEm5SBsZP24ZvgOwroGPMi7HUTq8Ea2LODvmYeyNM6EQ9hxcX3X',
})

const fTest = new ccxt.binance({
    'apiKey': '8e90a9a37e87bd3d791dbcbcd82f9180d1a769cfbcce4fb73f57745e5be6a7e6',
    'secret': 'd5c0c07b3f8d30b0e25246fb37b978eb5a0553075d27c5f5bfb692f27225544e',
})

// future.setSandboxMode = true

fTest.setSandboxMode = true

async function main() {
    
    first = true
    count =0
    eve = 0
    change = 0
    eveNo = 0.0
    inPosition = false
    side = 0
    loiNhuan = 0
    giaVaoLenh = 0
    Best = 0
    // a = await future.setMarginMode('isolated', 'ARPAUSDT', undefined)
    // await future.fetchPositions('ARPAUSDT', undefined)
    // console.log(a)
    while(true){
        if(inPosition) {
            // await delay(10*200)
            // console.log('Done delay')
        }
        await delay(1*100)
        
        // const a = await future.fetchLastPrices('BTC/USDT', 1)
        // console.log(a)
        const price = await future.fetchOHLCV('ARPA/USDT', '1s', undefined, 1)       
        const arpaPrice = price.map(price => {
            return {
                timeStamp: moment(price[0]).format(),
                open: price[1], low: price[3], high: price[2], close: price[4], vol: price[5]
            }
        })
        curPr = arpaPrice[0].open
        
        if (inPosition) {
            console.log('Gia hien tai: ', arpaPrice[0].open)
        }
        if (first) {
            first = false
            lastP = arpaPrice[0].open
        }
        else{
            
            change = Math.max(lastP, arpaPrice[0].open) - Math.min(arpaPrice[0].open, lastP)
            if (change != 0){
                if(inPosition){
                    // Dang in position, tinh toan de close position
                    if(side>0){
                        if(curPr*1.00025<=Best){
                            console.log( side>0 ? '^ ' : 'v ', 'Open price: ', giaVaoLenh, ' Current price: ', curPr)
                            console.log('---> Ban tai: ', curPr)
                            inPosition = false
                            side = 0
                            loiNhuan += 20*30/ (giaVaoLenh) *(curPr-giaVaoLenh)
                            loiNhuan -= 20*30*0.04/100
                        }
                        else {
                            lastP = curPr
                            Best = Math.max(Best, curPr)
                        }
                    } else {
                        if(curPr*1.00025>=Best) {
                            console.log('---> Mua tai: ', curPr)
                            inPosition = false
                            side = 0
                            loiNhuan += (giaVaoLenh - curPr)*(20*30/giaVaoLenh)
                            loiNhuan -= 20*30*0.04/100
                        }
                        else {
                            lastP = curPr
                            Best = Math.min(Best, curPr)
                        }
                    }
                    if(!inPosition){
                        console.log('Loi nhuan hien tai: ', loiNhuan)
                    }
                }
                else {
                    count++
                    eve = (change/lastP + eve*(count-1))/count
                    eveNo = (change*100000 + eveNo*(count-1))/count
                    // console.log('eve = ', eve*100)
                    // console.log(count)
                    if(count>10){
                        if(count%10==0){
                            console.log('ARPA - eve: ', parseFloat(eve*100).toPrecision(4), '% - current price: ', arpaPrice[0].open)
                            console.log('Loi nhuan hien tai: ', loiNhuan)
                        }
                        if(change/lastP>eve*8){
                            console.log('Warning at: ', arpaPrice[0].timeStamp)
                            console.log('eve: ', parseFloat(eve*100).toPrecision(4), ' lastP: ',
                             lastP, ' - curP: ', arpaPrice[0].open, 'change: ', Math.ceil(change*100000), 'eveNo: ', Math.ceil(eveNo))
                            if(curPr < lastP){
                                console.log('Mua tai: ', curPr)
                                side =1
                            }
                            else {
                                console.log('Ban tai: ', curPr)
                                side =-1
                            }
                            giaVaoLenh = curPr
                            Best = curPr
                            inPosition = true
                        }
                }
                    
                }
            }
            lastP = arpaPrice[0].open
        }

    }
}

main()

