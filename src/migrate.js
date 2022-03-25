#!/usr/bin/env node

process.env.NODE_ENV = process.env.NODE_ENV || "local-dev";
const chalk = require("chalk");
const config = require("config");
const clear = require("clear");
const { program } = require("commander");
const figlet = require("figlet");
const logger = require("log4js").configure(config.get("log4js")).getLogger("Index");
const run_job = config.get("run_job");

clear();

// Styling the project's name
console.log(
    chalk.green(figlet.textSync("Catalyst-CLI Migration", { horizontalLayout: "full" }))
);

if (!process.argv.slice(2).length) {
    logger.info("No Migration file name passed as argument.");
    program.outputHelp();
} else {
    if (run_job){
        const migrationFile = process.argv.slice(2)[0];
        logger.info("Starting to run migration...");
        const Migration = require(`./migrations/${migrationFile}/index`);
        const migration = new Migration();
        migration.start();
    }
    else {
        logger.info("Job run is disabled...");
    }
}