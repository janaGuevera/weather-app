const {createTransport} = require("nodemailer");
const smtp_key = process.env.SMTP_KEY;

const sendEmail = (data) => {
    const transporter = createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth:{
            user: "fashionsjshop@gmail.com",
            pass: smtp_key
        }
    });

    const mailDetails = {
        from: "fashionsjshop@gmail.com",
        to: data.receiver,
        subject: data.subject,
        text: data.content
    }
    
    transporter.sendMail(mailDetails, function(error, result){
        if(error){
            console.log(error);
        }
    });
}

module.exports = sendEmail;
