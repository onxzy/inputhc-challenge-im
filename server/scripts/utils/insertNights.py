import json
import requests
import os
import math

serverUrl = 'https://inputhc.onxzy.dev/api/'

try:
    requests.get(serverUrl)
except:
    exit('Server offline')

print('loading json...')
with open('../data/carre_lits_parJours_baisseWeekend.json') as nights_target_file:
    nights_target = json.load(nights_target_file)  
print('json loaded !')

j = 0
for i in range(0, len(nights_target)) :
  r = requests.patch(serverUrl + 'night/date/' + nights_target[i]['date'], json = {'capacity': math.floor(nights_target[i]['c_lits'])})
  if (r.status_code != 200) :
    print(nights_target[i])
    print(r.status_code)
    print(r.json())
  else :
    j += 1
  print(str(i+1) + '/' + str(len(nights_target)))

print('Total sans erreur : ' + str(j))

