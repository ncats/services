'use strict';

const _ = require('lodash'),
    prettySwag = require('pretty-swag'),
    swaggerJSDoc = require('swagger-jsdoc');

/* Pretty-swag configuration */
let prettySwagConfig = {};
prettySwagConfig.format = "lite";  
prettySwagConfig.markdown = true;
prettySwagConfig.fixedNav = true;
prettySwagConfig.noRequest = false;
prettySwagConfig.autoTags = true;
prettySwagConfig.collapse = {};
prettySwagConfig.collapse.tool = false;
prettySwagConfig.collapse.method = false;
prettySwagConfig.collapse.path = true;
prettySwagConfig.theme = {
    "default": "blue",
    "GET": "blue",
    "POST": "indigo",
    "DELETE": "red",
    "PUT": "amber"
};


let endpointDoc = "api-doc.html";

exports.config = function (data) {
    const {apiLoader} = data;
    console.log(apiLoader.options);

    var swaggerConfig = {
    swaggerDefinition: {
        info: {
        title: Object.keys(apiLoader.services)[0], 
        version: '1.0.0',
        // ToDO: Add logic to add base path & host for live API Testing
        },
    },
    apis: [ apiLoader.options.main + '/api/*.js', apiLoader.options.main + '/api/*.yml'],
    };

    // TODO: Find a cleaner solution
    if(apiLoader.options.Listen){
        swaggerConfig.swaggerDefinition.host = apiLoader.options.Listen.Url.replace("http://","");
        swaggerConfig.swaggerDefinition.host = swaggerConfig.swaggerDefinition.host.replace("https://","");
        if(apiLoader.options.Listen.Port) {
            swaggerConfig.swaggerDefinition.host += ":" + apiLoader.options.Listen.Port.toString();
        }
        
        if(apiLoader.options.ServicePath){
        swaggerConfig.swaggerDefinition.basePath = apiLoader.options.ServicePath + "/" + Object.keys(apiLoader.services)[0];
        }
        else {
            swaggerConfig.swaggerDefinition.basePath = "/" + Object.keys(apiLoader.services)[0];
        }
    }



    function createDocumentation (req, res){
        prettySwag.run(swaggerJSDoc(swaggerConfig),endpointDoc,prettySwagConfig,function(err){
            if(err){
                res.send(err);
            }
            else{
                res.sendfile(endpointDoc); 

            }
    });

    }

        // If swagger js-doc is enabled expose html generation before exposing versions // TODO: Add another flag to check if get /swagger exists            
        apiLoader.services[Object.keys(apiLoader.services)[0]].push({
            path: `/${Object.keys(apiLoader.services)[0]}/documentation`,
            httpMethod: 'GET',
            middleware: [createDocumentation]
        });


};