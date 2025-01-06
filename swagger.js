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
        "name": "Admin --> Tracking"
      },
      {
        "name": "Admin --> Push Notification"
      },
      {
        "name": "Admin --> Banners"
      },
      {
        "name": "Admin --> Support"
      },
      {
        "name": "Admin --> Merchant Dashboard"
      },
      {
        "name": "Admin --> Register Merchant"
      },
      {
        "name": "Admin --> Merchant INbound && Outbound Order"
      },
      {
        "name": "Admin --> Merchant --> Products && Categories"
      },
      {
        "name": "Admin --> Merchant --> Service"
      },
      {
        "name": "Admin --> Bussiness User's"
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
        "name": "Warehouse --> Warehouse Location and Merchant Order Management"
      },
      {
        "name": "Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Inventory"
      },
      {
        "name": "Warehouse --> Warehouse Location and Merchant Order Management --> Warehouse Associates"
      },
      {
        "name": "Business"
      },
      {
        "name": "Business --> Auth"
      },
      {
        "name": "Business --> Brain Tree Subscription"
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
