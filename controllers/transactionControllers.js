const Axios = require('axios')
const { getTxList } = require("../helper/transactionDetail");

module.exports = {
  list: async(req, res) => {
    if(req.query.rpc){
      const nodeEndpoint = `http://${req.query.rpc}`; 
      var total = 0;
      if(req.query.fromChannel && req.query.toChannel && req.query.type && req.query.page){
        var txs = [];
        var hashList = [];
        var finalHash = [];
        var getTx;
        try{
          if(req.query.type === "out"){
            getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=send_packet.packet_src_channel=%27${req.query.fromChannel}%27&events=send_packet.packet_dst_channel=%27${req.query.toChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
            (getTx.data.tx_responses).forEach(hash => {
              hashList.push(hash.txhash)
            })
            total = getTx.data.pagination.total
          }else if(req.query.type === "in"){
            getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=recv_packet.packet_src_channel=%27${req.query.toChannel}%27&events=recv_packet.packet_dst_channel=%27${req.query.fromChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
            (getTx.data.tx_responses).forEach(hash => {
              hashList.push(hash.txhash)
            })
            total = getTx.data.pagination.total
          }
        }catch(e){
          console.log(e)
          return res.status(400).send({
            result: false,
            data:{
              errMsg: "query required"
            }
          })
        }
      }else if((req.query.receiver || req.query.sender) && req.query.page){
        var txs = [];
        var hashList = [];
        var finalHash = [];
        var getTx;
        try{
          if(req.query.receiver){
            if(req.query.fromChannel){
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=fungible_token_packet.receiver=%27${req.query.receiver}%27&events=send_packet.packet_src_channel=%27${req.query.fromChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }else if(req.query.toChannel){
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=fungible_token_packet.receiver=%27${req.query.receiver}%27&events=send_packet.packet_dst_channel=%27${req.query.toChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }else{
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=fungible_token_packet.receiver=%27${req.query.receiver}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }
          }else if(req.query.sender){
            if(req.query.fromChannel){
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=ibc_transfer.sender=%27${req.query.sender}%27&events=send_packet.packet_src_channel=%27${req.query.fromChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }else if(req.query.toChannel){
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=ibc_transfer.sender=%27${req.query.sender}%27&events=send_packet.packet_dst_channel=%27${req.query.toChannel}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }else{
              getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=ibc_transfer.sender=%27${req.query.sender}%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
              (getTx.data.tx_responses).forEach(hash => {
                hashList.push(hash.txhash)
              })
            }
          }
        }catch(e){
          console.log(e)
          return res.status(400).send({
            result: false,
            data:{
              errMsg: "query required"
            }
          })
        }
      }else if(req.query.page){
        var txs = [];
        var hashList = [];
        var finalHash = [];
        var getTx;
        getTx = await Axios.get(`${nodeEndpoint}/cosmos/tx/v1beta1/txs?events=message.module=%27ibc_channel%27&order_by=ORDER_BY_DESC&pagination.limit=5&pagination.offset=${(req.query.page-1)*5}`);
        (getTx.data.tx_responses).forEach(hash => {
          hashList.push(hash.txhash)
        })
      }else{
        return res.status(400).send({
          result: false,
          data:{
            errMsg: "query required"
          }
        })
      }
      if(hashList.length > 0) {
        finalHash = [...new Set(hashList)]
        if(getTx){
          for(let i = 0; i < finalHash.length; i++){
            txs.unshift(await getTxList(finalHash[i], nodeEndpoint))
          }
        }
        txs.reverse()
        return res.send({
          result: true,
          total,
          data:txs
        })
      }else{
        return res.status(400).send({
          result: false,
          data:txs
        })
      }
    }
  },
  detail: async(req, res) => {
    if(req.query.hash && (req.query.hash).length === 64 && Number.isInteger(req.query.hash) === false && req.query.rpc) {
      const nodeEndpoint = `http://${req.query.rpc}`;
      const details = await getTxList(req.query.hash, nodeEndpoint);
      return res.send({
        result: true,
        data:details
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