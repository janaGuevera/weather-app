const auth = (req, res, next) => {
    if(req.session.user){
        return next();
    }

    res.redirect("/");
}

module.exports = auth