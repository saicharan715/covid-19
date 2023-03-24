const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "covid19India.db");

let db = null;

const convert = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initilizeDBAndServer();

app.get("/states/", async (request, response) => {
  const getStates = `
    SELECT * FROM state;`;
  const statesArray = await db.all(getStates);
  response.send(statesArray.map((each) => convert(each)));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;

  const getState = `
    SELECT * FROM state WHERE state_id = ${stateId};`;
  const stateObj = await db.get(getState);

  response.send(stateObj);
});

app.post("/districts/", async (request, response) => {
  const stateDetails = request.body;

  const { districtName, stateId, cases, cured, active, deaths } = stateDetails;

  const addStateDetails = `
    INSERT INTO district(district_name, state_id, cases, cured, active, deaths)

    VALUES(
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}'
    );`;

  const dbResponse = await db.run(addStateDetails);

  const districtId = dbResponse.lastId;

  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const getDistrict = `
    SELECT * FROM district WHERE district_id = ${districtId};`;
  const districtObj = await db.get(getDistrict);

  response.send(districtObj);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrict = `
    SELECT * FROM district WHERE district_id = ${districtId};`;

  await db.run(deleteDistrict);

  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateDistrictDetails = `
    UPDATE district 
    SET 
    district_name = '${districtName}',
    state_id = '${stateId}',
    cases = '${cases}',
    cured = '${cured}',
    active = '${active}',
    deaths = '${deaths}'
    
    WHERE district_id = ${districtId};`;

  await db.run(updateDistrictDetails);

  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const getStats = `
    SELECT * FROM district WHERE state_id = ${stateId};`;

  const districtObj = await db.get(getStats);

  response.send({
    totalCases: district.cases,
    totalCured: district.cured,
    totalActive: district.active,
    totalDeaths: district.deaths,
  });
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const getStateName = `
    SELECT * FROM district WHERE district_id = ${districtId};`;

  const stateObj = await db.get(getStateName);

  response.send({
    stateName: state.state_name,
  });
});

module.exports = app;
