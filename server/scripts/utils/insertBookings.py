import json
import requests
import os

serverUrl = 'https://inputhc.onxzy.dev/api/'
# serverUrl = 'http://localhost:5000/api/'

try:
    requests.get(serverUrl)
except:
    exit('Server offline')

with open('../data/realData.json') as real_data_file:
    real_data = json.load(real_data_file)  

for i in range(0, len(real_data)):
# {"age":88,"sexe":2,"acte_classant":"HMFC004","categorie_majeure":"07","duree_totale":40}
  print(str(i) + '/' + str(len(real_data)))
  r = requests.post(serverUrl + 'booking/ask', json = {
    "date_start": "2019-01-23",
    "max_days": 700,
    "age": real_data[0]['age'],
    "sex": real_data[0]['sexe'],
    "acte": real_data[0]['acte_classant'],
    "disease": real_data[0]['categorie_majeure'],
    "real_nights": real_data[0]['duree_totale'],
  })
  if (r.status_code != 200):
    print('err : ' + str(r.status_code))
    print(r.content)




