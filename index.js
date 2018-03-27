const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool, Client } = require('pg')
var bodyParser = require('body-parser');
var session = require('client-sessions');
const duration = 30 * 60 * 1000;
const active = 5 * 60 * 1000;
const saltRounds = 10;
var bcrypt = require('bcrypt');
var pg = require('pg');
var app = express();
var nodemailer = require('nodemailer');
var pool = null;


if(process.env.DATABASE_URL){
	var url = "postgres://wtzhtfgoffnsxy:906fb59ea78505391a4ad64e3785d0f5ee41a95a12223c0289f2077a092b3112@ec2-54-243-129-189.compute-1.amazonaws.com:5432/dmhjfhq7qqrce";
	pool = new Pool({
		connectionString: url
	});
}
else{


    pool = new Pool({
	user: 'rentaluser',
	host: 'localhost',
	database: 'rentals',
	password: 'IsaacsonR',
	port: 5432,
	poolSize: 10	
}) 
}



express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
	  extended: true
  }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/test', (req, res) => {
	  res.send("testing");
  })
  .get('/getPerson', (req, res) => {
		pool.query("SELECT id FROM person", function(err, result){

		if (err)
			res.send("didn't get person");
		else
			res.json(result.rows[0].id);
		})
//	pool.end();
	})
	
	.get('/home', (req, res) =>{
	   res.render('home');
   })
   .post('/email', (req, res) =>{
	   
	   
	   
	   var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			user: 'irentalscontact@gmail.com',
			pass: 'IsaacsonR'
			}
		});

		var mailOptions = {
			from: req.body.email,
			to: 'taylorhisaacson@gmail.com',
			subject: 'FROM: ' + req.body.name,
			text: 'FROM: ' + req.body.name + '\n\n' + req.body.message + '\n\n reply to:  ' + req.body.email
		};

		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
			console.log(error);
			} else {
			console.log('Email sent: ' + info.response);
			}
		});
	   res.render('home');
   })
   .get('/admin', (req, res) =>{
	   pool.query("SELECT * FROM item", function(err, result){

		if (err)
			res.send("error in item retrieval");
		else
			res.render('admin', {results: result.rows});
		});
   })
   .post('/createItem', (req, res) =>{
	   var name = req.body.name;
	   var description = req.body.description;
	   var quantity = req.body.quantity;
	   
	   var query = "INSERT INTO item (name, description, quantity) VALUES ('" + name + "', '" + description + "', " + quantity + ")";
	   
	   pool.query(query, function(err, result){
			if (err)
			{
				console.log("query failed to create item: " + err);
				res.send("There was a problem and the item didn't get added to the data base");
			}
			else{
				console.log("didn't fail");
				res.render('home');
			}
	   });
   })
   .post('/createReservation', (req, res) =>{
	   
		var first = req.body.first;
		var last = req.body.last;
		var email = req.body.email;
		var phone = req.body.phone;
		var item = req.body.item;
		var quantity = req.body.amount;
		var date = req.body.date;
		var personId = 0;
		var itemId = 0;
		var reservedItemId = 0;
		
		var personQuery = "INSERT INTO person (firstname, lastname, email, phone) VALUES ('" + first + "', '" + last + "', '" + email + "', '" + phone + "')";
		var itemQuery = "SELECT id FROM item WHERE name = '" + item + "'";
		
		var findPersonQuery = "SELECT id FROM person WHERE firstname = '" + first + "' AND lastname = '" + last + "'";
		
		pool.query(personQuery, function(err, result){
			if (err)
				console.log("could not insert person");
			else{
			
				pool.query(findPersonQuery, function(err, result){
					if (err)
						console.log("failed to retrieve new person");
					else{
						var json = JSON.parse(result.rows[0].id);
						personId = json;
						console.log("person id received: " + personId);
					}
				});
			
				pool.query(itemQuery, function(err, rest){
					if (err){
						console.log("failed to find item");
					}
					else{
						itemId = JSON.parse(rest.rows[0].id); 
						console.log("Item id: " + itemId);
								
						var reservedItemQuery = "INSERT INTO reserveditem (personid, itemid) VALUES (" + personId + ", " + itemId + ")" ;
		
						pool.query(reservedItemQuery, function(err, result){
							if (err)
								console.log("failed to reserve item");
							else{
								var itemIdQuery = "SELECT id FROM reserveditem WHERE personid = '" + personId + "' AND itemid = '" + itemId + "'";
								
								pool.query(itemIdQuery, function(err, res){
									if (err)
										console.log("error checking item id");
									else{
										reservedItemId = JSON.parse(res.rows[0].id);
														
										var reservationQuery = "INSERT INTO reservation(reserveditemid, day) VALUES (" + reservedItemId + ", '" + date + "')";
					
										console.log("reserved item id: " + reservedItemId);
										console.log("DATE:  " + date);
										pool.query(reservationQuery, function(err, result){
											if (err)
												console.log("failed to create reservation");
											else 
												console.log("success!!!!!!");
										});
									}
								});
							}
						});
					}
				});				
			}
		});
		
		res.render('home');
		
   })
   .get('/about-us', (req, res) =>{
	   res.render('aboutUs');
   })
   .get('/contact-us', (req, res) =>{
	   res.render('contactUs');
   })
   .get('/calendar', (req, res) =>{
	   pool.query("SELECT day, name, lastname, firstname, itemid, personid, reserveditemid, itemid FROM reservation JOIN reserveditem ON reservation.reserveditemid = reserveditem.id JOIN item ON reserveditem.itemid = item.id JOIN person ON reserveditem.personid = person.id", function(err, result){
		  
		if (err)
			res.send("error in calendar");
		else
		{
			res.render('calendar', {results: result.rows});
		}
		})
//		pool.end();
   })
   .get('/contract', (req, res) =>{
	   res.render('contract');
   })
   .get('/items', (req, res) =>{
	   pool.query("SELECT * FROM item", function(err, result){

		if (err)
			res.send("error in items");
		else
			res.render('items', {results: result.rows});
		})
//		pool.end();
   })
   //This is only here because it has not yet been graded
  .get('/post', (req, res) => {
	 var weight = Number(req.query.weight);
	 var postage = req.query.postage;
	 
	 var price;
	 
	 switch(postage.toString())
	 {
		case 'stamp':
			if (weight < 2)
				price = ".50";
			else if (weight >= 2 && weight < 3)
				price = .71;
			else if (weight >= 3 && weight < 3.5)
				price = .92;
			else
				price = 1.13;
			postage = 'Stamped Letter';
			break;
		case 'meter':
			if (weight < 2)
				price = .47;
			else if (weight >= 2 && weight < 3)
				price = .68;
			else if (weight >= 3 && weight < 3.5)
				price = .89;
			else
				price = "1.10";
			postage = 'Metered Letter';
			break;
		case 'flat':
			if (weight < 2)
				price = "1.00";
			else if (weight >= 2 && weight < 3)
				price = 1.21;
			else if (weight >= 3 && weight < 4)
				price = 1.42;
			else if (weight >= 4 && weight < 5)
				price = 1.63;
			else if (weight >= 5 && weight < 6)
				price = 1.84;
			else if (weight >= 6 && weight < 7)
				price = 2.05;
			else if (weight >= 7 && weight < 8)
				price = 2.26;
			else if (weight >= 8 && weight < 9)
				price = 2.47;
			else if (weight >= 9 && weight < 10)
				price = 2.68;
			else if (weight >= 10 && weight < 11)
				price = 2.89;
			else if (weight >= 11 && weight < 12)
				price = "3.10";
			else if (weight >= 12 && weight < 13)
				price = 3.31;
			else 
				price = 3.52;
			postage = 'Large Envelope';
			break;
		case 'retail':
			if (weight < 5)
				price = "3.50";
			else if (weight >= 5 && weight < 9)
				price = 3.75;
			else if (weight >= 9 && weight < 10)
				price = "4.10";
			else if (weight >= 10 && weight < 11)
				price = 4.45;
			else if (weight >= 11 && weight < 12)
				price = 4.80;
			else if (weight >= 12 && weight < 13)
				price = 5.15;
			else 
				price = "5.50";
			postage = 'First-Class Package Service'
			break;
	 }
	 res.render("results", {price: String(price), postage: String(postage), weight: String(weight)});
  })
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
