import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import create_engine, func, desc

from flask import (
    Flask,
    render_template,
    jsonify)

# Database Setup
engine = create_engine("sqlite:///university_data.sqlite")
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/univ_map")
def univ_map():
    univ_list = []
    conn = engine.connect()
    univ_data = conn.execute('SELECT * FROM address_finances').fetchall()

    for data in univ_data:
        # univ_dict = {}
        univ_dict = {'univ_index' : data.index, 'UNITID' : data.UNITID, 'name' : data.name, 'address' : data.address,
        'city' : data.city, 'zip_code' : data.zipCode, 'state_abbr' : data.stateAbbr, 'web_addr' : data.webAddr,
        'lat' : data.lat, 'lon' : data.lon, 'acceptance_rate' : data.acceptanceRate, 'student_faculty_ratio' : data.StudentFacultyRatio,
        'in_state_tuition' : data.inStateTuition, 'out_of_state_tuition' : data.outOfStateTuition,
        'total_fin_aid' : data.TotFinAidUG, 'ave_amt_grant_aid' : data.AveAmtGrantAid, 'ave_amt_stu_loan' : data.AveAmtStudentLoans}
        univ_list.append(dict(univ_dict))
    conn.close()

    return jsonify(univ_list)

@app.route("/univ_major")
def univ_major():
    major_list = []
    conn = engine.connect()
    major_data = conn.execute('SELECT * FROM majors').fetchall()

    for data in major_data:

        major_dict = {"index" : data.index,
        	"UNITID" : data.UNITID,
        	"MajorFieldsID" : data.MajorFieldsID,
        	"MajorFieldsDesc" : data.MajorFieldsDesc,
        	"GrandTotal" : data.GrandTotal,
        	"TotalMen" : data.TotalMen,
        	"TotalWomen" : data.TotalWomen,
        	"AmericanIndianAlaskaNativeTotal" : data.AmericanIndianAlaskaNativeTotal,
        	"AmericanIndianAlaskaNativeMen" : data.AmericanIndianAlaskaNativeMen,
        	"AmericanIndianAlaskaNativeWomen" : data.AmericanIndianAlaskaNativeWomen,
        	"AsianTotal" : data.AsianTotal,
        	"AsianMen" : data.AsianMen,
        	"AsianWomen" : data.AsianWomen,
        	"AfricanAmericanTotal" : data.AfricanAmericanTotal,
        	"AfricanAmericanMen" : data.AfricanAmericanMen,
        	"AfricanAmericanWomen" : data.AfricanAmericanWomen,
        	"HispanicTotal" : data.HispanicTotal,
        	"HispanicMen" : data.HispanicMen,
        	"HispanicWomen" : data.HispanicWomen,
        	"PacificIslanderTotal" : data.PacificIslanderTotal,
        	"PacificIslanderMen" : data.PacificIslanderMen,
        	"PacificIslanderWomen" : data.PacificIslanderWomen,
        	"WhiteTotal" : data.WhiteTotal,
        	"WhiteMen" : data.WhiteMen,
        	"WhiteWomen" : data.WhiteWomen,
        	"TwoOrMoreRacesTotal" : data.TwoOrMoreRacesTotal,
        	"TwoOrMoreRacesMen" : data.TwoOrMoreRacesMen,
        	"TwoOrMoreRacesWomen" : data.TwoOrMoreRacesWomen,
        	"RaceUnknownTotal" : data.RaceUnknownTotal,
        	"RaceUnknownMen" : data.RaceUnknownMen,
        	"RaceUnknownWomen" : data.RaceUnknownWomen,
        	"NonresidentAlienTotal" : data.NonresidentAlienTotal,
        	"NonresidentAlienMen" : data.NonresidentAlienMen,
        	"NonresidentAlienWomen" : data.NonresidentAlienWomen}
        major_list.append(dict(major_dict))
    conn.close()

    return jsonify(major_list)






if __name__ == "__main__":
    app.run(debug=True)
