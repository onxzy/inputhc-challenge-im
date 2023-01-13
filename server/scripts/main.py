import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

import json
import requests
url = 'https://inputhc.onxzy.dev/api/'

import random
import matplotlib
import math

import warnings
warnings.filterwarnings("ignore", category=UserWarning)
import sklearn

import sys
#import xgboost
import pandas as pd
pd.options.mode.chained_assignment = None

from keras.models import load_model
model = load_model('data/model.h5')

import pickle
# pickled_model = pickle.load(open('data/model.pkl', 'rb'))

# BdD : lits - operations - booking ( avec nom patient | date oeration etc... )
# on commence par un test sur un mois de 30 jours
# 2 types de couchage : lit ( arrivee a l'hopital la veille de l'operation ) / ambulatoire ( pour le jour de l'opération )

if (len(sys.argv)) != 8 :
    print(json.dumps({
        "err": "argv",
        "help": "_ age sex cmd acte date_start date_end days_count"
    }))
    exit(1)

try:
    requests.get(url)
except:
    print(json.dumps({"err": "server_offline"}))
    exit(1)

### ARGUMENTS
age = int(sys.argv[1]) # 42
sex = int(sys.argv[2]) # 1
cmd = sys.argv[3] # 06 (C25)
acte = sys.argv[4] # LMMA009
date_start = sys.argv[5]
date_end = sys.argv[6]
nb_jour_planning = int(sys.argv[7])

### BDD
r1 = requests.get(url + "night/usage/plan?date_start="+date_start+"&date_end="+date_end)
if (r1.status_code != 200):
    print(json.dumps({"err": "get_nights_usage", "code": r1.status_code, "url": r1.url}))
    exit()
occupation = r1.json()
if (len(occupation) != nb_jour_planning) :
    print(json.dumps({"err": "nights_usage_length", "got": len(occupation), "expected": nb_jour_planning, "url": r1.url}))
    exit()

r2 = requests.get(url + "night/find?simple_array=1&date_start="+date_start+"&date_end="+date_end)
if (r2.status_code != 200):
    print(json.dumps({"err": "get_nights_find", "code": r2.status_code, "url": r2.url}))
    exit()
nb_lits = r2.json()
if (len(nb_lits) != nb_jour_planning) :
    print(json.dumps({"err": "nights_find_length", "got": len(nb_lits), "expected": nb_jour_planning, "url": r2.url}))
    exit()

r3 = requests.get(url + "surgery/available?date_start="+date_start+"&date_end="+date_end+"&disease="+cmd)
if (r3.status_code != 200):
    print(json.dumps({"err": "get_surgeries_find", "code": r3.status_code, "url": r3.url}))
    exit()
nb_blocs = r3.json()
if (len(nb_blocs) != nb_jour_planning) :
    print(json.dumps({"err": "surgeries_find_length", "got": len(nb_blocs), "expected": nb_jour_planning, "url": r3.url}))
    exit()

seuil = [0] * nb_jour_planning # seuil de 1 à 4 pour la couleur des cases + 0 pour 'pas de bloc' le jour de l'operation + ajouter 10 / 20 / 30 / 40 selon la dispo des deambulatoires
classement = [0] * 10 # liste des 10 meilleurs jours pour l'algo

def open_conv(path) :
    df = pd.read_csv(path, encoding='latin-1',sep=',',header=None)
    df.columns = df.iloc[0]
    df = df.drop(0)
    df = df[['GHM','acte_classant','duree_mediane']]
    return(df)

def make_df(age, sexe, acte,table_conv):
    df = pd.DataFrame(columns=['age', 'duree_mediane','CMD','sexe_1', 'sexe_2','type_ghm_C','type_ghm_K'])
    df['age'] = [age/120]
    if sexe == 1 :
        df['sexe_1'] = 1
    else : 
        df['sexe_1'] = 0
    if sexe == 2 :
        df['sexe_2'] = 1
    else : 
        df['sexe_2'] = 0
    cmd = float(table_conv[table_conv['acte_classant']==acte].iloc[0]['GHM'][0:2])
    type_ghm = table_conv[table_conv['acte_classant']==acte].iloc[0]['GHM'][2]
    duree_mediane = table_conv[table_conv['acte_classant']==acte].iloc[0]['duree_mediane']
    df['CMD'][df.index[0]] = cmd
    df['duree_mediane'][df.index[0]] = duree_mediane
    if type_ghm == 'C' :
        df['type_ghm_C'] = 1
    else : 
        df['type_ghm_C'] = 0
    if type_ghm == 'K' :
        df['type_ghm_K'] = 1
    else : 
        df['type_ghm_K'] = 0
    df['CMD'] = pd.to_numeric(df['CMD'])
    df['duree_mediane'] = pd.to_numeric(df['duree_mediane'])
    df['age'] = pd.to_numeric(df['age'])
    return(df)

def nb_jour_lit(age,sexe,acte,table_conv,model) :
    df = make_df(age,sexe,acte,table_conv)
    return(model.predict(df, verbose=0)[0][0])

estimation_convalescence = math.floor(nb_jour_lit(age,sex,acte,open_conv('data/conversion_table.csv'),model))
# estimation_convalescence = int(nb_jour_lit(make_df(age,sex,acte),pickled_model))

def generation_seuil():
    for i in range(nb_jour_planning-estimation_convalescence): # chaque date d'entree a l'hosto => un jour de trop grande contrainte ?
        if nb_blocs[i+1] == 0:
            seuil[i] = 0

        else:
            for j in range(estimation_convalescence):   # pendant la convalescence estimée -> jour rouge ?
                #if i+j < nb_jour_planning:   # sinon on depasse la capacite du planning
                if occupation[i+j] <= 0.8 * nb_lits[i+j] and seuil[i] < 1:
                    seuil[i] = 1
                elif 0.8 * nb_lits[i+j] < occupation[i+j] <= 0.95 * nb_lits[i+j] and seuil[i] < 2:
                    seuil[i] = 2
                elif 0.95 * nb_lits[i+j] < occupation[i+j] <= nb_lits[i+j] and seuil[i] < 3:
                    seuil[i] = 3
                elif occupation[i+j] > nb_lits[i+j]:
                    seuil[i] = 4

def generation_classement():
    score = [0] * 10   # score grand = meilleur choix # a classer par ordre decroissant ( important )
    for i in range(nb_jour_planning-estimation_convalescence):
        s = 0. # score local
        if seuil[i] != 0:# un bloc est dispo le lendemain pour l'operation
            for j in range(estimation_convalescence):
                #if i+j < nb_jour_planning: # eviter une sortie de tableau
                if (nb_lits[i+j] != 0):
                    s = s + 4/((occupation[i+j] / nb_lits[i+j])+0.3)
                s = math.floor(s)  # arrondir pour garder en priorité les premiers jours

            for k in range(10) :     # on acutalise le classement
                if score[k] < s:
                    for r in range(10-k):
                        score[9-r] = score[9-r-1]
                        classement[9-r] = classement[9-r-1]
                    classement[k] = i+1
                    score[k] = s
                    break            # ne pas changer plusieurs elements du tableau
        # print(classement)
        # print(s)


generation_seuil()
generation_classement()

# print("Seuils : ")
# print(seuil)
# print("Classement : ")
# print(classement)
# print("Nbre de blocs dispos : ")
# print(nb_blocs)
# print("Nbre de lits occupés : ")
# print(occupation)
# print("Nbre de lits fournis : ")
# print(nb_lits)

# jour_reservation = int(input("jour de la reservation : "))
jour_reservation = classement[0] - 1
if seuil[jour_reservation] == 4 and seuil[0] != 4 and nb_blocs[0] >= 0: # operation le jour-meme
    jour_reservation = 0

# Actualisation du planning

# nb_blocs[i] = nb_blocs[i] + 1
# for j in range(estimation_convalescence):
#     occupation[jour_reservation-1+j] = occupation[jour_reservation-1+j] + 1

# print("Nombre de lits occupés après réservation : ")
# print(occupation)

# generation_seuil()

# print("Actualisation des seuils : ")
# print(seuil)

print(json.dumps({
    "booking": jour_reservation,
    "seuil_max": seuil[jour_reservation],
    "nights": estimation_convalescence,
}))
