###Activating REST/Socket API services

By default, no API services will be loaded. Set `LoadServices` to true in your local config.json file to enable them.

Example:
```json
// config.json
"services" : {
   "LoadServices": true
 }
```

Run `lsc start services` in the root of the package directory. The API routes of the package should now be available for use 
(e.g. `http://localhost:8000/<ServicePath>/<Package-Name>/<Api-Route>`).

 