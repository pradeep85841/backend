
import pool from '../psqlDbOperations/psqlDBConnect.mjs';

let date_ob = new Date();

let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();

export default function investedUsers(req,res){

    const {name, email, phone, investment} = req.body

    var time = (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

    const investedUsers = (`INSERT INTO investedusers("name", "email_id","phone_no" , "investment", "timestamp") 
    VALUES($1, $2, $3, $4, $5)`)

   var values = [name, email, phone, investment, time];

   pool.query(investedUsers, values)

   res.status(200).send("user investment added");
}