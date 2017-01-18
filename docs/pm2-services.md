#Managing LabShare Services

[PM2](https://www.npmjs.com/package/pm2) is a great tool for mananging LabShare API services. Install it globally using `npm i -g pm2`.

## Using PM2 to watch the whole repo for dev environment
After installing pm2 globally following generic instructions can be followed to run any `lsc` command and have pm2 watch for the whole repository.

From the root of project repository run:
`echo -e '#!/bin/bash\nlsc services start' > devstart.sh && echo 'devstart.sh' >> .git/info/exclude`

Once the script file is succesfully created and aded to local gitignore, `lsc services start` - line #2 of devstart.sh could be replaced by any command that starts labshare services via bash.
The script can then be started by `pm2 start devstart.sh --watch && pm2 logs` and stopped with `pm2 delete devstart.sh` when desired.

## Configuring pm2 watchers on services.json


##PM2 documentation

###[Quick start](http://pm2.keymetrics.io/docs/usage/quick-start/#cheat-sheet)
###[Configuring PM2 applications](http://pm2.keymetrics.io/docs/usage/application-declaration/)
###[Running PM2 as a Windows service](nssm-services.md)

The [sample-services.json](../sample-services.json) file can be used as an example PM2 configuration file for LabShare services. Reference [PM2 as a Windows service](nssm-services.md) for a Windows-specific `services.json`.
