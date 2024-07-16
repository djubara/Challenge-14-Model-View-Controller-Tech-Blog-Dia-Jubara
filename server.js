// Description: This file is the entry point for the application. It sets up the server and the port, and syncs the database. It also sets up the express-handlebars engine and the session store. It also registers the handlebars helpers.
const PORT = process.env.PORT || 3001;
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const routes = require('./controllers');
const sequelize = require('./config/connection');

const SequelizeStore = require('connect-session-sequelize')(session.Store);
const hbs = exphbs.create({});

// Middleware

app.use(session(sess));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

// Handlebars helpers

const handlebars = require('handlebars');

handlebars.registerHelper('eq', function (arg1, arg2, options) {
    if (arg1 === arg2) {
        return options.fn ? options.fn(this) : '';
    } else {
        return options.inverse ? options.inverse(this) : '';
    }
});

handlebars.registerHelper('format_date', (date) => {
    return date.toLocaleDateString();
});


// Express.js server setup and connection   

const app = express();

const sess = {
    secret: 'Super secret secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    },
    store: new SequelizeStore({
        db: sequelize
    })
};

// Starting the server
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => console.log(`Server is now running on http://localhost:${PORT}`));
});