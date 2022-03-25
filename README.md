# Catalyst CLI

Catalyst synchronization to automate data loading.

Recommended plugins for Visual Studio Code:

- Code Spell Checker.
- Markdownlint.
- vscode-icons.
- ESLint.
- Prettier.

## Development server

If this is the first time the project is downloaded from the repository, you must execute the command `npm install` to download all the packages and dependencies.

Also, it's required to create the file `local-dev.json` in the `/config` folder. You can use the file `local-dev.example.json` as a template.

### To start the server

- Run the command: `npm start`

  Note: There is a configuration file in the path "/.vscode/launch.json" called "Launch Program" to debug the project by using Visual Studio Code, just select "Run" from the menu and then "Start Debugging".

### To execute test cases

- Run the command: `npm test`

  Note: There is a configuration file in the path "/.vscode/launch.json" to debug the test cases by using Visual Studio Code, just select "Run" from the menu and then "Start Debugging". There are two different configurations, one of them is for debugging unit test cases and the other one for debugging integration test cases.

### To run the linter

- Run the command `npm run lint`

## Production server

### To install the CLI

- Run the command: `npm run global-install`
  
  The previous command will install the CLI in the system and will execute the default defined task. After the installation, you will be able to run any command listed under the "bin" structure defined in the package.json.
