const Axios = require('axios');

module.exports={
  status: async(req, res) => {
    if(req.query.rpc){
      var totalTx = await Axios.get(`http://${req.query.rpc}/cosmos/tx/v1beta1/txs?events=message.module=%27ibc_channel%27&pagination.limit=1&pagination.offset=0`);
      totalTx = parseInt(totalTx.data.pagination.total);
      var denom = await Axios.get(`http://${req.query.rpc}/cosmos/bank/v1beta1/supply`);
      denom = denom.data.supply[denom.data.supply.length - 1].denom;
      if(denom.length > 5 && denom.includes("base")){
        denom = denom.split("base")[1].toUpperCase();
      }else if(denom[0] === "u" || denom[0] === "a" || denom[0] === "t"){
        denom = denom.substring(1);
      }
      var block = await Axios.get(`http://${req.query.rpc}/cosmos/base/tendermint/v1beta1/blocks/latest`);
      const chainId = block.data.block.header.chain_id;
      block = block.data.block.header.height;
      var channel;
      try{
        channel = await Axios.get(`http://${req.query.rpc}/ibc/core/channel/v1beta1/channels`);
      }catch(e){
        channel = await Axios.get(`http://${req.query.rpc}/ibc/core/channel/v1/channels`);
      }
      channel = channel.data.pagination.total;
      var tokens;
      try{
        tokens = await Axios.get(`http://${req.query.rpc}/ibc/applications/transfer/v1beta1/denom_traces`)
      }catch(e) {
        tokens = await Axios.get(`http://${req.query.rpc}/ibc/apps/transfer/v1/denom_traces`)
      }
      tokens = tokens.data.pagination.total;
      return res.send({
        result: true,
        data: {
          height: block,
          txs: totalTx,
          channel,
          tokens,
          denom,
          chainId
        }
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