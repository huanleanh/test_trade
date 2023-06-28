from howtrader.app.cta_strategy.backtesting import BacktestingEngine, OptimizationSetting
from howtrader.trader.object import Interval
from datetime import datetime
from strategies.custom_strategy import CustomStrategy


engine = BacktestingEngine()
engine.set_parameters(
    vt_symbol="BTCUSDT.BINANCE",
    interval=Interval.MINUTE,
    start=datetime(2019, 1, 1),
    end= datetime(2024, 2, 1),
    rate=4/10000,
    slippage=0,
    size=1,
    pricetick=0.01,
    capital=10000
)
  
# engine.add_strategy(AtrRsiStrategy, {})
engine.add_strategy(CustomStrategy, {})
# engine.add_strategy(BollChannelStrategy, {})

engine.load_data()
engine.run_backtesting()
# df = engine.calculate_result()
# engine.calculate_statistics()
# engine.show_chart()

# setting = OptimizationSetting()
# setting.set_target("end_balance")
# setting.add_parameter("atr_length", 3, 39, 1)
# setting.add_parameter("atr_ma_length", 10, 30, 1)

# result = engine.run_ga_optimization({})  # 优化策略参数
# print(result)  # 打印回测的结果，结果中会有比较好的结果值。
