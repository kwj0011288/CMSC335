const path = require("path");
const express = require("express");
const app = express(); 
const bodyParser = require("body-parser");
const portNumber =5002;


require("dotenv").config({ path: path.resolve(__dirname, 'credentialsDontPost/.env') })
const {MongoClient, ServerApiVersion} = require('mongodb');

const MONGO_DB_USERNAME = "wkim1128"
const MONGO_DB_PASSWORD = "AfOrrHNldtgS4PSt"
const MONGO_DB_NAME = "CMSC335_DB"
const MONGO_COLLECTION = "campApplicants"


const databaseAndCollection = {db: MONGO_DB_NAME, collection: MONGO_COLLECTION};

const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });



let server = app.listen(portNumber, async () => {
    console.log(`Web server started and running at http://localhost:${portNumber}`);
    console.log(`Stop to shutdown the server: `);
    await client.connect();
});



process.stdin.on("readable", () => {
    let dataInput = process.stdin.read();
    if (dataInput !== null) {
        let command = dataInput.toString().trim();

        if (command === "stop") {
            console.log("Shutting down the server");
            server.close(() => {
                client.close();
                process.exit(0);
            });
        }
    }
});

const localPath = path.resolve(__dirname, "templates");
app.use(express.static(localPath));
app.set("views", localPath);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response) => {
    response.render("index.ejs");
});

app.get("/apply", (request, response) => {
    response.render("apply.ejs", {portNumber:portNumber});
});

app.post("/processApplication", async (request, response) => {
    const res = {name: request.body.name, 
        email: request.body.email, 
        gpa: request.body.gpa, 
        background: request.body.background,
         date: new Date()};
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(res);
    response.render("processApplication.ejs", res);
});

app.get("/reviewApplication", (request, response) => {
    response.render("reviewApplication.ejs", {portNumber:portNumber});
});

app.post("/processReviewApplication", async(request, response) => {

    let filter = {email: request.body.email};
    const res = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);
    response.render("processReviewApplication.ejs", res);
});

app.get("/adminGFA", (request, response) => {
    response.render("adminGFA.ejs", {portNumber: portNumber});
});

app.post("/processAdminGFA", async(request, response) => {

    let filter = {};

    const cursor = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find(filter);
    const result = await cursor.toArray();
    let gpa = Number(request.body.gpa);
    let res = result.filter((a) => Number(a.gpa) >= gpa);
    let table = "<table border=1> <tr><th>Name</th> <th>GPA</th></tr>";
    res.forEach((a) => {
        table += `<tr><td>${a.name}</td> <td>${a.gpa}</td></tr>`;
    });
    table += "</table>";
    response.render("processAdminGFA.ejs", {table:table});
});

app.get("/adminRemove", (request, response) => {
    response.render("adminRemove.ejs", {portNumber:portNumber});
});

app.post("/processAdminRemove", async(request, response) => {
    const result = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .deleteMany();

    const counter = result.deletedCount;

    response.render("processAdminRemove.ejs", {number: counter});
});