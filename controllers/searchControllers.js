const Axios = require('axios')
const { defaultPrefix, command, restEndpoint, lcdEndpoint, localEndpoint, apiEndpoint, directory, firstBlock } = require("./apiEndpoint")
const consPrefix = `${defaultPrefix}valcons`

module.exports = {
  detail: async(req, res) => {
    if(req.query.hash){
      console.log(`SEARCH ${req.query.hash}{new Date()}`)
      let checkBlock;
      let checkTransaction;
      try{
        checkBlock = await Axios.get(`${restEndpoint}/block_by_hash?hash=0x${req.query.hash}`);
      }catch(e){}
      try{
        checkTransaction = await Axios.get(`${lcdEndpoint}/cosmos/tx/v1beta1/txs/${req.query.hash}`);
      }catch(e){}
      let checkIBC = await Axios.get(`${lcdEndpoint}/cosmos/tx/v1beta1/txs?events=denomination_trace.trace_hash=%27${req.query.hash}%27&order_by=ORDER_BY_DESC&pagination.limit=20&pagination.offset=1`);
      if(checkBlock.data.result.block !== null){
        return res.send({
          result: true,
          data: parseInt(checkBlock.data.result.block.header.height)
        });
      }else if(checkTransaction){
        return res.send({
          result: true,
          data: "transaction"
        });
      }else if((checkIBC.data.tx_responses).length > 0){
        return res.send({
          result: true,
          data: "ibc"
        });
      }else{
        return res.status(400).send({
          result: false,
          data:{
            errMsg: "query required"
          }
        })
      }
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