from howtrader.app.cta_strategy import (
    CtaTemplate,
    StopOrder
)
from howtrader.trader.object import BarData, TickData
from howtrader.trader.utility import BarGenerator
from datetime import datetime

class CustomStrategy(CtaTemplate):
    """"""
    author = "Your Name"
    capital = []
    phi = 0.0004
    total = []
    win = []
    inPos = []
    openPos = []
    toBuy = [1, 1.15, 1.2, 1.25, 1.26, 1.27, 1.28, 1.30, 1.5, 1.7, 2, 2.3, 2.4, 2.5, 2.55, 2.6, 2.65, 2.7, 2.75, 3, 3.5, 4]
    toSell = [0.3,0.4,0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 13, 15, 17, 20]
    toLoop = []
    count=0
    txt = []
    for i in toBuy:
        for j in toSell:
            toLoop.append([i,j])
            txt.append(count)
            count+=1
            ct = 0
    for i in toLoop:
        inPos.append(False)
        win.append(0)
        total.append(0)
        openPos.append(0.0)
        capital.append(1000.0)
        with open('report/' + str(i[0]) + ' - ' + str(i[1]) + '.txt', 'w', encoding= 'utf-8') as txt[ct]:
            continue

    def __init__(self, cta_engine, strategy_name, vt_symbol, setting):
        """"""
        super().__init__(cta_engine, strategy_name, vt_symbol, setting)

        self.bg = BarGenerator(self.on_bar, 60, self.on_1min_bar)
        self.last_two_bars = []

    def on_init(self):
        """
        Callback when strategy is inited.
        """
        self.write_log("Strategy Initialized")
        self.load_bar(10)

    def on_start(self):
        """
        Callback when strategy is started.
        """
        self.write_log("Strategy Started")

    def on_stop(self):
        """
        Callback when strategy is stopped.
        """
        self.write_log("Strategy Stopped")

    def on_tick(self, tick: TickData):
        """
        Callback of new tick data update.
        """
        self.bg.update_tick(tick)

    def on_bar(self, bar: BarData):
        """
        Callback of new bar data update.
        """
        self.bg.update_bar(bar)

    def on_1min_bar(self, bar: BarData):
        """
        Callback of new 1-minute bar data update.
        """
        self.last_two_bars.append(bar)

        if len(self.last_two_bars) > 2:
            self.last_two_bars.pop(0)

        if len(self.last_two_bars) == 2:
            prev_bar = self.last_two_bars[0]
            current_bar = self.last_two_bars[1]
            ct = 0
            for i in self.toLoop:
                # if current_bar.close_price > current_bar.open_price * 1.01 and \
                #         prev_bar.close_price > prev_bar.open_price * 1.01:
                if current_bar.close_price >= current_bar.open_price * (1+float(i[0])/100) and not self.inPos[ct] and self.capital[ct]>3:
                    self.buy(current_bar.close_price, 1)  # Đặt lệnh mua với giá close của current_bar
                    self.openPos[ct] = current_bar.close_price*1
                    # print('> mua tai: ', self.openPos)
                    self.inPos[ct] = True
                    self.total[ct]+=1

                # current_bar.close_price < current_bar.open_price*0.99 or 
                # current_bar.close_price >= self.openPos*1.3 
                # or current_bar.close_price<= current_bar.open_price)
                if (current_bar.close_price <= self.openPos[ct]*.993 or current_bar.close_price >= self.openPos[ct]*(1+float(i[1])/100))\
                    and self.inPos[ct]:
                    self.sell(current_bar.close_price, 1)  # Đặt lệnh bán với giá close của current_bar
                    tienvaolenh = min(self.capital[ct],25000)*0.2*125
                    loinhuan = max(tienvaolenh/self.openPos[ct]*(current_bar.close_price*0.999-self.openPos[ct]*1.001) -tienvaolenh*self.phi*2, -tienvaolenh/99)
                    # print('<<<< ban tai: ', current_bar.close_price, 'loi nhuan: ', loinhuan)
                    # Tính toán lại capital:
                    self.capital[ct] = self.capital[ct] + loinhuan
                    # print('****** ', self.capital, ' ******')
                    
                    if loinhuan > 0:
                        self.win[ct]+=1
                    with open('report/' + str(i[0]) + ' - ' + str(i[1]) + '.txt', 'a', encoding= 'utf-8') as self.txt[ct]:
                        self.txt[ct].write('Profit:  ' + str(int(loinhuan)) + ' Capital:  ' + str(int(self.capital[ct])) + ' Total trade:  ' + str(self.total[ct]) + ' Win trade:  ' + str(self.win[ct]) + ' Win rate:  ' + str(float(int(float(self.win[ct])/float(self.total[ct])*1000)/10)) + '%\n')
                    self.inPos[ct] =False
                ct+=1


    def on_order(self, order):
        """
        Callback of new order data update.
        """
        pass

    def on_trade(self, trade):
        """
        Callback of new trade data update.
        """
        pass

    def on_stop_order(self, stop_order):
        """
        Callback of stop order update.
        """
        pass
