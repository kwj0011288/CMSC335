const http = require('http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const portNumber = 5001;
const app = express();
const localPath = path.resolve(__dirname, "templates");

class Item {
    #name;
    #cost;

    constructor(name, cost) {
        this.#name = name;
        this.#cost = cost;
    }

    get name() {
        return this.#name;
    }

    get cost() {
        return this.#cost;
    }
}

const itemsList = JSON.parse(fs.readFileSync(__dirname + "/" + process.argv[2])).itemsList.map(item => new Item(item.name, item.cost));

console.log(`Web server is running at http://localhost:${portNumber}`);
console.log(`Type itemsList or stop to shutdown the server: `);
process.stdin.setEncoding("utf8"); /* encoding */

if (process.argv.length > 3) {
    process.stdout.write(`Usage supermarketServer.js jsonFile`);
    process.exit(1);
}
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	const dataInput = process.stdin.read();
	if (dataInput !== null) {
		const command = dataInput.trim();

        if(command ==="itemList"){ //need to implement
            console.log(itemsList.map(item => ({name: item.name, cost: item.cost})));
        }

		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } else {
			/* After invalid command, we cannot type anything else */
			console.log(`Invalid command: ${command}`);
		}
        console.log(`Type itemsList or stop to shutdown the server: `);
        process.stdin.resume();
    }
});

/// Done first part






app.get("/", (request, response) => {
    app.use(express.static(localPath));
    app.set("views", localPath);
    app.set("view engine", "ejs");
    response.render("index.ejs");
    response.end();
});

app.get("/catalog", (request, response) => { 
    app.use(express.static(localPath));
    app.set("views", localPath);
    app.set("view engine", "ejs");

    let table = "<table border= 1> <tr> <th> Item </th> <th> Cost </th> </tr>";
    itemsList.forEach(item => {
        table += `<tr> <td> ${item.name} </td> <td> ${item.cost.toFixed(2)} </td> </tr>`;
    });
    table += "</table>";
    response.render("displayItems.ejs", {itemsTable: table});
    response.end();
});

//This endpoint displays the displayItems.ejs template with the table of items available.
app.get("/order", (request, response) => { 
    app.use(express.static(localPath));
    app.set("views", localPath);
    app.set("view engine", "ejs");

    let itemlist = "";
    itemsList.forEach(
        (item)=> (itemlist += `<option value="${item.name}">${item.name}</option>`)
    );

    response.render('placeOrder.ejs', {items:itemlist});
    response.end();
});
 //This endpoint displays the placeOrder.ejs template with the table of items available.

 app.use(bodyParser.urlencoded({extended:false}));

app.post("/order", (request, response) => {
    app.use(express.static(localPath));
    app.set("views", localPath);
    app.set("view engine", "ejs");

    let {name, email, delivery, itemsSelected} = request.body;
    let cost = 0;
    let orderTable = "<table border=1> <tr> <th> Item </th> <th> Cost </th> </tr>";

    console.log(`Received order from ${name} with email ${email} for delivery method ${delivery}. Items selected: ${itemsSelected}`);

    if(typeof(itemsSelected) !== "string"){
        itemsSelected.forEach((selectedItem) => {
            let item = itemsList.find((item) => item.name === selectedItem);
            if(item){
            orderTable += `<tr> <td>${item.name}</td> <td>${item.cost.toFixed(2)}</td> </tr>`;
            cost += Number(item.cost.toFixed(2));
            }
        });
       
    } else{
        let item = itemsList.find((item) => item.name === itemsSelected);
        orderTable += `<tr> <td>${itemsSelected}</td> <td>${item.cost.toFixed(2)}</td> </tr>`;
        cost += Number(item.cost.toFixed(2));
    }
    orderTable += `<tr> <td>Total Cost: </td> <td>${cost}</td> </tr></table>`;
    response.render('orderConfirmation.ejs', {name:name, email:email, delivery:delivery, orderTable:orderTable});
    response.end();
});
app.listen(portNumber);
console.log(`Server started on port ${portNumber}`);