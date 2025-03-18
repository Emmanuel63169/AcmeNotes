/* import and initialize express app */
const express = require('express')
const app = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL ||'postgres://localhost/acme_hr_db')
const employees = require('./db')

/* this middleware deals with CORS errors and allows the client on port 5173 to access the server */
const cors = require('cors');

/* morgan is a logging library that allows us to see the requests being made to the server */
const morgan = require('morgan');

/* set up express middleware */
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* set up intial hello world route */
app.get('/', (req, res) => {
  res.send('Hello World!')
})
/* set up api route */
app.get('/api/employees', async (req, res, next) => {
  try{
    const SQL =`
    SELECT * from employees;
    `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch(ex) {
    next(ex)
  }
})

/* our middleware won't capture 404 errors, so we're setting up a separate error handler for those*/
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

/* initialize server (listen) */
const init = async () => {
  await client.connect();
const SQL = /*sql*/`
  DROP TABLE IF EXISTS employees;
  CREATE TABLE employees(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    phone VARCHAR(255),
    isAdmin BOOLEAN DEFAULT FALSE
);

`;
// INSERT INTO employees(txt, starred) VALUES('Test Text', 'false')
await client.query(SQL)
employees.forEach(async (emp) => {
  await client.query(`
  INSERT INTO employees(name, phone, isAdmin) VALUES($1, $2, $3);
  `, [emp.name, emp.phone, emp.isAdmin]) 
})
console.log('data connected')
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))
}

init()