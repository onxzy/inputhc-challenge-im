import json
import requests
url = 'https://inputhc.onxzy.dev/api/'

import random
import matplotlib
import math
import pickle

import warnings
warnings.filterwarnings("ignore", category=UserWarning)
import sklearn

import sys
#import xgboost
import pandas as pd

pickled_model = pickle.load(open('data/model.pkl', 'rb'))

# BdD : lits - operations - booking ( avec nom patient | date oeration etc... )
# on commence par un test sur un mois de 30 jours
# 2 types de couchage : lit ( arrivee a l'hopital la veille de l'operation ) / ambulatoire ( pour le jour de l'opération )

if (len(sys.argv)) != 7 :
    print(json.dumps({
        "err": "argv",
        "help": "_ age sex acte date_start date_end days_count"
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
acte = sys.argv[3] # LMMA009
date_start = sys.argv[4]
date_end = sys.argv[5]
nb_jour_planning = int(sys.argv[6])

### BDD
r1 = requests.get(url + "night/usage/real?date_start="+date_start+"&date_end="+date_end)
if (r1.status_code != 200):
    print(json.dumps({"err": "get_nights_usage", "code": r1.status_code, "url": r1.url}))
    exit()
occupation = r1.json()
if (len(occupation) != nb_jour_planning) :
    print(json.dumps({"err": "nights_usage_length", "got": len(occupation), "expected": nb_jour_planning}))
    exit()

r2 = requests.get(url + "night/find?simple_array=1&date_start="+date_start+"&date_end="+date_end)
if (r2.status_code != 200):
    print(json.dumps({"err": "get_nights_find", "code": r1.status_code, "url": r1.url}))
    exit()
nb_lits = r2.json()
if (len(nb_lits) != nb_jour_planning) :
    print(json.dumps({"err": "nights_find_length", "got": len(occupation), "expected": nb_jour_planning}))
    exit()

# occupation = [0] * nb_jour_planning #BDD usage
# nb_lits = [0] * nb_jour_planning #BDD find # nb arbritaire de lits totaux dispos, a adapter # a faire varier !
nb_blocs = [0] * nb_jour_planning #BDD    # nb arbritaire de blocs dispos, sans prendre en compte de quelconque marge pour les urgences pour le moment


seuil = [0] * nb_jour_planning # seuil de 1 à 4 pour la couleur des cases + 0 pour 'pas de bloc' le jour de l'operation + ajouter 10 / 20 / 30 / 40 selon la dispo des deambulatoires
classement = [0] * 10 # liste des 10 meilleurs jours pour l'algo

# for i in range(nb_jour_planning):
#     nb_lits[i] = random.randint(80,120)  # remplissage aleatoire du nombre de lits fournis par l'hosto

# for i in range(nb_jour_planning):
#     occupation[i] = random.randint(20,nb_lits[i])  # remplissage aleatoire des lits dispos dans le planning

for i in range(nb_jour_planning):
    nb_blocs[i] = random.randint(0,7)  # remplissage aleatoire blocs dispos dans le planning

def make_df(age, sexe, acte):
    df = pd.DataFrame(columns=['age', 'sexe_1', 'sexe_2', 'acte_classant_BEFA008',
       'acte_classant_BFGA004', 'acte_classant_BFGA427',
       'acte_classant_BGMA002', 'acte_classant_CAMA013',
       'acte_classant_DEKA001', 'acte_classant_DELF005',
       'acte_classant_EBLA003', 'acte_classant_EEAF002',
       'acte_classant_EEAF006', 'acte_classant_EGFA002',
       'acte_classant_FAFA006', 'acte_classant_FAFA010',
       'acte_classant_FAFA014', 'acte_classant_FAFA015',
       'acte_classant_GAMA007', 'acte_classant_HCFA008',
       'acte_classant_HCFA009', 'acte_classant_HEAE003',
       'acte_classant_HEQE002', 'acte_classant_HFCC003',
       'acte_classant_HFFC004', 'acte_classant_HFFC018',
       'acte_classant_HFMC001', 'acte_classant_HHFA002',
       'acte_classant_HHFA008', 'acte_classant_HHFA016',
       'acte_classant_HHFE002', 'acte_classant_HHFE004',
       'acte_classant_HHFE006', 'acte_classant_HJDC001',
       'acte_classant_HJFA004', 'acte_classant_HKPA007',
       'acte_classant_HMFC004', 'acte_classant_JANE002',
       'acte_classant_JCGE001', 'acte_classant_JCGE006',
       'acte_classant_JCLE002', 'acte_classant_JDDB005',
       'acte_classant_JDFE001', 'acte_classant_JDFE002',
       'acte_classant_JDFE003', 'acte_classant_JDPE002',
       'acte_classant_JELA002', 'acte_classant_JGFA005',
       'acte_classant_JGFC001', 'acte_classant_JGFE023',
       'acte_classant_JJFC003', 'acte_classant_JJFC006',
       'acte_classant_JJFC010', 'acte_classant_JKDC001',
       'acte_classant_JKFA006', 'acte_classant_JKFA028',
       'acte_classant_JKFC003', 'acte_classant_JKFC005',
       'acte_classant_JKFC006', 'acte_classant_JQGA002',
       'acte_classant_JQGA003', 'acte_classant_JQGA004',
       'acte_classant_KCFA005', 'acte_classant_KCFA008',
       'acte_classant_LAFA022', 'acte_classant_LMMA004',
       'acte_classant_LMMA006', 'acte_classant_LMMA009',
       'acte_classant_LMMA010', 'acte_classant_LMMA012',
       'acte_classant_MEKA008', 'acte_classant_MEMC005',
       'acte_classant_MJEC002', 'acte_classant_NEKA014',
       'acte_classant_NFKA007', 'acte_classant_NFKA008',
       'acte_classant_NFMC003', 'acte_classant_PDFA001',
       'acte_classant_QBFA001', 'acte_classant_QBFA005',
       'acte_classant_QBFA007', 'acte_classant_QBFA008',
       'acte_classant_QEEB152', 'acte_classant_QEFA007',
       'acte_classant_QEFA008', 'acte_classant_QEFA020',
       'acte_classant_QEMA004', 'acte_classant_QEMA013',
       'acte_classant_QZFA011', 'acte_classant_QZJA011'])
    df['age'] = [age/120]
    if sexe == 1 :
        df['sexe_1'] = 1
    else :
        df['sexe_1'] = 0
    if sexe == 2 :
        df['sexe_2'] = 1
    else :
        df['sexe_2'] = 0
    for i in range(0,len(df.columns[4:])+1) :
        if acte in df.columns[3:][i] :
            df[df.columns[3:][i]] = 1
        else :
            df[df.columns[3:][i]] = 0
    return(df)

def nb_jour_lit(df,model) :
    return(model.predict(df)[0])

estimation_convalescence = int(nb_jour_lit(make_df(age,sex,acte),pickled_model))

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
