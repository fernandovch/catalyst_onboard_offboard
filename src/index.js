#!/usr/bin/env node

process.env.NODE_ENV = process.env.NODE_ENV || "local-dev";
const chalk = require("chalk");
const config = require("config");
const clear = require("clear");
const { program } = require("commander");
const figlet = require("figlet");
const OnboardingOffBoardingAccountService = require('./services/on-boarding-off-boarding-service');
const logger = require("log4js").configure(config.get("log4js")).getLogger("Index");
const run_job = config.get("run_job");

clear();

// Styling the project's name
console.log(chalk.green(figlet.textSync("Catalyst-CLI", { horizontalLayout: "full" })));

// Defining the allowed commands
program
    .version("1.0.0")
    .description("Catalyst synchronization to automate data loading")
    .option("--accounts", "Sync accounts with Catalyst")
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
} else {
    if (program.accounts) {
        if (run_job.account_sync) {
            logger.info("Starting Catalyst Account Synchronization...");
            const catalystAcctSyncUpService = new OnboardingOffBoardingAccountService();
            catalystAcctSyncUpService.startSyncUp();
        } else {
            logger.info("Job Run Is Disabled For Catalyst Account synchronization.");
        }
    }    
}
