
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


const options = {
    definition:{
        openapi: "3.0.0",
        info:{
            title: "Messaging App API",
            version: "1.0.0",
            description: "API documentation for Messaging App project"
        },
        servers:[
            {
                url: process.env.SWAGGER_SERVER_URL || "http://localhost:5000/api/v1",
            }
        ]
    },
    apis:["./routes/*.js"]
}


const swaggerSpec = swaggerJsDoc(options);

function setupSwagger(app){
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

module.exports = setupSwagger;