function BtsubscriptionCreateMail(data) {
  let subscription = `<div style="width: 80%; margin: 0 auto; padding: 0 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table class="center" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0"
            width="100%">
            <tr align="center">
                <td style="text-align: center" >
                    <div style="margin: 50px 0;"><img style="width: 200px;"
                        src="cid:tsh_shipLogo"
                        alt="Brand Logo"></div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 35px; color: black; margin: 0;font-weight: 600;">Your Subscription To The Shipping Hack Is
                        Confirmed!</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <span style="font-size: 25px;font-weight: 500;">Hi ${data.userName}: </span><span style="font-size: 25px; color: gray; margin: 0;">Thank you for subscribing to
                        the shipping hack!We are thrilled to have you on board.</span>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <div style="margin: 0 auto;text-align: left; width: 350px;">
                        <p style="font-size: 22px;font-weight: 500;">Your Subscription Details: </p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription plan: <span style="color: gray;font-size:21px">${data.PlanName}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription ID: <span style="color: gray;font-size:21px">${data.subscriptionId}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Start Date: <span style="color: gray;font-size:21px">${data.StartDate}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Billing Cycle: <span style="color: gray;font-size:21px">${data.BillingCycle}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Expiry Date: <span style="color: gray;font-size:21px">${data.ExpiryDate}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Amount: <span style="color: gray;font-size:21px">${data.Amount}</span></p>
                    </div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 25px; color: gray; margin: 0;">If you have received this message by mistake,
                        ignore this email. if you think someone else is using your account without your consent, please
                        <span style="color: blue;">contact us</span></p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: left; vertical-align: middle; padding: 20px;" colspan="2">
                    <div style="text-align: center;">
                        <a href=""><img style="width: 50px; object-fit: cover;"
                                src="cid:linkedin"
                                alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;"
                                src="cid:facebook"
                                alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;"
                                src="cid:twitter" alt=""></a>
                        <a href=""><img style="width: 50px;object-fit: cover;"
                                src="cid:instagram"
                                alt=""></a>
                    </div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 25px; color: black; margin: 0;font-weight: 500;">
                        Follow Us</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 25px; color: black; margin: 0;font-weight:400;">
                        Edit.Gate center, San Francisco, Cl,67 Panama</p>
                        <span style="font-size: 20px; color: black; margin: 0;">
                            Copywrite &copy; 2023 PPS Logistics</span> <span style="color: blue;">Unsubscribe</span>
                </td>
            </tr>
        </table>
    </div>`;

  return subscription;
}

function BtsubscriptionCancelMail(data) {
  let subscription = `<div
        style="width: 80%; margin: 0 auto; padding: 0 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table class="center" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0"
            width="100%">
            <tr>
                <td>
                    <div style="margin: 50px 0;"><img style="width: 200px;" src="cid:tsh_shipLogo" alt=""></div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 35px; color: black; margin: 0;font-weight: 600;">Your Subscription To The
                        Shipping Hack Is
                        Cancelled!</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <span style="font-size: 25px;font-weight: 500;">Hi ${data.userName}: </span><span
                        style="font-size: 25px; color: gray; margin: 0;">We're sorry to see you go! Your subscription to
                        The Shipping Hack has been cancelled as per your request.</span>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <span
                        style="font-size: 23px; color: gray; margin: 0;">If you have any feedback or if there’s anything
                        we can do to improve, please let us know.</span>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                  <span
                        style="font-size: 23px; color: gray; margin: 0;">You can always reactivate your subscription at
                        any time by visiting our website</span>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 23px; color: gray; margin: 0;">If you have received this message by mistake,
                        ignore this email. if you think someone else is using your account without your consent, please
                        <span style="color: blue;">contact us</span>
                    </p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: left; vertical-align: middle; padding: 20px;" colspan="2">
                    <div style="text-align: center;">
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:linkedin" alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:facebook" alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:twitter" alt=""></a>
                        <a href=""><img style="width: 50px;object-fit: cover;" src="cid:instagram" alt=""></a>
                    </div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 23px; color: black; margin: 0;font-weight: 500;">
                        Follow Us</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 23px; color: black; margin: 0;font-weight:400;">
                        Edit.Gate center, San Francisco, Cl,67 Panama</p>
                    <span style="font-size: 20px; color: black; margin: 0;">
                        Copywrite &copy; 2023 PPS Logistics</span> <span style="color: blue;">Unsubscribe</span>
                </td>
            </tr>
        </table>
    </div>`;

  return subscription;
}

function subscriptionExpireFun(data){

    let subscriptionExpire=`<div
        style="width: 100%; margin: 0 auto; padding: 0 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table class="center" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0"
            width="100%">
            <tr>
                <td>
                    <div style="margin: 50px 0;"><img style="width: 200px;" src="cid:tsh_shipLogo" alt="Brand Logo"></div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 30px; color: black; margin: 0;font-weight: 600;">Your Shipping Hack Subscription is About to Expire:Take Action to Avoid Disruption !</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px 100px;" colspan="2">
                    <span style="font-size: 25px;font-weight: 500;">Hi ${data.userName} </span><span
                        style="font-size: 25px; color: gray; margin: 0;">Your Subscription is going to be Expired in few days</span>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <div style="margin: 0 auto;text-align: left; width: 350px;">
                        <p style="font-size: 22px;font-weight: 500;">Your Subscription Details: </p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription plan: <span
                                style="color: gray;font-size:21px">${data.PlanName}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription ID: <span
                                style="color: gray;font-size:21px">${data.subscriptionId}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Start Date: <span
                                style="color: gray;font-size:21px">${data.StartDate}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Billing Cycle: <span
                                style="color: gray;font-size:21px">${data.BillingCycle}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Expiry Date: <span
                                style="color: gray;font-size:21px">${data.ExpiryDate}</span></p>
                        <p style="font-size: 22px; color: black; margin: 10px 0;">Amount: <span
                                style="color: gray;font-size:21px">${data.Amount}</span></p>
                    </div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 20px; color: gray; margin: 0;">If you have received this message by mistake,
                        ignore this email. if you think someone else is using your account without your consent, please
                        <span style="color: blue;">contact us</span>
                    </p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: left; vertical-align: middle; padding: 20px;" colspan="2">
                    <div style="text-align: center;">
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:linkedin" alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:facebook" alt=""></a>
                        <a href=""><img style="width: 50px; object-fit: cover;" src="cid:twitter" alt=""></a>
                        <a href=""><img style="width: 50px;object-fit: cover;" src="cid:instagram" alt=""></a>
                    </div>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 20px; color: black; margin: 0;font-weight: 500;">
                        Follow Us</p>
                </td>
            </tr>
            <tr align="center">
                <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                    <p style="font-size: 25px; color: black; margin: 0;font-weight:400;">
                        Edit.Gate center, San Francisco, Cl,67 Panama</p>
                    <span style="font-size: 20px; color: black; margin: 0;">
                        Copywrite &copy; 2023 PPS Logistics</span> <span style="color: blue;">Unsubscribe</span>
                </td>
            </tr>
        </table>
    </div>`

    return subscriptionExpire

}

function subscriptionExpired(data){
    let subscriptionExpired=`<div
    style="width: 100%; margin: 0 auto; padding: 0 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table class="center" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0"
        width="100%">
        <tr>
            <td>
                <div style="margin: 50px 0;"><img style="width: 200px;" src="cid:tsh_shipLogo" alt="Brand Logo"></div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 30px; color: black; margin: 0;font-weight: 600;">Your Shipping Hack Subscription is Expired!</p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px 100px;" colspan="2">
                <span style="font-size: 25px;font-weight: 500;">Hi ${data.userName} </span><span
                    style="font-size: 25px; color: gray; margin: 0;">Your Subscription is going to be Expired</span>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <div style="margin: 0 auto;text-align: left; width: 350px;">
                    <p style="font-size: 22px;font-weight: 500;">Your Subscription Details: </p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription plan: <span
                            style="color: gray;font-size:21px">${data.PlanName}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription ID: <span
                            style="color: gray;font-size:21px">${data.subscriptionId}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Start Date: <span
                            style="color: gray;font-size:21px">${data.StartDate}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Billing Cycle: <span
                            style="color: gray;font-size:21px">${data.BillingCycle}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Expiry Date: <span
                            style="color: gray;font-size:21px">${data.ExpiryDate}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Amount: <span
                            style="color: gray;font-size:21px">${data.Amount}</span></p>
                </div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 20px; color: gray; margin: 0;">If you have received this message by mistake,
                    ignore this email. if you think someone else is using your account without your consent, please
                    <span style="color: blue;">contact us</span>
                </p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: left; vertical-align: middle; padding: 20px;" colspan="2">
                <div style="text-align: center;">
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:linkedin" alt=""></a>
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:facebook" alt=""></a>
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:twitter" alt=""></a>
                    <a href=""><img style="width: 50px;object-fit: cover;" src="cid:instagram" alt=""></a>
                </div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 20px; color: black; margin: 0;font-weight: 500;">
                    Follow Us</p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 25px; color: black; margin: 0;font-weight:400;">
                    Edit.Gate center, San Francisco, Cl,67 Panama</p>
                <span style="font-size: 20px; color: black; margin: 0;">
                    Copywrite &copy; 2023 PPS Logistics</span> <span style="color: blue;">Unsubscribe</span>
            </td>
        </tr>
    </table>
</div>`

return subscriptionExpired

}

function subscriptionPaymentfails(data){
    let subscriptionPaymentfail=`<div
    style="width: 100%; margin: 0 auto; padding: 0 50px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table class="center" border="0" style="border-collapse: collapse;" cellspacing="0" cellpadding="0"
        width="100%">
        <tr>
            <td>
                <div style="margin: 50px 0;"><img style="width: 200px;" src="cid:tsh_shipLogo" alt="Brand Logo"></div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 30px; color: black; margin: 0;font-weight: 600;">Your Subscription Payment for the Shipping Hack is 
                Failed!</p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px 100px;" colspan="2">
                <span style="font-size: 25px;font-weight: 500;">Hi ${data.userName} </span><span
                    style="font-size: 25px; color: gray; margin: 0;">Your Subscription payment is failed due to some reasons</span>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <div style="margin: 0 auto;text-align: left; width: 350px;">
                    <p style="font-size: 22px;font-weight: 500;">Your Subscription Details: </p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription plan: <span
                            style="color: gray;font-size:21px">${data.PlanName}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Subscription ID: <span
                            style="color: gray;font-size:21px">${data.subscriptionId}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Start Date: <span
                            style="color: gray;font-size:21px">${data.StartDate}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Billing Cycle: <span
                            style="color: gray;font-size:21px">${data.BillingCycle}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Expiry Date: <span
                            style="color: gray;font-size:21px">${data.ExpiryDate}</span></p>
                    <p style="font-size: 22px; color: black; margin: 10px 0;">Amount: <span
                            style="color: gray;font-size:21px">${data.Amount}</span></p>
                </div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 20px; color: gray; margin: 0;">If you have received this message by mistake,
                    ignore this email. if you think someone else is using your account without your consent, please
                    <span style="color: blue;">contact us</span>
                </p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: left; vertical-align: middle; padding: 20px;" colspan="2">
                <div style="text-align: center;">
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:linkedin" alt=""></a>
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:facebook" alt=""></a>
                    <a href=""><img style="width: 50px; object-fit: cover;" src="cid:twitter" alt=""></a>
                    <a href=""><img style="width: 50px;object-fit: cover;" src="cid:instagram" alt=""></a>
                </div>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 20px; color: black; margin: 0;font-weight: 500;">
                    Follow Us</p>
            </td>
        </tr>
        <tr align="center">
            <td style="text-align: center; vertical-align: middle; padding: 20px;" colspan="2">
                <p style="font-size: 25px; color: black; margin: 0;font-weight:400;">
                    Edit.Gate center, San Francisco, Cl,67 Panama</p>
                <span style="font-size: 20px; color: black; margin: 0;">
                    Copywrite &copy; 2023 PPS Logistics</span> <span style="color: blue;">Unsubscribe</span>
            </td>
        </tr>
    </table>
</div>`


return subscriptionPaymentfail

}


module.exports = {
  BtsubscriptionCreateMail,
  BtsubscriptionCancelMail,
  subscriptionExpireFun,
  subscriptionPaymentfails,
  subscriptionExpired
};
