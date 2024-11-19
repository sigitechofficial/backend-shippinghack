module.exports = function (err, req, res, next) {
    err = JSON.parse(JSON.stringify(err))
    console.log("Error------>",err)
    let message="Something went wrong";
    if(err.body){message=err.body}
    if(err.message)message=err.message
    if(err?.errors && err.errors.length>0 )message=err.errors[0].message
    res.json({
        'status': '0',
        'message': "",
        'data': {},
        'error':message
    });
}