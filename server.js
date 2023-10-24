const express = require("express");
const appController = require("./appController");
const cors = require("cors");

// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
const loadEnvFile = require("./utils/envUtil");
const envVariables = loadEnvFile("./.env");

const app = express();
const PORT = envVariables.PORT || 65534; // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// Middleware setup
// app.use(express.static('public'));  // don't serve static files, we're using react instead
app.use(express.json()); // Parse incoming JSON payloads
app.use(cors());

// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });

// mount the router
app.use("/", appController);

// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
