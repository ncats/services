#Managing LabShare Services

To manage LabShare services you can use [PM2](https://www.npmjs.com/package/pm2). Install it with `npm i -g pm2`.

##PM2 documentation shortcuts

###[Quick start](http://pm2.keymetrics.io/docs/usage/quick-start/#cheat-sheet)
###[Configuring PM2 applications](http://pm2.keymetrics.io/docs/usage/application-declaration/)

The [sample-services.json](../sample-services.json) file can be used as an example PM2 configuration file for LabShare services.
On Windows, change the `interpreter` value to `C:\Windows\System32\cmd.exe` or equivalent.