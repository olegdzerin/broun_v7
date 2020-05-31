var express = require('express'),
    fortune = require('./lib/fortune.js'),
    formidable = require('formidable'),
    getWeatherData = require('./lib/getWeatherData'),
    getAdress = require('./lib/getAdress');


var app = express();

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

// set 'showTests' context property if the querystring contains test=1
app.use(function (req, res, next) {
    res.locals.showTests = app.get('env') !== 'production' &&
        req.query.test === '1';
    next();
});

// mocked weather data


// middleware to add weather data to context
app.use(function (req, res, next) {
    if (!res.locals.partials) res.locals.partials = {};
    res.locals.partials.weatherContext = getWeatherData();
    res.locals.contact = getAdress;
    next();
});

app.get('/', function (req, res) {
    res.render('home');
});
app.post('/', function (req, res) {
    console.log(req.body.url)
    console.log(req.headers["content-encoding"])
    console.log(req.headers["content-type"]);
    res.status = 200;
    // res.setHeader("Content-type","text/html");
    //  res.send("res_send");
    res.render('tours/oregon-coast');

});
app.get('/about', function (req, res) {
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});
app.get('/contact', function (req, res) {
    res.render('contact', {
        contact: res.locals.contact
    });
});
app.get('/aboutForm', function (req, res) {
    res.render('aboutForm', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});
app.post('/aboutForm', function (req, res) {
    var body = req.body;
    console.log(body);
    console.log(req.headers);
    res.setHeader("Content-type", "text/text");
    res.send("Ми прийняли ваші дані");
});
app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});
app.get('/tours/oregon-coast', function (req, res) {
    res.render('tours/oregon-coast');
});
app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});
app.get('/tours/process', function (req, res) {
    console.log(req.query);
    console.log(req.body);
    console.log(req.params);
    res.render('tours/process');
});
app.post('/tours/process', function (req, res) {
    console.log(req.query);
    console.log(req.body);
    console.log(req.params);
    res.render('tours/process');
});

app.get('/jquery-test', function (req, res) {
    res.render('jquery-test');
});
app.get('/nursery-rhyme', function (req, res) {
    res.render('nursery-rhyme');
});
app.get('/data/nursery-rhyme', function (req, res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});
app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});
app.get('/newsletter', function (req, res) {
    // we will learn about CSRF later...for now, we just
    // provide a dummy value
    res.render('newsletter', {
        csrf: 'CSRF token goes here'
    });
});
app.post('/process', function (req, res) {
    if (req.xhr || req.accepts('json,html') === 'json') {
        // if there were an error, we would send { error: 'error description' }
        res.send({
            success: true,
            data: req.body,

        });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});
app.get('/contest/vacation-photo', function (req, res) {
    var now = new Date();
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

// 404 catch-all handler (middleware)
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});