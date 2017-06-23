## Environment Variables

LabShare Services can use the following environment variables:

| Name | Type | Description |
| ---- | ---- | ----------- |
| BUILD_VERSION | String | Can be used to display a build or deployment version when accessing the `/versions` API route. Optional. |
| PORT | Number | The port used to run the server. It overrides the `config.json` value set for `services.listen.port`. Optional. |

### Defining environment variables using a .env file

LabShare Services will attempt to read a '.env' file in the current directory on initialization and assign the values to `process.env`.
See [dotenv](https://www.npmjs.com/package/dotenv) for more information.

