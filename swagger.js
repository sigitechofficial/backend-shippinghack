const swaggerJSDoc = require('swagger-jsdoc');


let swaggerUrl;

if(process.env.NODE_ENV === 'development'){
   swaggerUrl=process.env.BASE_URL
}
else if(process.env.NODE_ENV === 'test'){
  swaggerUrl=process.env.Test_URL
}else{
  swaggerUrl=process.env.Prod_Url
}

console.log("🚀 ~ swaggerUrl:", swaggerUrl)

const options = {
  definition: {
    openapi: '3.0.0', // Specify OpenAPI version
    info: {
      title: 'The Shipping Hack',
      version: '1.0.0',
      description: 'API Documentation',
    },
    servers: [
      {
        url: swaggerUrl, // Replace with your server URL
        description: 'Running  Server',
      },
    ],
    "tags": [
      {
        "name": "Customer App",
      },
      {
        name: "Customer --> Auth"
      },
      {
        name: "Customer --> Home and Order"
      },
      {
        name: "Customer --> Drawer"
      },
      {
        name: "Customer --> Rating"
      },
      {
        name: "Customer --> Payment"
      },
      {
        name: "Customer --> Shopify"
      },
      {
        name: "Customer --> Reasons"
      },
      {
        "name": "Driver App"
      },
      {
        "name": "Admin"
      },
      {
        "name": "Warehouse"
      },
      {
        "name": "Business"
      },
      {
        "name": "Merchant Panel"
      },
    ],
  },
  apis: ['./routes/admin.js',
     './routes/business.js',
    './routes/customer.js',
  './routes/driver.js',
'./routes/merchant.js',
'./routes/warehouse.js',
'./routes/webhooks.js'], // Path to route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
