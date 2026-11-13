// Loads the single root .env file for the whole project.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
