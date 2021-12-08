const Axios = require('axios')

module.exports = {
  balance: async(req, res) => {
    if(req.query.address && req.query.rpc){
      // try{
        var getToken = [];
        const getBalance = await Axios(`http://${req.query.rpc}/cosmos/bank/v1beta1/balances/${req.query.address}`)
        for(var i = 0; i < (getBalance.data.balances).length; i++) {
          var denom = getBalance.data.balances[i].denom;
          var denomHash = "";
          if(denom.includes("ibc/")){
            denomHash = denom.split("ibc/");
            denomHash = denomHash[1];
            denom = await Axios.get(`http://${req.query.rpc}/ibc/applications/transfer/v1beta1/denom_traces/${denomHash}`)
            denom = denom.data.denom_trace.base_denom;
          }
          if(denom.length > 5 && denom.includes("base")){
            denom = denom.split("base")[1].toUpperCase();
          }else if(denom[0] === "u" || denom[0] === "a" || denom[0] === "t"){
            denom = denom.substring(1);
          }
          getToken.push({
            denom,
            denomHash,
            amount: getBalance.data.balances[i].amount
          })
        }
        return res.send({
          result: true,
          data: getToken
        })
      // }catch(e) {
      //   return res.status(400).send({
      //     result: false,
      //     data:{
      //       errMsg: "query required"
      //     }
      //   })
      // }
    }else{
      return res.status(400).send({
        result: false,
        data:{
          errMsg: "query required"
        }
      })
    }
  }
}