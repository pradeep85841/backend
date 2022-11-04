

import pool from '../psqlDbOperations/psqlDBConnect.mjs';

export default function signUp(req,res){
    const {name, email, phone, password} = req.body
    console.log(name)
    console.log(email)
    console.log(phone)
    console.log(password)

    pool.query(`select name from users where lower(email_id) = lower('${email}')`,(err,result)=>{
        if (err) console.error(err);
        if (result.rows.length !== 0){
            res.status(422).json({error:"email exists"})
        }
    })

    if(name === null || email === null || phone === null || password === null){
        res.status(422).json({error:"wrong credentials"})
    }else{ 

    try{
        const userSignUp = (`INSERT INTO users("name", "email_id","phone_no" , "password") 
        VALUES($1, $2, $3, $4)`)
    
       var values = [name, email, phone, password];
    
       pool.query(userSignUp, values)
    
       res.status(200).json({message:"success"})
    }
    catch{
      res.status(400)
    }
}
}