// quick script to set up the database
import { query } from "./db.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // read the schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // split by semicolons and run each command
    const commands = schema.split(";").filter((cmd) => cmd.trim());

    for (const command of commands) {
      if (command.trim()) {
        await query(command);
      }
    }

    console.log("Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
