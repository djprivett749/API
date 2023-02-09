const express = require('express');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static('public'));

app.use((req, res, next) => {
	const parsedQs = querystring.parse(url.parse('https://api.monkedev.com' + req.originalUrl).query);
	req.urlParams = parsedQs;
	next();
});

app.use(cors());
app.use(bodyParser.json());

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'API',
			description: 'API'
		},
		servers: ['https://api-ko1d.onrender.com']
	},
	apis: [__dirname + '/Routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

const setFolder = (dir) => {
	const routes = fs.readdirSync(dir);
	routes.forEach(route => {
		if(route.endsWith('.js')) setFile(dir + '/' + route);
		else setFolder(dir + '/' + route);
	});
};
const setFile = (dir) => {
	const file = require(dir);
	app.use(file.end, file.router);
};

const Init = async () => {

	const routes = fs.readdirSync(__dirname + '/Routes');
	routes.forEach(route => {
		if(route.endsWith('.js')) setFile(__dirname + '/Routes/' + route);
		else setFolder(__dirname + '/Routes/' + route);
	});

	app.use((req, res, next) => {
		if(req.originalUrl.startsWith('/docs/') || req.originalUrl == '/') return next();
		return res.status(404).json({
			error: true,
			message: 'Invalid endPoint'
		});
	});

	app.listen(port, () => console.log('on port: ' + port));

};

Init();
