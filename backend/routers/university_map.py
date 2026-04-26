from fastapi import APIRouter, Depends
import sqlite3
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "university_data.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/univ_map")
async def get_univ_map():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM address_finances')
    rows = cursor.fetchall()
    
    univ_list = []
    for data in rows:
        univ_dict = {
            'univ_index': data['index'], 
            'UNITID': data['UNITID'], 
            'name': data['name'], 
            'address': data['address'],
            'city': data['city'], 
            'zip_code': data['zipCode'], 
            'state_abbr': data['stateAbbr'], 
            'web_addr': data['webAddr'],
            'lat': data['lat'], 
            'lon': data['lon'], 
            'acceptance_rate': data['acceptanceRate'], 
            'student_faculty_ratio': data['StudentFacultyRatio'],
            'in_state_tuition': data['inStateTuition'], 
            'out_of_state_tuition': data['outOfStateTuition'],
            'total_fin_aid': data['TotFinAidUG'], 
            'ave_amt_grant_aid': data['AveAmtGrantAid'], 
            'ave_amt_stu_loan': data['AveAmtStudentLoans']
        }
        univ_list.append(univ_dict)
    
    conn.close()
    return univ_list

@router.get("/univ_major")
async def get_univ_major():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM majors')
    rows = cursor.fetchall()
    
    major_list = []
    for data in rows:
        major_dict = {
            "index": data['index'],
            "UNITID": data['UNITID'],
            "MajorFieldsID": data['MajorFieldsID'],
            "MajorFieldsDesc": data['MajorFieldsDesc'],
            "GrandTotal": data['GrandTotal'],
            "TotalMen": data['TotalMen'],
            "TotalWomen": data['TotalWomen'],
            "AmericanIndianAlaskaNativeTotal": data['AmericanIndianAlaskaNativeTotal'],
            "AmericanIndianAlaskaNativeMen": data['AmericanIndianAlaskaNativeMen'],
            "AmericanIndianAlaskaNativeWomen": data['AmericanIndianAlaskaNativeWomen'],
            "AsianTotal": data['AsianTotal'],
            "AsianMen": data['AsianMen'],
            "AsianWomen": data['AsianWomen'],
            "AfricanAmericanTotal": data['AfricanAmericanTotal'],
            "AfricanAmericanMen": data['AfricanAmericanMen'],
            "AfricanAmericanWomen": data['AfricanAmericanWomen'],
            "HispanicTotal": data['HispanicTotal'],
            "HispanicMen": data['HispanicMen'],
            "HispanicWomen": data['HispanicWomen'],
            "PacificIslanderTotal": data['PacificIslanderTotal'],
            "PacificIslanderMen": data['PacificIslanderMen'],
            "PacificIslanderWomen": data['PacificIslanderWomen'],
            "WhiteTotal": data['WhiteTotal'],
            "WhiteMen": data['WhiteMen'],
            "WhiteWomen": data['WhiteWomen'],
            "TwoOrMoreRacesTotal": data['TwoOrMoreRacesTotal'],
            "TwoOrMoreRacesMen": data['TwoOrMoreRacesMen'],
            "TwoOrMoreRacesWomen": data['TwoOrMoreRacesWomen'],
            "RaceUnknownTotal": data['RaceUnknownTotal'],
            "RaceUnknownMen": data['RaceUnknownMen'],
            "RaceUnknownWomen": data['RaceUnknownWomen'],
            "NonresidentAlienTotal": data['NonresidentAlienTotal'],
            "NonresidentAlienMen": data['NonresidentAlienMen'],
            "NonresidentAlienWomen": data['NonresidentAlienWomen']
        }
        major_list.append(major_dict)
    
    conn.close()
    return major_list
