# Documentation Workflow with NPM, Grunt, and Assemble

## Setting up this repo (Current)

0. Requires Node (NPM) and grunt-cli
0. Clone from GitHub
0. Run npm i
0. Run grunt, which lists the available tasks.

## Setting up this repo (Goal)

0. Developer has their project checked out - RE, FE, etc.
0. Install Blackbaud.Documentation.StaticAssemble NuGet package.
0. npm i is automatically ran.
0. Grunt file includes default locations for documentation, but developer has opportunity to override these with config.
0. Active development, developer runs grunt serve.
0. Just building, developer runs grunt build.
0. Ready to publish, developer runs grunt publish which uses grunt-prompt to ask for pre-defined locations (internal, external, github, digital-ocean, etc).
0. Automation ready to publish, runs grunt autopublish which reads team's config file for location, etc.