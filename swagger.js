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
        "name": "Driver App --> Auth"
      },
      {
        "name": "Driver App --> Home"
      },
      {
        "name": "Driver App --> Delivery Side"
      },
      {
        "name": "Driver App --> Profile"
      },
      {
        "name": "Admin"
      },
      {
        "name": "Admin --> Auth"
      },
      {
        "name": "Admin --> Customer"
      },
      {
        "name": "Admin --> Warehouse Management"
      },
      {
        "name": "Admin --> Booking Management"
      },
      {
        "name": "Admin --> Unit Management"
      },
      {
        "name": "Admin --> FAQ's"
      },
      {
        "name": "Admin --> Web Policy"
      },
      {
        "name": "Admin --> Restricted Items"
      },
      {
        "name": "Admin --> Dashboard"
      },
      {
        "name": "Admin --> Logistic Companies"
      },
      {
        "name": "Admin --> Categories"
      },
      {
        "name": "Admin --> Drivers"
      },
      {
        "name": "Admin --> Vehicle Types"
      },
      {
        "name": "Admin --> Charges Management"
      },
      {
        "name": "Admin --> Employees"
      },
      {
        "name": "Admin --> Roles & Permissions"
      },
      {
        "name": "Warehouse"
      },
      {
        "name": "Warehouse --> Auth"
      },
      {
        "name": "Warehouse --> Booking Management"
      },
      {
        "name": "Warehouse --> Booking Management --> Direct Delivery"
      },
      {
        "name": "Warehouse --> Booking Management --> Never Received"
      },
      {
        "name": "Warehouse --> Address Management"
      },
      {
        "name": "Warehouse --> Profile Management"
      },
      {
        "name": "Warehouse --> Tracking"
      },
      {
        "name": "Warehouse --> Employee"
      },
      {
        "name": "Warehouse --> Roles and Permissions"
      },
      {
        "name": "Warehouse --> Dashboard"
      },
      {
        "name": "Warehouse --> Driver"
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
