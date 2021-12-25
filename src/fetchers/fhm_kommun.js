// this function takes the data from this page: https://experience.arcgis.com/experience/a6d20c1544f34d33b60026f45b786230
// and adds it to the database
// data come on a weekly basis, so, when updating it, insert them on Sunday of that week

// for each area you find:
// KnNamn: kommun name, adm_area_2
// Stadsdel: stadsdel (when present) is adm_area_3
// inc: new cases per 100k inhabitants
// fall: new cases of that week
// cuminc: cumulative cases per 100k inhabitants
// cumfreq: cumulative cases <-- this one goes into epidemiology as "confirmed"

// you get the data from the API
// for each data point, you query the DB to see if there is an adm_area with that name and get the GID, and all codes and names of areas above that
// if there is NOT -> print it because it may have a slightly different name! (so we can fix it later in code)
// once you have the codes for all the areas you need, you insert the data

// give that the statistics are provided per week, you need to find the sunday of that week and use that as the date

// we know that we have stads del (adm_area_3) statistics only for Malmö, Göteborg and Stockholm
// for those, we can sum up all the cases for each stadsdel and also add the overall statistics for adm_area_2
import axios from 'axios'
import {
  Pool,
  upsertTimeseries
} from '../db.js'
import csv from '../../csv files/read_csv_files.js'

// Prepare actor input
const input = {};

//#region TimeRelatedFunctions
let millisecondsPerDay = 24 * 60 * 60 * 1000

function firstDayOfWeek(week, year) {
  var date = firstWeekOfYear(year),
    weekTime = weeksToMilliseconds(week),
    targetTime = date.getTime() + weekTime

  date.setTime(targetTime);
  date = date.toISOString()
  date = date.substring(0, date.indexOf('T'))

  return date;
}

function weeksToMilliseconds(weeks) {
  return millisecondsPerDay * 7 * (weeks - 1) + millisecondsPerDay
}

function firstWeekOfYear(year) {
  var date = new Date(year, 0, 1, 0, 0, 0, 0) //First week of the year
  date = firstWeekday(date)
  return date;
}

/**
 * Sets the given date as the first day of week of the first week of year.
 */
function firstWeekday(firstOfJanuaryDate) {
  // 0 correspond au dimanche et 6 correspond au samedi.
  var FIRST_DAY_OF_WEEK = 1 // Monday, according to iso8601
  var WEEK_LENGTH = 7 // 7 days per week
  var day = firstOfJanuaryDate.getDay()
  day = (day === 0) ? 7 : day; // make the days monday-sunday equals to 1-7 instead of 0-6
  var dayOffset = -day + FIRST_DAY_OF_WEEK // dayOffset will correct the date in order to get a Monday
  if (WEEK_LENGTH - day + 1 < 4) {
    // the current week has not the minimum 4 days required by iso 8601 => add one week
    dayOffset += WEEK_LENGTH
  }
  return new Date(firstOfJanuaryDate.getTime() + dayOffset * millisecondsPerDay)
}

function currentOrLastWeek() {
  //define a date object variable that will take the current system date  
  let todaydate = new Date()

  //find the year of the current date  
  var oneJan = new Date(todaydate.getFullYear(), 0, 1)
  // calculating number of days in given year before a given date   
  var numberOfDays = Math.floor((todaydate - oneJan) / millisecondsPerDay)
  // adding 1 since to current date and returns value starting from 0   

  let currentWeek = Math.ceil((todaydate.getDay() + 1 + numberOfDays) / 7) - 1

  if (todaydate.getDay() != 0)
    currentWeek -= 1

  return currentWeek;
}
//#endregion

//#region ApifyClient
import {
  ApifyClient
} from 'apify-client';

let apifyClient;

function setApifyClient() {
  if (process.env.APIFY_TOKEN == undefined) {
    setTimeout(function () {
      var apiKey = process.env.APIFY_TOKEN;

      if (apiKey == undefined)
        console.log("Failed to set APIFY_TOKEN maybe you haven't defined it in .env file!")
      else {
        apifyClient = new ApifyClient({
          token: apiKey
        });
        getDataFromApify();
      }
    }, 1);
  }
}
//#endregion


export default function () {
  let currentYear = new Date().getFullYear()
  let startYear = 2020 //Grab data from 2020 til now

  var config = {
    method: 'get',
    url: "",
    headers: {
      'origin': 'https://fohm.maps.arcgis.com',
      'referer': 'https://fohm.maps.arcgis.com/apps/opsdashboard/index.html'
    }
  }

  for (let selectedYear = startYear; selectedYear <= currentYear; selectedYear++) {
    let thisWeekNbr = (selectedYear == currentYear) ? currentOrLastWeek() : 52

    for (let selectedWeek = thisWeekNbr; selectedWeek > 0; selectedWeek--) {
      let weekStr = selectedWeek.toString();
      if (selectedWeek < 10)
        weekStr = 0 + weekStr

      config.url = 'https://utility.arcgis.com/usrsvcs/servers/63de09e702d142eb9ddd865838f80bd5/rest/services/FOHM_Covid_19_kommun_FME_20201228/FeatureServer/0/query?f=json&where=veckonr_txt%3D%27' + selectedYear + '-' + weekStr + '%27&returnGeometry=false&outFields=*&outSR=4326&cacheHint=true';

      axios(config)
        .then(async function (response) {
          for (var i = 0; i < response.data.features.length; i++) {
            let featureAttribute = response.data.features[i].attributes

            let KnNamn = fixNamingDiff(featureAttribute.KnNamn)
            let adm_area = await getAdmArea(KnNamn, featureAttribute.Stadsdel)
            if (adm_area == null)
              continue;

            var epidemiology_data = getEpidemiologyTable(featureAttribute.veckonr, selectedYear, adm_area)
            epidemiology_data = Object.assign({
              "confirmed": featureAttribute.cumfreq
            }, epidemiology_data)

            await upsertTimeseries(epidemiology_data)
          }
        })
        .catch(function (error) {
          console.log(error)
        });
    }
  }
}

function getEpidemiologyTableWithDate(date, adm_area) {
  //source, country_code, area1_code and area2_code are hardcoded for now
  if (adm_area.area1_code == null) {
    console.error("adm_area in getEpidemiologyTable is missing an area1 code!")
    return;
  }

  return {
    table: "epidemiology",
    source: "SCB",
    date: date,
    country_code: "SWE",
    area1_code: adm_area.area1_code,
    area2_code: adm_area.area2_code,
    area3_code: adm_area.area3_code,
    gid: determineGid(adm_area)
  }
}

function getEpidemiologyTable(week, year, adm_area) {
  //source, country_code, area1_code and area2_code are hardcoded for now
  if (adm_area.area1_code == null) {
    console.error("adm_area in getEpidemiologyTable is missing an area1 code!")
    return;
  }

  return {
    table: "epidemiology",
    source: "SCB",
    date: firstDayOfWeek(week, year),
    country_code: "SWE",
    area1_code: adm_area.area1_code,
    area2_code: adm_area.area2_code,
    area3_code: adm_area.area3_code,
    gid: determineGid(adm_area)
  }
}

function determineGid(adm_area) {
  let gid = adm_area.gid;

  if (gid == undefined)
    gid = (adm_area.area3_code != null) ? adm_area.area3_code : adm_area.area2_code

  return gid
}

async function getAdmArea(kommunNamn, stadsdel) {
  if (!kommunNamn) {
    console.log("Missing kommunNamn!")
  } else {
    let sqlQuery = "SELECT area1_code, area2_code, area3_code FROM admin_areas WHERE country_code = 'SWE' AND area2_name = $1"
    let parameters = [kommunNamn]

    if (stadsdel != null && stadsdel != undefined) {
      stadsdel = " " + stadsdel
      sqlQuery += " AND area3_name = $2";
      parameters.push(stadsdel)
    }

    try {
      let adm_area = await Pool.query(sqlQuery, parameters)

      if (adm_area == undefined) {
        console.error("Authentication to database failed or table doesn't exist!")
        return null;
      }

      adm_area = adm_area.rows[0]

      if (adm_area == undefined) {
        console.error("Found no data with getAdmArea function in CheckAndAssignAdmArea, input was: " + kommunNamn)
        return null
      }

      return adm_area
    } catch (error) {
      console.log(error)
    }
  }
}

async function getPoolQuery(sqlQuery, parameters) {
  if (Pool == undefined) {
    console.log("[ERROR] Pool is undefined")
    return
  }

  try {
    return await Pool.query(sqlQuery, parameters)
  } catch (error) {
    console.log(error)
  }
}

function insertFromCSV(url) {
  var config = {
    method: 'get',
    url: url
  }

  axios(config)
    .then(async function (response) {
      const data = response.data
      const dataArray = csv(data)

      for (let i = 0; i < dataArray.length - 1; i++) {
        let KnNamn = dataArray[i][0].replace(/"/g, '')
        let deaths = dataArray[i][1]

        KnNamn = fixNamingDiff(KnNamn)

        if (deaths == undefined || deaths.length == 1)
          deaths = 0;

        deaths = Math.round(deaths); //Database takes integer not float

        let adm_area = await getAdmArea(KnNamn)
        if (adm_area == null) {
          console.log("No admin area found for " + KnNamn)
          continue
        }

        var epidemiology_data = getEpidemiologyTable(currentOrLastWeek(), new Date().getFullYear(), adm_area)

        if (epidemiology_data == undefined)
          return;

        epidemiology_data = Object.assign({
          "dead": deaths
        }, epidemiology_data)

        await upsertTimeseries(epidemiology_data)
      }
    })
}

/**
 * Gets and inserts dead and hospitalized_icu data for many dates into the epidemiology table in the database
 */
function getDataFromApify() {
  (async () => {
    let databaseDates = await getPoolQuery("SELECT DISTINCT date FROM epidemiology WHERE dead IS NULL OR hospitalized_icu IS NULL")
    databaseDates = databaseDates.rows
    console.log("Found " + databaseDates.length + " dates in which one or more regions are missing dead or hospitalized icu!")

    for (let i = 0; i < databaseDates.length; i++)
      databaseDates[i] = databaseDates[i].date.toLocaleDateString()

    const {
      items
    } = await apifyClient.dataset("Nq3XwHX262iDwsFJS").listItems()

    for (let index = 0; index < items.length; index++) {
      let resultArray = items[index].infectedByRegion
      let date = new Date(items[index].lastUpdatedAtApify)

      if (!databaseDates.includes(date.toLocaleDateString())) {
        console.log("No date matching " + date.toLocaleDateString() + " found in db! Skipping entry!")
        continue
      }

      for (let i = 0; i < resultArray.length; i++) {
        let item = resultArray[i]
        let region = fixNamingDiff(item.region, true);

        if (region === "Sörmland" || region === "Jämtland Härjedalen")
          continue

        let adm_area = await getPoolQuery("SELECT area1_code, gid FROM admin_areas WHERE country_code = 'SWE' AND level = '2' AND area1_name = $1 AND area2_name IS NULL", [region])
        adm_area = adm_area.rows[0];
        if (adm_area == null) {
          console.log("No admin area found for " + region)
          continue;
        }

        var epidemiology_data = getEpidemiologyTableWithDate(date, adm_area)

        if (epidemiology_data == undefined) {
          console.log("epidemiology_data for " + region + " is undefined!")
          continue;
        }

        epidemiology_data = Object.assign({
          "dead": item.deathCount,
          "hospitalized_icu": item.intensiveCareCount
        }, epidemiology_data)

        // console.log("Inserting " + epidemiology_data)

        await upsertTimeseries(epidemiology_data)
      }
    }
  })();
}

function fixNamingDiff(Name, isRegional) {
  if (isRegional) {
    if (Name !== "Orebro" && Name.includes("Örebro"))
      Name = "Orebro"
  }
  else {
    if (Name !== "Upplands-Väsby" && Name.includes("Upplands") && Name.includes("Väsby"))
      Name = "Upplands-Väsby" //# Fix naming difference between FHM and OxCOVID19 database
    else if (Name !== "Malung" && Name.includes("Malung") && Name.includes("Sälen"))
      Name = "Malung"
  }

  return Name
}

setApifyClient(); //Also gets the data if successfull
insertFromCSV('https://datawrapper.dwcdn.net/liNlg/81/dataset.csv');