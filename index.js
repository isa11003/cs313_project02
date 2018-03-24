const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool, Client } = require('pg')
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
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/test', (req, res) => {
	  res.send("testing");
  })
  .get('/getPerson', (req, res) => {
		pool.query("SELECT * FROM person", function(err, result){

		if (err)
			res.send("didn't get person");
		else
			res.json(result.rows);
		})
//	pool.end();
	})
	
	.get('/home', (req, res) =>{
	   res.render('home');
   })
   .get('/email', (req, res) =>{
	   
	   
	   
	   var transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			user: 'irentalscontact@gmail.com',
			pass: 'IsaacsonR'
			}
		});

		var mailOptions = {
			from: req.query.email,
			to: 'taylorhisaacson@gmail.com',
			subject: 'FROM: ' + req.query.name,
			text: 'FROM: ' + req.query.name + '\n' + req.query.message + '\n\n reply to:  ' + req.query.email
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
	   res.render('admin');
   })
   .get('/createItem', (req, res) =>{
	   var name = req.query.name;
	   var description = req.query.description;
	   var quantity = req.query.quantity;
	   
	   var query = "INSERT INTO item (name, description, quantity) VALUES ('" + name + "', '" + description + "', '" + quantity + "')";
	   
	   pool.query(query, function(err, result){
			if (err)
				console.log("query failed");
			else
				console.log("didnt fail");
	   });
	   
	   res.render('admin');
   })
   .get('/createReservation', (req, res) =>{
	   
		var first = req.query.first;
		var last = req.query.last;
		var email = req.query.email;
		var phone = req.query.phone;
		var item = req.query.item;
		var quantity = req.query.amount;
		var date = req.query.date;
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
						personId = result.rows[0].id;
						console.log("person id received: " + personId);
					}
				});
			
				pool.query(itemQuery, function(err, result){
					if (err){
						console.log("failed to find item");
					}
					else{
						itemId = result.rows[0].id;
						console.log(itemId);
								
						var reservedItemQuery = "INSERT INTO reserveditem (personid, itemid) VALUES (" + personId + ", " + itemId + ")" ;
		
						pool.query(reservedItemQuery, function(err, result){
							if (err)
								console.log("failed to reserve item");
							else{
								reservedItemId = results.rows[0].id;
											
								var reservationQuery = "INSERT INTO reservation(reserveditemid, day) VALUES (" + reservedItemId + ", " + date + ")";
			
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
		
		
	   res.render('home'); 	
	   //res.render("person id:" + personId + "item id: " + itemId + "reserved item id: " + reservedItemId);
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
