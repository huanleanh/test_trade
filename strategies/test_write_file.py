
toBuy = [1, 1.15, 1.2, 1.25, 1.26, 1.27, 1.28, 1.30, 1.5, 1.7, 2, 2.3, 2.5, 2.75, 3, 3.5, 4]
toSell = [0.3,0.4,0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 8, 10, 13, 15, 17, 20]
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
    with open(str(i[0]) + ' - ' + str(i[1]), 'w', encoding= 'utf-8') as txt[ct]:
      txt[ct].write(str(i[0]) + ' - ' + str(i[1]))
    ct+=1