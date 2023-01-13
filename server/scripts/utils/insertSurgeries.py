import json
import requests
import os

serverUrl = 'https://inputhc.onxzy.dev/api/'
# serverUrl = 'http://localhost:5000/api/'

try:
    requests.get(serverUrl)
except:
    exit('Server offline')

with open('../data/chirurgiesMoyenne_parJours_parMaladie_baisseWeekend.json') as surgeries_file:
    surgeries = json.load(surgeries_file)  

# print(surgeries[0]['cmd'])
# print(surgeries[0]['data'][0]['date'])
# print(surgeries[0]['data'][0]['c'])


# rd = requests.patch(serverUrl + 'surgery/capacity', json = {'date': surgeries[0]['data'][0]['date'], 'capacity': surgeries[0]['data'][0]['c'], 'disease': surgeries[0]['cmd']})
# print(rd.status_code)
# print(rd.content)
# print(rd.json())

for i in range(0, len(surgeries)):
  cmd = surgeries[i]['cmd']
  data = surgeries[i]['data']
  print('cmd : ' + str(cmd))
  r = requests.post(serverUrl + 'disease/new', json = {'name': cmd})
  if (r.status_code != 200) :
    print('error cmd')
    print(r.status_code)
    # print(r.json())
  # else :
  for j in range(0, len(data)):
    date = data[j]['date']
    capacity = data[j]['c']
    rd = requests.patch(serverUrl + 'surgery/capacity', json = {'date': date, 'capacity': capacity, 'disease': cmd})
    if (rd.status_code != 200) :
      print('error surgery : ' + date)
      print(rd.status_code)
      # print(rd.json())
    print('cmd : ' + str(i) + '/' + str(len(surgeries)) + ' ' + str(j) + '/' + str(len(data)))
      

# j = 0
# for i in range(0, len(dates)) :
#   r = requests.patch(serverUrl + 'night/date/' + dates[i], json = {'capacity': capacite_lits[i]})
#   if (r.status_code != 200) :
#     print(dates[i])
#     print(r.status_code)
#     print(r.json())
#   else :
#     j += 1
#   print(str(i+1) + '/' + str(len(dates)))

# print('Total sans erreur : ' + str(j))

