import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cors = require('cors');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(cors({origin:'http://localhost:3000',
method:["GET","POST"]})
);

const port = 5000

import db from './mongoDbOperations/mongoConnect.js';
const client = db;

import {getITCatalogue, getDividentCatalogue} from './psqlDbOperations/psqlQueries.mjs';
import * as modules from './stockfolioMechanism/stockfolioModules.js';
import itBlockData from './chartData/ItchartData.js';
import dividentBlockData from './chartData/DividentchartData.js';
import signUp from './users/userSignUp.js';
import login from './users/userLogin.js';
import investedUsers from './users/userInvest.js';
import rebalanceResults from './agentOpertaions/getRebalanceResults.js'
import blockUpdation from './agentOpertaions/updateBlocks.js'
import middleware from './middleware.js';

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.get('/itcatalogue', getITCatalogue)
app.get('/dividentcatalogue', getDividentCatalogue)
app.get('/ItChartData', itBlockData)
app.get('/dividentChartData', dividentBlockData)

app.post('/userSignup',signUp)
app.post('/login',login)
app.post('/investNow',investedUsers)
app.post('/blockUpdate',blockUpdation)

app.get('/auth', middleware, (req,res)=>{
  res.send("Authentication success!");
})

app.post('/rebalanceResults',rebalanceResults)

app.post('/estimate',async (req, res)=>{
  const {stock, buyPrice, date, quantity} = req.body

  if(stock === null || buyPrice === null || date === null || quantity === null){
    res.status(422).json({error:"wrong credentials"})
}else{ 
  try{ 
    var cagr = await modules.getcagr(stock);
    var userData = await modules.getUserEstimation(stock, date);
    var futureEstimation = await modules.getFutureEstimation(stock, quantity);
    var volatality = await modules.getVolatality(stock);
  }
  catch(err){
    res.status(400).json({error:"something went wrong"})
  }


  var response = {"cagr":cagr,
                  "analysis":userData,
                  "volatality%":volatality,
                   "prediction":futureEstimation}

    res.status(200).send(response);
}
  });

  app.post('/blockEstimate',async (req, res)=>{

    const {blockName} = req.body

    var query = { blockName: `${blockName}` };

    client.collection("blockEstimations").find(query).toArray((err, result)=> {
     if (err) throw err;
     res.status(200).send({result});
   });
  });

  app.get("/posts", (request, response) => {
    console.log("In posts section calling mongd db")
    client.collection("posts").find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })






