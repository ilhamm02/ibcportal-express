const Axios = require('axios')
const {getTxList} = require('../helper/transactionDetail');

module.exports = {
  channel: async(req, res) => {
    if(req.query.rpc){
      var getDetail;
      try{
        getDetail = await Axios.get(`http://${req.query.rpc}/ibc/core/channel/v1beta1/channels?pagination.limit=5000`)
      }catch(e) {
        getDetail = await Axios.get(`http://${req.query.rpc}/ibc/core/channel/v1/channels?pagination.limit=5000`)
      }
      const channels = (getDetail.data.channels).map(ch => {
        return{
          status: ch.state,
          from: ch.channel_id,
          to: ch.counterparty.channel_id
        }
      })
      return res.send({
        result: true,
        data: channels
      })
    }else{
      return res.status(400).send({
        result: false,
        data:{
          errMsg: "query required"
        }
      })
    }
  },
  tokenList: async(req, res) => {
    if(req.query.rpc){
      var getDetail;
      try{
        getDetail = await Axios.get(`http://${req.query.rpc}/ibc/applications/transfer/v1beta1/denom_traces`)
      }catch(e) {
        getDetail = await Axios.get(`http://${req.query.rpc}/ibc/apps/transfer/v1/denom_traces`)
      }
      const tokens = (getDetail.data.denom_traces).map(token => {
        var denom = token.base_denom;
        if(denom.length > 5 && denom.includes("base")){
          denom = denom.split("base")[1].toUpperCase();
        }else if(denom[0] === "u" || denom[0] === "a" || denom[0] === "t"){
          denom = denom.substring(1);
        }
        return{
          denom,
          udenom : token.base_denom,
          channel: (token.path).split("/")[1],
        }
      })
      return res.send({
        result: true,
        data: tokens
      })
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