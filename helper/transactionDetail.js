const Axios = require("axios");
const { defaultPrefix, lcdEndpoint } = require("../controllers/apiEndpoint")

module.exports = {
  getTxList: async(hash, rpc) => {
    var result;
    try{
      result = await Axios.get(`${rpc}/cosmos/tx/v1beta1/txs/${hash}`);
    }catch(e){}
    if(result){
      result = result.data.tx_response
      var txHash = result.txhash;
      var txHeight = result.height;
      var getTime = await Axios.get(`${rpc}/blocks/${txHeight}`);
      var txTime = new Date(getTime.data.block.header.time);
      txTime = txTime.getTime();;
      var txType = [];
      var txSender;
      var txReceiver;
      var txAmount = 0;
      var txSuccess = true; 
      var txGasWanted = result.gas_wanted;
      var txGasUsed = result.gas_used;
      var txFee = 0;
      var txAdditional = [];
      var txMessage = []
      try{
        if((result.tx.value.fee.amount).length > 0){
          txFee = result.tx.value.fee.amount[0].amount;
        }else{
          txFee = 0;
        }
      }catch(e){}
      if((result.logs).length > 0){
        (result.logs).forEach(result => {
          (result.events).forEach(ress => {
            if(ress.type === "message"){
              (ress.attributes).forEach(resss => {
                if(resss.key === "action"){
                  txType = resss.value;
                  if(txType.indexOf(".") > 0){
                    txType = txType.split(".");
                    txType = txType[txType.length - 1];
                    txType = txType.split("Msg")[1];
                    txType = txType.replace(/([A-Z])/g, ' $1').trim();
                    txType = txType.toLowerCase();
                  }else if(txType.indexOf("_") > 0){
                    txTypeCheck = txType.split("_");
                    txType.push(txType.join(" "));
                  }
                }
              })
            }
            if(ress.type === "transfer"){
              (ress.attributes).forEach(resss => {
                if(resss.key === "amount"){
                  txAmount += parseFloat(resss.value);
                }
              })
            }
            if(ress.type === "delegate"){
              (ress.attributes).forEach(resss => {
                if(resss.key === "amount"){
                  txDelegate = resss.value;
                }
              })
            }
          })
        })
      }else{
        txSuccess = result.raw_log;
        txType = result.tx.body.messages[0];
        txType = txType['@type'];
        txType = txType.split(".");
        txType = txType[txType.length - 1];
      }
      (result.tx.body.messages).forEach(res => {
        if(res.from_address){
          txSender = res.from_address;
        }else if(res.delegator_address){
          txSender = res.delegator_address;
        }else if(res.signer){
          txSender = res.signer;
        }else if(res.address){
          txSender = res.address;
        }else if(res.sender){
          txSender = res.sender;
        }else if(res.withdraw_address){
          txSender = res.withdraw_address;
        }
        if(res.to_address){
          txReceiver = res.to_address;
        }else if(res.validator_address){
          txReceiver = res.validator_address;
        }else if(res.receiver){
          txReceiver = res.receiver;
        }else if(res.validator_addr){
          txReceiver = res.validator_addr;
        }
      })
      if(result.tx.auth_info.fee){
        (result.tx.auth_info.fee.amount).forEach(ress => {
          if(ress.amount) {
            txFee += parseInt(ress.amount);
          }
        })
      }
      if(Array.isArray(txType)) {
        txType = txType[0];
      }
      if(txType === "transfer" || txType === "MsgTransfer"){
        var from;
        var to;
        var fromChannel;
        var toChannel;
        var fromPort;
        var toPort;
        var connection;
        var amount = txAmount;
        var height;
        var denom;
        if(txType === "transfer"){
          (result.logs).forEach(result => {
            (result.events).forEach(ress => {
              if(ress.type === "send_packet"){
                (ress.attributes).forEach(resss => {
                  if(resss.key === "packet_src_channel"){
                    fromChannel = resss.value;
                  }
                  if(resss.key === "packet_dst_channel"){
                    toChannel = resss.value;
                  }
                  if(resss.key === "packet_src_port"){
                    fromPort = resss.value;
                  }
                  if(resss.key === "packet_dst_port"){
                    toPort = resss.value;
                  }
                  if(resss.key === "packet_connection"){
                    connection = resss.value;
                  }
                })
              }
              if(ress.type === "fungible_token_packet"){
                (ress.attributes).forEach(resss => {
                  if(resss.key === "denom"){
                    denom = resss.value;
                    denom = denom.split("/")
                    denom = denom[denom.length - 1];
                    denom = denom.split("u")
                    denom = denom[1]
                  }
                  if(resss.key === "amount"){
                    amount = resss.value;
                  }
                  if(resss.key === "receiver"){
                    to = resss.value;
                  }
                })
              }
              if(ress.type === "ibc_transfer"){
                (ress.attributes).forEach(resss => {
                  if(resss.key === "sender"){
                    from = resss.value;
                  }
                  if(resss.key === "receiver"){
                    to = resss.value;
                  }
                })
              }
            })
          })
        }
        (result.tx.body.messages).forEach(res => {
          fromChannel = res.source_channel
          fromPort = res.source_port
          amount = res.token.amount
          height = res.timeout_height.revision_height
          if(res.token && !denom){
            if(res.token.denom){
              denom = res.token.denom
              if(!denom.includes("ibc/")){
                denom = denom.split("/")
                denom = denom[denom.length - 1];
                if(denom[0] === "u"){
                  denom = (denom.substring(1)).toUpperCase()
                }else if(denom.substring(0,4) === "base"){
                  denom = (denom.substring(4)).toUpperCase()
                }
              }
            }
          }
        })
        if(denom.includes("ibc/")){
          var denomHash = denom.split("ibc/")[1]
          var getDenom = await Axios.get(`${rpc}/ibc/applications/transfer/v1beta1/denom_traces/${denomHash}`)
          if(getDenom.data){
            denom = getDenom.data.denom_trace.base_denom;
            denom = denom.split("/")
            denom = denom[denom.length - 1];
            denom = denom.split("u")
            if(denom[0] === "u"){
              denom = (denom.substring(1)).toUpperCase()
            }else if(denom.substring(0,4) === "base"){
              denom = (denom.substring(4)).toUpperCase()
            }
          }
        }
        txAdditional = {
          from: from ? from : txSender,
          to,
          denom,
          denomHash,
          fromChannel,
          toChannel,
          fromPort,
          toPort,
          amount,
          connection,
          height
        }
      }

      return {
        status: txSuccess,
        txTime,
        txHash,
        txHeight,
        txType,
        txSender: txSender,
        txReceiver,
        txAmount: txAmount,
        txGasWanted,
        txGasUsed,
        txFee,
        txMemo: result.tx.body.memo,
        txAdditional,
        txMessage
      }
    }
  }
}