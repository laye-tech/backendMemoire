var express = require('express');

var router = express.Router();
var { connection, db } = require('../database.js');
const axios = require("axios");
const { validate, linkSchema2 } = require('../validator/valid');

const accountSid = 'ACd0b284eebe7c1fbca383639a038dccab';
const authToken = 'a51cd04cfb7df02f23833159f765349e';
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//      from: '+18507573983',
//      to: '+221766475379'
//    })
//   .then(message => console.log(message.sid));



router.post('/my-ipn', async (req, res) => {
    let type_event = req.body.type_event;
    let custom_field = JSON.parse(req.body.custom_field);
    let ref_command = req.body.ref_command;
    let item_name = req.body.item_name;
    let item_price = req.body.item_price;
    let devise = req.body.devise;
    let command_name = req.body.command_name;
    let env = req.body.env;
    let token = req.body.token;
    let api_key_sha256 = req.body.api_key_sha256;
    let api_secret_sha256 = req.body.api_secret_sha256;

    let my_api_key = 'b56fd11ef177770ef8990618d717b39a8dff4fb69c1bf603542f302ad54f9aa7';
    let my_api_secret = "74ea593031d19f0f8231b99592de229aedf45ea7a6c85ef265c3289a269c55be";



    if (SHA256Encrypt(my_api_secret) === api_secret_sha256 && SHA256Encrypt(my_api_key) === api_key_sha256) {
console.log(command_name,item_price)
        // cas de succes on l'enregistre dans la base de donnee
        save = await db.payement(idReservation)

            .then((res) => {
                const email = req.session.name
                function sendEmail(email, command_name, item_price, devise) {
                    // var email = email;

                    var mail = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'servicetransport2222@gmail.com', // Your email id
                            pass: '766475379' // Your password
                        }
                    });
                    var mailOptions = {
                        from: 'servicetransport2222@gmail.com',  //tutsmake@gmail.com
                        to: email,
                        subject: 'Notification du payement effectue avec succes  ',
                        html: '<p> la commande passee est`${command_name}`,le prix est `${item_price}` payee en `${devise}` Merci de nous faire confiance Bon voyage </p>'
                    };
                    mail.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(1)
                        } else {
                            console.log(0)
                        }
                    });
                }
                sendEmail(email, command_name, item_price, devise)
            })
            .catch((err) => {
                return console.log(err)
            })

    }
    else {
        //not from PayTech
        console.log('impossible')
    }
});












async function verifySession(req, res, next) {

    const session = req.session.loggedin;


    if (session === undefined) {


        return res.json("veuilez bien vous connecter d'abord");
    } else {
        let user = req.session.name;
        userfound = await db.getUserByEmail(user)
            .then((result) => {
                client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+18507573983',
     to: '+221779396072'
   })
  .then(message => console.log(message.sid));
                next()
                return result

            }).catch((err) => {
                return err
            })




    }
}
let idReservation;

router.post('/reservation', verifySession, validate(linkSchema2), async (req, res1, next) => {
    // res.render('reservation.ejs')
    ref_reservation = (len, charSet) => {
        return new Promise((resolve, reject) => {
            charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var randomString = '';
            for (var i = 0; i < len; i++) {
                var randomPoz = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPoz, randomPoz + 1);
            }
            return resolve(randomString);
        });
    }


    let { telephone, nbre_de_place_reserve, ref_reservation1, idService } = req.body;

    let Name_Service, Description_Service, Prix_du_Service;

    servicedmd = await db.AllServiceWithid(idService)
        .then((result) => {
            Name_Service = result[0].Name_Service;
            Description_Service = result[0].Description_Service;
            Prix_du_Service = result[0].Prix_du_service
            return Name_Service, Description_Service, Prix_du_Service;
        })
        .catch((err) => {
            return res.sendStatus(400)
        })

    ref_reservation(12).then((result) => {
        ref_reservation1 = result;
        return ref_reservation1
    }).catch((err) => {
        return err
    });


    let user = req.session.name;
    userfound = await db.getUserByEmail(user)
        .then((result) => {
            //renvoie id du client
            idClient = result.id
            memo = db.reservation(idClient, telephone, ref_reservation1, nbre_de_place_reserve, idService)
                .then((result) => {
                    //result renvoi l'idReservation
                    idReservation = result
                    return idReservation

                })
                .then((res) => {


                    let url = "https://paytech.sn/api/payment/request-payment";

                    let data = {
                        item_name: Name_Service,
                        item_price: Prix_du_Service,
                        currency: "XOF",
                        ref_command: ref_reservation1,
                        command_name: Description_Service,
                        "env": "test",
                        ipn_url: "https://localhost:4000/reservation/my-ipn",
                        success_url: "https://localhost:4000/",
                        cancel_url: "https://localhost:4000/"

                    };

                    let headers = {
                        // Accept: "application/json",
                        "Content-Type": "application/json",
                        API_KEY: "b56fd11ef177770ef8990618d717b39a8dff4fb69c1bf603542f302ad54f9aa7",
                        API_SECRET: "74ea593031d19f0f8231b99592de229aedf45ea7a6c85ef265c3289a269c55be",
                    };

                    axios(url, {
                        method: 'Post',
                        data: JSON.stringify(data),
                        headers: headers
                    })
                        .then(function (response) {
                            return response.data.redirectUrl
                        })
                        .then(function (res) {
                            res.toString()
                            res1.redirect(res)

                        })
                        .catch((err) => {
                            return (err)
                        })
                    return true
                })



        }).catch((err) => {
            return err

        })









})



module.exports = router;