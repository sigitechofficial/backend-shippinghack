const braintree = require('braintree');
const { v4: uuidv4 } = require('uuid');
const { cards } = require('./stripe');
const gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox, // Change to Production for live
    merchantId: process.env.MERCHANT_ID,
    publicKey: process.env.Public_Key,
    privateKey: process.env.Private_Key
});

const CustomException = require("../middleware/errorObject");
const error = require('../middleware/error');

// Create Braintree Plan
async function createBraintreePlan(planData,billingFrequency,price) {
    const limit=planData.limit;
    const shipLimit=`Shipping Limit ${limit}`
    const planId=`${uuidv4()}_${billingFrequency}`;
    try {
        const result = await gateway.plan.create({
            id: planId,
            name: `${planData.title} (${billingFrequency})`,
            description: shipLimit,
            price:price,
            billingFrequency: billingFrequency === 'MONTHLY'?1:12,
            numberOfBillingCycles:billingFrequency === 'MONTHLY'?1:12,
            currencyIsoCode: 'USD',
        });

        if (result.success) {
            console.log('Plan created successfully:', result);
            return result.plan; 
        } else {
            console.error('Failed to create plan:', result.message);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error creating plan:', error);
        throw new CustomException(error.message);
    }
}

//-------------------Plan Update----------------------------//
async function btplanUpdate(planId,planUpdate){

    //console.log("PLAN UPDATE DATA --------------->",planUpdate);
    const limit=planUpdate.limit;
    const shipLimit=`Shipping Limit ${limit}`;
    try {
        const result=await gateway.plan.update(planId,{
            description: shipLimit,
            price:planUpdate.price,
        })
        if(result.success){

            console.log('Plan Update Sucessfull: ',result)

            return result.plan

        }
        else {
            console.error('Failed to update plan:', result.message);
            throw new Error(result.message);
        }
    } catch (error) {

        console.log('Erro in updating The Plan: ',error);
        throw new CustomException(error.message);
        
    }
}

//-------------------Get Plan By ID-------------------------//

async function planBYId(planId){

    try {
        const result=await gateway.plan.find(planId)

        if(result){
            //console.log("PLan Details: ",result);
            return result
    
        }else{
            console.error("Error in fetching the Plans: ",result.message)
    
            throw new Error(result.message);
        }
        
    } catch (error) {

        console.error("Error in fetching the Plan",error);
        throw new CustomException(error.message);
        
    }

   
}

//--------------Fetch ALL Brain Tree Plans------------------//
async function fetchallPlans(){

    try {

        const result=await gateway.plan.all();

        if(result.success){
            console.log("Brain Tree All Plans fetched:",result)

            return result.plans;
        }else{
            console.error("Brain Tree All Plans fetch failed:",result.message)
            throw new Error(result.message);
        }
        
    } catch (error) {
        console.error('Error fetching all plans:', error);
        throw new CustomException(error.message);
        
    }

}

// --------------Create Customer------------- //

async function createCustomer(customerId,customerDetails) {

    console.log("Customer ID: ",customerId);
    try {
        const result = await gateway.customer.create({
            id: customerId,
            firstName: customerDetails.firstName,
            lastName: customerDetails.lastName,
            email: customerDetails.email,
            phone:customerDetails.phoneNum
        });

        if (result.success) {
            console.log('Customer Added successfully:', result.customer.id);
            return result.customer; // Return the token of the stored card
        }
    } catch (error) {
        throw new CustomException(error.message)
    }
}

//-------------------Customer Payment Methods----------------------//

async function customerAllCard(customerId){

    console.log("User ID in function: ",customerId);

     customerId = customerId.toString();

    try {

        const customer= await gateway.customer.find(customerId.trim());
        console.log("Customer Data: ",customer);

        const paymentMethod=customer.paymentMethods[0]?.token;


        let output=customer.paymentMethods.map(cards =>({
            "customerId":cards?.customerId,
            "cardholderName":cards?.cardholderName,
            "cardToken":cards?.token,
            "cardNumber":cards?.cardNumber,
            "cardType":cards?.cardType,
            "cardExpMonth":cards?.expirationDate,
        }))

        return output;
        
    } catch (error) {
        console.error('Error fetching all payment methods:', error);
        throw new CustomException(error.message);
        
    }
}

//---------------------- Add card for existing Customer -----------//

async function addCard(customerId,cardDetails){

    console.log("Customer ID in function: ",customerId);

    console.log("Card Details in function:",cardDetails)

    try {
        const result=await gateway.creditCard.create({
            customerId: customerId,
            number: cardDetails.number,
            cardholderName:cardDetails.cardholderName,
            expirationDate: `${cardDetails.expire_month}/${cardDetails.expire_year}`,
            cvv: cardDetails.cvv2,
            options:{
                verifyCard:true,
            }
        })

        if(result.success){
            console.log('Card stored successfully:', result.creditCard);
            return result.creditCard; 
        }else{
            console.error('Failed to store card:', result.message);
            throw new CustomException(result.message);
        }
        
    } catch (error) {
        console.error('Error storing card:', error);
        throw new CustomException(error.message);
    }

}

//-------------------Update Credit Card--------------------------//

async function updateCard(customerId,cardToken,cardDetails){

    console.log("Card Token: ",cardToken);

    console.log("Card Details : ",cardDetails)

    const result=await gateway.creditCard.update(cardToken,{
        customerId: customerId,
        cardholderName:cardDetails.cardholderName,
        number: cardDetails.number,
        expirationDate: `${cardDetails.expire_month}/${cardDetails.expire_year}`,
        cvv: cardDetails.cvv2,

    })

    if(result.success){
        console.log('Card updated successfully:', result.creditCard);
        return result.creditCard
    }else{
        console.error('Failed to update card:', result.message);
        throw new CustomException(result.message);
    }
}

//--------------------Payment Method Revoked----------------//


async function PaymentMethodRevoked(cardToken){

    console.log("Payment Token :",cardToken);

    try {
        const result= await gateway.paymentMethod.delete(cardToken);

        console.log("Result --->",result);

        if(result.success){
            console.log('Payment method revoked successfully:', result.paymentMethodToken);
            return result.paymentMethod
        }else{
            console.error('Failed to revoke payment method:', result);
            throw new CustomException(result.message);
        }
        
    } catch (error) {
        console.error('Error revoking payment method:', error);
        throw new CustomException(error.message);
        
    }
}

// -----------------------Create Subscription--------------------//

async function createSubscription(planId,billingFrequency,paymentMethodToken) {
    try {
        const result = await gateway.subscription.create({
            paymentMethodToken: paymentMethodToken,
            planId: planId,
            numberOfBillingCycles:billingFrequency==="MONTHLY"?1:12,
            options:{
                startImmediately: true
            }
        });

        if (result.success) {
            console.log('Subscription created successfully:', result.subscription.id);
            return result.subscription;
        } else {
            console.error('Failed to create subscription:', result.message);
            throw new CustomException(result.message);
        }
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw new CustomException(error.message);
    }
}


//------------------Subscription Cancellations------------------//

async function cancelSubscription(subscriptionId) {

    try {
        const result = await gateway.subscription.cancel(subscriptionId);
        if(result.success){
            console.log('Subscription cancelled successfully:', result.subscription.id);
            return result.subscription;
        }else{
            console.error('Failed to cancel subscription:', result.message);
            throw new CustomException(result.message)
        }
        
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        throw new CustomException(error.message);
    }
}

//------------------Customer Subscription Expires--------------//
async function customerSubscriptionExpires(subscriptionId) {

    console.log("Subscription Id: ",subscriptionId);
    try {
        const result = await gateway.subscription.find(subscriptionId);

        console.log("Result: ",result);

        const subscriptionEndDate = result.billingPeriodEndDate;
        
        //console.log("Expiry Date of Subscription: ",subscriptionEndDate);

        return subscriptionEndDate;
    } catch (error) {
        console.error('Error finding subscription:', error);
        throw error
        
    }
}


//-------------Customer Retry Payment-----------------//
async function retryPayment(subscriptionId){
    try {

        const subscription=await gateway.subscription.find(subscriptionId);

        if(subscription.status==='Past Due'){
            const result = await gateway.subscription.retryCharge(subscriptionId);
           if(result.success){
            console.log("Payment Done Sucessfull",result.subscription);
            return result.subscription.status
            }else{

                const errorMessage=result.message.toLowerCase();
                if(errorMessage.includes('insufficient funds')){
                    console.error("Payment Failed: Insufficient Funds");
                    throw new CustomException("Insufficient funds available for the payment.");
                }
                else if(errorMessage.includes('expired card')){
                    console.error("Payment Failed: Expired Card");
                    throw new CustomException("Expired card");
                }
                else if(errorMessage.includes('declined')){
                    console.error("Payment Failed: Declined");
                    throw new CustomException("Payment declined");
                }else{
                    console.error("Payment Failed");
                    throw new CustomException("Payment failed");
                    
                }
            }

        }
        
    } catch (error) {
        console.error('Error retrying payment:', error);
        throw new CustomException(error.message);
        
    }
}

//------------------------Delete Customer-------------------------//

async function deleteCustomer(customerId) {

    console.log("User ID in function: ",customerId);

     customerId = customerId.toString();

    try {
        const result=await gateway.customer.delete(customerId.trim());
        console.log("Braintree Result:", JSON.stringify(result, null, 2));
        if (result.success) {
            console.log(`Customer with ID ${customerId} deleted successfully.`);
            return result
        } else {
            console.log(`Error deleting customer: ${result.message}`);
            //throw new CustomException(result.message);
            
        }

        
    } catch (error) {
        console.error('Error deleting customer:', error);
        //throw new CustomException(error.message);
        
    }
    
}




// --------------------get Subsccription detail------------------------//

async function getSubscriptionDetails(subscriptionId) {

    console.log("Subscription ID in Get Function",subscriptionId);

    try {
        const subscription = await gateway.subscription.find(subscriptionId);
        
        const transactions = subscription.transactions;
       

        if (transactions.length > 0) {
            transactions.forEach(transaction => {
                console.log(`Transaction ID: ${transaction.id}, Status: ${transaction.status}, Amount: ${transaction.amount}`);
            });
        } else {
            console.log('No transactions found for this subscription.');
        }

        return { subscription, transactions };
    } catch (error) {
        console.error('Error retrieving subscription details:', error);
        throw new CustomException(error.message);
    }
}

//=========================Customer FindFunction============================>
async function customerfind(customerId) {
    if(typeof customerId!='string'){
        customerId=String(customerId)
    }

    console.log("Customer ID in function 1----------------->",customerId)

    customerId = customerId.trim();

    console.log("Customer ID in function 2----------------->",customerId)

    try {
        
    const result=await gateway.customer.find(customerId);
    console.log("Result Object: ", JSON.stringify(result, null, 2));
    console.log("Result==============>",result)
    if(result){

        console.log("Customer Found============>",result)
        return result;

    }else{
        throw new CustomException("Customer Not found")
    }
        
    } catch (error) {
        console.error('Error retrieving details:', error);
        
    }

}





// Export controllers
module.exports = {
    createBraintreePlan,
    createCustomer,
    createSubscription,
    getSubscriptionDetails,
    fetchallPlans,
    addCard,
    cancelSubscription,
    retryPayment,
    customerSubscriptionExpires,
    updateCard,
    PaymentMethodRevoked,
    planBYId,
    customerAllCard,
    btplanUpdate,
    deleteCustomer,
    customerfind
    
};
