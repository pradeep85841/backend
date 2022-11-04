import pool from '../psqlDbOperations/psqlDBConnect.mjs';
import * as stockData from '../stockData/getStockData.js';

export const getcagr = async(stock)=>{

    const stockDetails = await stockData.stockDetails(stock)

    var year = stockDetails.metadata.listingDate
    var startYear = parseInt(year.slice(-4));

    var currentYear =  new Date().getFullYear();
    var startPeriod = (currentYear-3);

    if (startYear >= startPeriod){
        startYear = (startYear+1);  
    }else{
        startYear = startPeriod;
    }

    const numYears = (currentYear-startYear);

    var currentprice = await stockData.currentPrice(stock);
    
    var startDate = `${startYear}-12-06`;
    const pastData = await stockData.pastData(stock, startDate)
    var jsonData = JSON.parse(pastData)
    var startprice = JSON.stringify(jsonData.Close)
    startprice = parseFloat(startprice.slice(5,12))

    var CAGR = (((currentprice/startprice)**(1/numYears))-1)*100;
    CAGR = Number(CAGR).toFixed(2)
    return Math.abs(CAGR);
  }

export const getUserEstimation = async(stock, date)=>{

    const pastData = await stockData.pastData(stock, date)
    var jsonData = JSON.parse(pastData)

    const stockDetails = await stockData.stockDetails(stock)
    let high = JSON.stringify(jsonData.High).slice(5,9);
    let low =  JSON.stringify(jsonData.Low).slice(5,9);

    const response = { "DayHigh":high, 
                      "DayLow":low, 
                      "mHigh": stockDetails.priceInfo.weekHighLow.max,
                      "mlow": stockDetails.priceInfo.weekHighLow.min} 
    return response;

}

export const getFutureEstimation = async(stock, quantity)=>{

    var cagr = await getcagr(stock);
    var currentprice = await stockData.currentPrice(stock);   
    cagr = (cagr/100);
    
     var annualRate = ((cagr+1)*currentprice);
     var totalprice = (annualRate*quantity);

    // var estimation = {"AnnualGrowth":Number(annualRate).toFixed(2)}
     return Number(annualRate).toFixed(2);
    
}

export const getVolatality = async(stock)=>{

    const year = new Date().getFullYear();
    var month =  new Date().getMonth();
    month -= 1;
    var date = 1;

var count = 0;
var total = 0;
var mean = 0;
var closingPriceSet=[];
var deviationSet;
var variance = 0;

    while(date <31){

            const pastData = await stockData.pastData(stock, `${year}-0${month}-${date}`)

                if(pastData === null){
                    date ++;
                }else{
                   var jsonData = JSON.parse(pastData)
                    var closePrice = JSON.stringify(jsonData.Close)
        
                    closePrice = parseFloat(closePrice.slice(5,12))
                    closingPriceSet[count] = closePrice;

                    total +=  closePrice;
                    date ++;
                    count ++;
                }


    }
mean = Number(total).toFixed(1);
mean = Number(mean/(count+1)).toFixed(1);
console.log(mean);

for(var i in closingPriceSet){
    
    deviationSet = (closingPriceSet[i]-mean);
    deviationSet = deviationSet*2;
    variance += deviationSet;

}
variance = (Number(variance/(count+1)).toFixed(1));
return Number(Math.sqrt(variance).toFixed(1));

}


function itblockCalculation(){
pool.query(`SELECT SUM("closing_bal") FROM "itcatalogue"`,(err, result)=>{
    const blockPrice = JSON.parse((JSON.stringify(result.rows[0].sum)));
    console.log("IT Block price: "+blockPrice);

})

pool.query(`SELECT "cagr" FROM itcatalogue`,(err, result)=>{
    pool.query(`SELECT "closing_bal" FROM itcatalogue`,(err, price)=>{
    const cagrset = [];
    const priceset = [];
    try{
        for(let i =0; i<10; i++){
           var objstring = JSON.stringify(result.rows[i].cagr);
           var pricestring = JSON.stringify(price.rows[i].closing_bal);
           cagrset[i] = JSON.parse(objstring);
           priceset[i] = JSON.parse(pricestring);
            
          }
    }
    catch{
      console.error(err)
    }
   console.log("annual growth percentage: "+cagrset);
   console.log("current stock prices: "+priceset);
   const estimationSet = [];
   let finalEstimation;
   const years = 3;
   let j =0;
   
while(j<= (priceset.length-1)){

    var annualRate = ((cagrset[j]/100)*priceset[j]);
    estimationSet[j] = Number((priceset[j]+(3*annualRate))).toFixed(2);
    finalEstimation += estimationSet[j];

    j++;
}

console.log("estimated stock prices after 3years: "+estimationSet);
console.log("Estimated IT Block returns after 3years: ");

});
});
}

function dividentblockCalculation(){
    pool.query(`SELECT SUM("closing_bal") FROM "dividentcatalogue"`,(err, result)=>{
        const blockPrice = JSON.parse((JSON.stringify(result.rows[0].sum)));
        console.log("Divident Block price: "+blockPrice);
    
    })
    
    pool.query(`SELECT "cagr" FROM "dividentcatalogue"`,(err, result)=>{
        pool.query(`SELECT "closing_bal" FROM "itcatalogue"`,(err, price)=>{
        const cagrset = [];
        const priceset = [];
        try{
            for(let i =0; i<10; i++){
               var objstring = JSON.stringify(result.rows[i].cagr);
               var pricestring = JSON.stringify(price.rows[i].closing_bal);
               cagrset[i] = JSON.parse(objstring);
               priceset[i] = JSON.parse(pricestring);
                
              }
        }
        catch{
          console.error(err)
        }
       console.log("annual growth percentage: "+cagrset);
       console.log("current stock prices: "+priceset);
       const estimationSet = [];
       let finalEstimation;
       const years = 3;
       let j =0;
       
    while(j<= (priceset.length-1)){
    
        var annualRate = ((cagrset[j]/100)*priceset[j]);
        estimationSet[j] = Number((priceset[j]+(3*annualRate))).toFixed(2);
        finalEstimation += estimationSet[j];
    
        j++;
    }
    
    console.log("estimated stock prices after 3years: "+estimationSet);
    console.log("Estimated divident Block returns after 3years: ");
    
    });
    });
    }