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
    capital = 1000.0
    phi = 0.0004
    total = 0
    win = 0
    inPos = False
    openPos = 0.0

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

            # if current_bar.close_price > current_bar.open_price * 1.01 and \
            #         prev_bar.close_price > prev_bar.open_price * 1.01:
            if current_bar.close_price >= current_bar.open_price * 1.02 and not self.inPos:
                self.buy(current_bar.close_price, 1)  # Đặt lệnh mua với giá close của current_bar
                self.openPos = current_bar.close_price*1
                # print('> mua tai: ', self.openPos)
                self.inPos = True

            # current_bar.close_price < current_bar.open_price*0.99 or 
            # current_bar.close_price >= self.openPos*1.3 
            # or current_bar.close_price<= current_bar.open_price)
            if (current_bar.close_price <= self.openPos*.99 or current_bar.close_price >= self.openPos*1.002)\
                  and self.inPos:
                self.sell(current_bar.close_price, 1)  # Đặt lệnh bán với giá close của current_bar
                tienvaolenh = min(self.capital,25000)*0.2*125
                loinhuan = max(tienvaolenh/self.openPos*(current_bar.close_price*0.995-self.openPos*1.005) -tienvaolenh*self.phi*2, -tienvaolenh/125)
                # print('<<<< ban tai: ', current_bar.close_price, 'loi nhuan: ', loinhuan)
                # Tính toán lại capital:
                self.capital = self.capital + loinhuan
                print('****** ', self.capital, ' ******')
                self.total+=1
                if loinhuan > 0:
                    self.win+=1
                print('total ', self.total, ' win: ', self.win, ' winrate: ', float(self.win)/float(self.total))
                self.inPos =False

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
