# D2-Vendor-Alert

D2-Vendor-Alert is a Discord bot integrated with Destiny 2's API. It's function is to alert users of any unowned mods sold by the vendors, Banshee-44 and Ada-1.

Follow these simple steps to add D2-Vendor-Alert to your Discord server:
  
  1. Vist this [URL](https://discord.com/api/oauth2/authorize?client_id=1074875161968398376&permissions=2048&scope=bot%20applications.commands) to authorize the bot on your Discord server.
  2. Run the `/alert` slash command from the Discord server the bot was authorized for. The command can be executed by typing "/alert".
  3. Follow the prompts!

## Contributing
Create a pull request against the main branch and if it passes through the GitHub Action pipeline and a cursory look, I'll ensure it gets merged in.

## Development
  - Install Node version 19, use this [doc](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for help if needed
  - Clone repo
  - Use the ".example.env" file as a template for an actual ".env" file, located at the root of the project.
    - The example file lists out every required property needed for local development, albeit the "MONGO_URI" and "DATABASE_*" properties. The "MONGO_URI" and "DATABASE_*" properties are mutually exclusive and should be treated as so, you must pick eith to use the "MONGO_URI" property or the set of "DATABASE_*" properties.
  - While located at the root of the project in a terminal, run the `npm install` command
  - You should be good to go! Run the "npm run start" command in a termainal from the root of the project and the bot will start up.
