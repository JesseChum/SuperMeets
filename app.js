const express = require("express");
const mariadb = require("mariadb");

//Database access
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "3333",
  database: "carevents",
});

//connecting to database
async function connect() {
  try {
    const conn = await pool.getConnection();
    console.log("Connected to the database");
    return conn;
  } catch (err) {
    console.log("Error connecting to datavase: " + err);
  }
}

const app = express();

const PORT = 3000;

app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

//app.get home and rendering the page
app.get("/", (req, res) => {
  res.render("home", { data: {}, errors: [] });
});

//getting the entries page and rendering it
app.get("/upcoming-meets", async (req, res) => {
  try {
    const conn = await connect();
    const data = await conn.query("SELECT * FROM carevent_entries");
    res.render("upcoming-meets", { details: data });
  } catch (err) {
    console.error("Error fetching entries:", err);
  }
});

//app.get for LINKS and rendering it
app.get("/home", (req, res) => {
  res.render("home");
});

//app.get for create-meet page and rendering it
app.get("/create-meet", (req, res) => {
  res.render("create-meet");
});

//app.get for upcoming-meets page and rendering it
app.get("/upcoming-meets", (req, res) => {
  res.render("upcoming-meets");
});

app.post("/submit", async (req, res) => {
  const data = req.body;
  const errors = [];
  let isValid = true;

  //posting the confirmation page and rendering it
  app.post("/create-meet", (req, res) => {
    res.render("create-meet");
  });

  //Delete button function
  app.post("/delete-entry/:id", async (req, res) => {
    const entryId = req.params.id; //Capture the ID from the route
    try {
      const conn = await connect(); //Getting a database connection
      await conn.query("DELETE FROM carevent_entries WHERE id = ?", [entryId]); //Using the ID to delete
      console.log(`Deleted entry with ID: ${entryId}`);
      res.redirect("/create-meet"); //Redirect to entries page after deletion
    } catch (err) {
      console.error("Error deleting entry:", err); //Error if theres a problem deleting entry
    }
  });

  //Connecting to database
  const conn = await connect();

  //Writing to the database
  await conn.query(
    `INSERT INTO carevent_entries (first_name, last_name, event_name, location, vehicle_name, car_category, event_date, message) VALUES 
  ("${data.first_name}", "${data.last_name}", "${data.event_name}", "${data.location}", "${data.vehicle_name}", "${data.car_category}",
     "${data.event_date}", "${data.message}")`
  );

  // Display the confirm page, pass the data
  console.log(data);
  res.render("create-meet", { details: data });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
