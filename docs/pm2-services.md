# Managing LabShare Services

[PM2](https://www.npmjs.com/package/pm2) is a great tool for mananging LabShare API services. Install it globally using `npm i -g pm2`.

## Using PM2 to auto-reload the services after source code changes in development

Run:
`echo -e '#!/bin/bash\nlsc services start' > devstart.sh && echo 'devstart.sh' >> .git/info/exclude`
`lsc services start`
 - Note: line #2 of devstart.sh could be replaced by any command that starts LabShare services via the terminal

The script can then be started via `pm2 start devstart.sh --watch && pm2 logs` and stopped with `pm2 delete devstart.sh`.

## PM2 documentation

### [Quick start](http://pm2.keymetrics.io/docs/usage/quick-start/#cheat-sheet)
### [Configuring PM2 applications](http://pm2.keymetrics.io/docs/usage/application-declaration/)
### [Running PM2 as a Windows service](nssm-services.md)

The [sample-services.json](../sample-services.json) file can be used as an example PM2 configuration file for LabShare services. Reference [PM2 as a Windows service](nssm-services.md) for a Windows-specific `services.json`.
