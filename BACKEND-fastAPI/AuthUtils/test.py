import datetime

ts = datetime.datetime.now().timestamp()
print(ts)
ts = datetime.datetime.fromtimestamp(ts)
print(ts)