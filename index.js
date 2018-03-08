const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/post', (req, res) => {
	 var weight = Number(req.query.weight);
	 var postage = req.query.postage;
	 
	 var price;
	 
	 switch(postage.toString())
	 {
		case 'stamp':
			if (weight < 2)
				price = .5;
			else if (weight >= 2 && weight < 3)
				price = .71;
			else if (weight >= 3 && weight < 3.5)
				price = .92;
			else
				price = 1.13;
			break;
		case 'meter':
			if (weight < 2)
				price = .47;
			else if (weight >= 2 && weight < 3)
				price = .68;
			else if (weight >= 3 && weight < 3.5)
				price = .89;
			else
				price = 1.10;
			break;
		case 'flat':
			if (weight < 2)
				price = 1;
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
				price = 3.10;
			else if (weight >= 12 && weight < 13)
				price = 3.31;
			else 
				price = 3.52;
			break;
		case 'retail':
			if (weight < 5)
				price = 3.5;
			else if (weight >= 5 && weight < 9)
				price = 3.75;
			else if (weight >= 9 && weight < 10)
				price = 4.10;
			else if (weight >= 10 && weight < 11)
				price = 4.45;
			else if (weight >= 11 && weight < 12)
				price = 4.80;
			else if (weight >= 12 && weight < 13)
				price = 5.15;
			else 
				price = 5.50;
			break;
	 }
	 res.render("results", {price: String(price), postage: String(postage), weight: String(weight)});
  })
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
