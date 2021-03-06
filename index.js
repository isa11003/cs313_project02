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

var verifyLogin = function (req, res, next) {
	if (typeof req.session.user != "undefined"){
		next();
	}
	else {
	res.status(401).send("You broke me, now you can't login");
	}
} 


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
	.use(session({cookieName: 'session', secret: 'user-session', duration: duration, activeDuration: active,}))
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
			//to: isaacsonrentals@gmail.com,
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
	   res.render('thanks');
   })
   .get('/login', (req, res) =>{
	   if (req.session.admin != undefined)
		   return res.redirect('/admin');
	   else
		res.render('login');
   })
   .post('/auth', (req,res) =>{
	   
	   var userName = req.body.username;
	   var password = req.body.password;
	   
		pool.query("SELECT name, password FROM admin", (err, response) => {
			if (err){
				console.log("error looking for admin");
				res.send("error error, danger will Robinson DANGER!!!!!!!!")
			}
			else{
				
				console.log("username: " + userName);
				console.log("password: " + password);
				console.log(response.rows[0].name);
				console.log(response.rows[0].password);
				
				if (userName == response.rows[0].name){
					bcrypt.compare(password, response.rows[0].password, function(err, result) {
						if (result == true)
						{
							req.session.admin = req.body.username;
							return res.redirect('/admin');
						}
						else
							return res.redirect('/login');
					});
					
				}
				else{					
					return res.redirect('/home');
				}
			}
		})
   })
	.get('/logout', (req, res) =>{
		req.session.admin = undefined;
		req.session.destroy();
		return res.redirect('/home');
   })
   .get('/admin', (req, res) =>{
	   
		if (req.session.admin != undefined){
 
			
					pool.query("SELECT name FROM item", function (err, names){
						if (err)
							res.send("ERROR in item retrieval")
						else
							res.render('admin', {results: names.rows});
					});
		}
		else{
			return res.redirect('/login');
		}
	//	pool.end();
   })
   .get('/adminCalendar', (req, res) =>{
		if (req.session.admin != undefined){
			pool.query("SELECT reservation.id, day, name, lastname, firstname, reservation.quantity, itemid, email, phone FROM reservation JOIN item ON reservation.itemid = item.id order by day ASC", function(err, result){

				if (err)
					res.send("error in item retrieval");
				else{
					res.render('adminCalendar', {results: result.rows});
				}
			});
		}
		else{
			return res.redirect('/login');
		}
   })
   .post('/createItem', (req, res) =>{
	   var name = req.body.name;
	   var description = req.body.description;
	   var quantity = req.body.quantity;
	   
	   var query = "INSERT INTO item (name, description, quantity) VALUES ('" + name + "', '" + description + "', " + quantity + ")";
	   
	   
	   pool.query(query, function(err, res){
			if (err)
			{
				console.log("query failed to create item: " + err);
				res.send("There was a problem and the item didn't get added to the data base");
			}
			else
			{
				console.log("didn't fail");
			}
	   });
	   return res.redirect('/admin');
	   
	//   pool.end();
   })
   .post('/createReservation', (req, res) =>{
	   
		var first = req.body.first;
		var last = req.body.last;
		var email = req.body.email;
		var phone = req.body.phone;
		var item = req.body.item;
		var quantity = req.body.amount;
		var day = req.body.date;
		var personId = 0;
		var itemId = 0;
		var reservedItemId = 0;
		var isReturning = false;
		
		var itemQuery = "SELECT id FROM item WHERE name = '" + item + "'";
		
		pool.query(itemQuery, function(err, result){
			if (err){
				console.log("failed to find item");

			}
			else{
				itemId = JSON.parse(result.rows[0].id);
				
				var reservationQuery = "INSERT INTO reservation (itemid, quantity, firstname, lastname, email, phone, day) VALUES (" + itemId + ", " + quantity + ", '" + first + "', '" + last + "', '" + email + "', " + phone + ", '" + day + "')";
				
				pool.query(reservationQuery, function (err, res){
					if (err)
						console.log("error inserting into reservation" + err);
					else{
						console.log("SUCCESS!!!!!!!!!!!");
						
					}
				});
			}					
		});
		return res.redirect('/admin')
//		pool.end();
			
   })
   .post('/delete', (req, res) =>{
	   
	   console.log("trying to delete");
	   var deleteQuery = "DELETE FROM reservation WHERE id = " + req.body.resId;
	   
	   pool.query(deleteQuery, function(err, result){
		   if (err)
			   res.send("failed to delete reservation");
		   else
			   return res.redirect('/admin');
	   });
   })
   .get('/about-us', (req, res) =>{
	   res.render('aboutUs');
   })
   .get('/contact-us', (req, res) =>{
	   res.render('contactUs');
   })
   .get('/calendar', (req, res) =>{
		
		var query = "SELECT name, itemid, day, reservation.quantity FROM reservation JOIN item ON item.id = itemid";
		
		pool.query(query, function(err, result){
		   if (err)
				res.send("failed to load Calendar");
		   else
				res.render('calendar', {results: result.rows});
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
		});
//		pool.end();
   })
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
