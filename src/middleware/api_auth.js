const auth = (req, res, next) => {
    if(req.session.user){
        return next();
    }

    res.send({error: "You are not authirzed to access this data!"});
}

module.exports = auth