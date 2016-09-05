var bitcore = require('bitcore-lib');

const NETWORK = bitcore.Networks.livenet
//const NETWORK = bitcore.Networks.testnet

const INSIGHT_SERVER = "insight.bitpay.com"


function dismissDisclaimer(){
    if(!sessionStorage.getItem("disclaimer_dismissed")){       
        $("#siteDisclaimer").show()
    }
}


function initWallet() {
    
    dismissDisclaimer()
    
    $("nav").show()
    
    if(!localStorage.getItem("address_total")){       
        localStorage.setItem("address_total", 5)      
    }
    
//    if(!localStorage.getItem("tooltips")){
//        localStorage.setItem("tooltips", true) 
//        $('[data-toggle="tooltip"]').tooltip()
//        $("#toggleHelpBubbles").html("Turn Off Help Bubbles")
//    } else {
//        if(localStorage.getItem("tooltips") == true){
//            $('[data-toggle="tooltip"]').tooltip()
//            $("#toggleHelpBubbles").html("Turn Off Help Bubbles")
//        } else {
//            $('[data-toggle="tooltip"]').tooltip('hide')
//            $("#toggleHelpBubbles").html("Turn On Help Bubbles")
//        }
//    }
    
//    if(!localStorage.getItem("refresh_frequency")){     
//        localStorage.setItem("refresh_frequency", 600000)//set default 10 min refresh rate    
//    }
    
    var address_total = localStorage.getItem("address_total")   
    var passphrase = sessionStorage.getItem("passphrase")
    
    passphrase_string = passphrase.replace(/\s{2,}/g, ' ')
    var passphrase_array = passphrase_string.split(" ")
    m = new Mnemonic(passphrase_array)
    
    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m.toHex(), NETWORK)
    
    for (var i = 1; i <= address_total; i++) {
                            
        var derived = HDPrivateKey.derive("m/0'/0/" + (i-1))
        var address = new bitcore.Address(derived.publicKey, NETWORK)

        var pubkey = address.toString()
        var addressClass = ".address-"+i
        
        $(addressClass).html(pubkey)
        //$(addressClass).addClass("address-option")
        
        //var label = "Address "+i
        var label = '<i class="fa fa-folder" aria-hidden="true"></i>'
        $(addressClass+"-label").html(label)
        
        if(i == 1){
            if(!localStorage.getItem("last_address")){       
                localStorage.setItem("last_address", pubkey)      
            }
            var last_address = localStorage.getItem("last_address")
        }
        
        if(pubkey == last_address){
            $("#addressCurrentLabel").html(label)
            $("#addressCurrent").html(pubkey.substr(0,6)+"...")
            $("#addressCurrent").data("address", pubkey)
            
            getBalances(pubkey)
            
            getUnconfirmed(address, function(txs){
                $("#initLoading").hide()
                createTableUnconfirmed(txs)
            })
            
            getOrdersMatches(function(matches){
                
//                var currentblock = sessionStorage.getItem("last_block")
//                
//                if(currentblock.length > 0){
//                    createTableMatches(matches, currentblock)
//                    getBtcOrders(currentblock, function(orders){
//                        createTableOrders(orders, currentblock)
//                    }) 
//                } else {
                    getCurrentBlock(function(block){
                        $("#initLoading").hide()
                        
                        createTableMatches(matches, block)
                        getBtcOrders(block, function(orders){
                            sessionStorage.setItem("orders", JSON.stringify(orders)) 
                            createTableOrders(orders, block)
                            $("#content-footer").show()
                        }) 
                    })
//                }
                         
            })
        }
    
    }
    
}

function refreshTables(address){
    
    var urlParamsExist = checkForUrlParams()
    
    if(urlParamsExist){
        
        window.location.replace(location.pathname)
        
    } else {
    
        console.log("refresh")

        BootstrapDialog.closeAll()

        getBalances(address)

        getUnconfirmed(address, function(txs){
            createTableUnconfirmed(txs)
            getOrdersMatches(function(matches){
                getCurrentBlock(function(block){
                    createTableMatches(matches, block)
                    getBtcOrders(block, function(orders){
                        createTableOrders(orders, block)
                    }) 
                })
            })
        })

    }
    
}

function resetWallet(){
    localStorage.clear()
    sessionStorage.clear() 
    location.reload()
}

function getBalances(address){
    
    $("#btcBalance").html("...")
    
    getBtcBalance(address, function(btc){
        
        $("#btcBalance").html(btc)
        
        getAssets(address)
        
    })
    
}

function getBtcBalance(address, callback){
    
    if(address.substr(0,1) == "m"){      
        var source_html = "https://tbtc.blockr.io/api/v1/address/info/"+address
    } else {
        var source_html = "https://btc.blockr.io/api/v1/address/info/"+address 
    }
    
    $.getJSON( source_html, function( apidata ) {  
          
        var balance = parseFloat(apidata.data.balance); //blockr
             
        callback(balance)
        
    })
    
}

function getUnconfirmed(address, callback){
    
     var source_html = "https://api.blockcypher.com/v1/btc/main/addrs/"+address
        
        $.getJSON( source_html, function( data ) { 
      
            var txs = new Array()
            
            if(data.unconfirmed_n_tx > 0){
                for(var i=0; i < data.unconfirmed_txrefs.length; i++)  {
                    txs.push(data.unconfirmed_txrefs[i]["tx_hash"])
                }

                txs = txs.filter(function(item, pos, self) {
                    return self.indexOf(item) == pos;
                })
            }
            
            getUnconfirmedCP(txs, function(txs_parsed){
                callback(txs_parsed)
            })
            
        })

//https://api.blockcypher.com/v1/btc/main/addrs/18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa
//    {
//    "address": "18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa",
//    "total_received": 2000000,
//    "total_sent": 991500,
//    "balance": 1008500,
//    "unconfirmed_balance": -20000,
//    "final_balance": 988500,
//    "n_tx": 19,
//    "unconfirmed_n_tx": 2,
//    "final_n_tx": 21,
//    "txrefs": [],
//    "unconfirmed_txrefs": [
//        {
//        "address": "18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa",
//        "tx_hash": "5add1926f2b0923a663f3a7e4e93ff60d022f040676810c2fe85788ed7116b43",
//        "tx_input_n": -1,
//        "tx_output_n": 1,
//        "value": 990000,
//        "spent": true,
//        "spent_by": "ed3cf6e1307c2703848581144edf99dfc1cbd4c6f1fb7a3fa2263216168af44e",
//        "received": "2016-07-30T15:54:00.6Z",
//        "confirmations": 0,
//        "double_spend": false,
//        "receive_count": 791,
//        "confidence": 0.7684198493116864,
//        "preference": "medium"

}

function getUnconfirmedCP(txs, callback){
    
    var source_html = window.location.pathname+"php/btcGetUnconfirmed.php";
    
    $.getJSON( source_html, function( data ) { 
        
//        "category": "orders",
//        "bindings": "{\"expiration\": 20, \"expire_index\": 10000019, \"fee_provided\": 10000, \"fee_provided_remaining\": 10000, \"fee_required\": 0, \"fee_required_remaining\": 0, \"get_asset\": \"ROOTCOIN\", \"get_quantity\": 1660000000, \"get_remaining\": 1660000000, \"give_asset\": \"BTC\", \"give_quantity\": 111000, \"give_remaining\": 111000, \"source\": \"18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa\", \"tx_hash\": \"9455e092875b876381d2b39c6062670bfb55733fdc59f8adfc1722ca21f5fde3\"}",
//        "timestamp": 1469921035,
//        "command": "insert",
//        "tx_hash": "9455e092875b876381d2b39c6062670bfb55733fdc59f8adfc1722ca21f5fde3"

//"category": "btcpays",
//"bindings": "{\"btc_amount\": 111000, \"destination\": \"1GcFhAQGFZVDAr4jiR2tKwisHcgNUjhGNC\", \"order_match_id\": \"0105b5f4247d6bf205acb581322848f39ca340f72b8afb0ca1aca7f80b46c897_9455e092875b876381d2b39c6062670bfb55733fdc59f8adfc1722ca21f5fde3\", \"source\": \"18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa\", \"tx_hash\": \"3f929872ce8e536b4af1f1e7ad3063587219d8025376fb38f09c16a7891e9f49\"}",
//"timestamp": 1469921332,
//"command": "insert",
//"tx_hash": "3f929872ce8e536b4af1f1e7ad3063587219d8025376fb38f09c16a7891e9f49"
        
//{
//"category": "sends",
//"bindings": "{\"asset\": \"CNPCOIN\", \"destination\": \"1C4D9HWMUEasczDGh7VkPAxptpseNMpsp8\", \"quantity\": 30000000000, \"source\": \"1ABG119jVm2jRw6sz4ewurc5jFRJkwu6aj\", \"tx_hash\": \"5a5b83faf7eadb7755a404c236e8d04181f2edda28d7141edd404610b728df5b\"}",
//"timestamp": 1469894326,
//"command": "insert",
//"tx_hash": "5a5b83faf7eadb7755a404c236e8d04181f2edda28d7141edd404610b728df5b"
//},
        var txs_parsed = new Array()
        
        for(var i=0; i < txs.length; i++){
            
            var init = txs_parsed.length
            
            for(var j=0; j < data.length; j++){

                if(txs[i] == data[j].tx_hash) {
                    
                    var bindings = JSON.parse(data[j].bindings)
                    
                    //console.log(bindings)
                    
                    if(data[j].category == "orders" && data[j].command != "update"){
                        var txtype = "Buy Order"
                        var asset = bindings["get_asset"]
                        var amount = bindings["get_quantity"]   
                        if(asset == "BTC"){
                            var txtype = "Sell Order"
                            asset = bindings["give_asset"]
                            amount = bindings["give_quantity"]
                        }
                        txs_parsed.push({asset: asset, amount: amount, txid: txs[i], txtype: txtype})
                    } 
                    
                    if(data[j].category == "cancels"){
                        
                        var orders = $.parseJSON(sessionStorage.getItem("orders"))
                        
//                        console.log(bindings.offer_hash)
//                        console.log(orders)
                        
                        for(var k=0; k < orders.length; k++){
                            if(orders[k].tx_hash == bindings.offer_hash){
                                var thisorder = orders[k]
                            }
                        }
                        
                        console.log(thisorder)
                        
                        var txtype = "Cancel Order"
                        var asset = thisorder.asset
                        
                        txs_parsed.push({asset: asset, amount: thisorder.give_asset, txid: txs[i], txtype: txtype, order_tx: bindings.offer_hash})
                    } 
                    
                    if(data[j].category == "btcpays"){
                        var txtype = "Order Match"
                        var asset = "BTC"
                        var amount = (bindings["btc_amount"]/100000000)*(-1)
                        txs_parsed.push({asset: asset, amount: amount, txid: txs[i], txtype: txtype, match_id: bindings["order_match_id"]})
                    } 
                    
                    if(data[j].category == "sends"){
                        var txtype = "Send/Receive"
                        var asset = bindings["asset"]
                        var amount = bindings["quantity"]
                        txs_parsed.push({asset: asset, amount: amount, txid: txs[i], txtype: txtype})
                    }
                    
                    
                    
                }
            
            }
            
            if(txs_parsed.length == init) {
                txs_parsed.push({asset: "BTC", amount: "", txid: txs[i], txtype: "Send/Receive"})
            }
            
            
            
        }
        
        var assets = new Array()
        
        for(var k=0; k < txs_parsed.length; k++){   
            if(txs_parsed[k]["asset"] != "BTC"){
                assets.push(txs_parsed[k]["asset"])
            }     
        }
        
        if(assets.length > 0){   
            var divisible_html = window.location.pathname+"php/btcGetDivisible.php"
            var assets_str = assets.join(',')
            $.post(divisible_html, {assets: assets_str}, function(results){
                //console.log(results)
                for(var k=0; k < txs_parsed.length; k++){
                    if(txs_parsed[k]["asset"] != "BTC"){
                        var thisasset = txs_parsed[k]["asset"]
                        if(results[thisasset] == 1){
                            txs_parsed[k]["amount"] = txs_parsed[k]["amount"] / 100000000
                        }
                    }
                }
                callback(txs_parsed)
            })
        } else {
            callback(txs_parsed)
        }
        
    })
}

function assetIcon(asset){
    
    return "<img src='https://counterpartychain.io/content/images/icons/"+asset.toLowerCase()+".png'>"
    
}

function getAssets(address){
    
//    if(address.substr(0,1) != "m"){
        
        //var source_html = "https://counterpartychain.io/api/balances/"+address+"?description=1";
        var source_html = window.location.pathname+"php/btcGetBalances.php?address="+address
        
        $.getJSON( source_html, function( data ) { 
            if (data.success !== 0 && data.total > 0) {
                
                $("#assetDropdown").html("")
                
                $.each(data.data, function(i, item) {
                    
                    
                    var assetname = data.data[i].asset
                    var assetbalance = data.data[i].amount
                    
                    if(assetbalance > 0){
                    //var assetdescription = data.data[i].description
                        if (data.data[i].amount.indexOf(".")==-1) {var divisible = "no"} else {var divisible = "yes"}

                        if(assetname.substr(0,1) != "A") {
                            $("#assetDropdown").append("<div style='width: 320px; padding: 5px;'><div class='row assetDropdownItem'><div class='col-xs-2'><div class='assetDropdownItem-icon'>"+assetIcon(assetname)+"</div></div><div class='col-xs-10'><div class='assetDropdownItem-name' data-divisible='"+divisible+"'>"+assetname+"</div><div class='assetDropdownItem-balance'>"+assetbalance+"</div></div></div></div>")
                        }
                        
                    }
                    
                })
            } else {
                $("#assetDropdown").html("<li class='disabled'><a href='#'>No Assets at this Address</a></li>")
            }
        })
        
//    }
    
}

function getprivkey(inputaddr, inputpassphrase){

    var array = inputpassphrase.split(" ");

    m2 = new Mnemonic(array);

    var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m2.toHex(), NETWORK)

            //only 50 child keys deep
            for (var i = 0; i < 50; i++) {

                var derived = HDPrivateKey.derive("m/0'/0/" + i)
                var address1 = new bitcore.Address(derived.publicKey, NETWORK)

                var pubkey = address1.toString()

                if (inputaddr == pubkey) {
                var privkey = derived.privateKey.toWIF()
                break;

                }
            }

    return privkey
    
}

function getutxos(add_from, mnemonic, amountremaining, callback){

    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://"+INSIGHT_SERVER+"/api/addr/"+add_from+"/utxo";     
    
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        console.log(amountremaining);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460          
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
        
        callback(total_utxo, satoshi_change);
        
    })
    
}

//unconfirmed txs
//https://api.blockcypher.com/v1/btc/main/addrs/18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa



function sendBTC(add_from, add_to, sendtotal, transfee, mnemonic, callback) {
    
//    if(add_from.substr(0,1) == "m"){
//        source_html = "http://tbtc.blockr.io/api/v1/address/unspent/"+add_from;
//    }

    var amountremaining = parseFloat(sendtotal) + parseFloat(transfee)
        
    getutxos(add_from, mnemonic, amountremaining, function(total_utxo, satoshi_change){ 
    
        var sendtotal_satoshis = parseFloat(sendtotal).toFixed(8) * 100000000  
        sendtotal_satoshis = Math.round(sendtotal_satoshis)
        
        var transaction = new bitcore.Transaction()
            
        for (i = 0; i < total_utxo.length; i++) {
            transaction.from(total_utxo[i])
        }
        
        transaction.to(add_to, sendtotal_satoshis)
            
        if (satoshi_change > 5459) {
            transaction.to(add_from, satoshi_change)
        }
        
        var privkey = getprivkey(add_from, mnemonic) 
        transaction.sign(privkey)

        var final_trans = transaction.serialize()
        
        callback(final_trans)
        
    });
       
}



function sendRawSignedTx(rawtx, callback) {
//    url = 'http://blockchain.info/pushtx';
//    postdata = 'tx=' + hextx;
    
    url = 'https://chain.so/api/v2/send_tx/BTC';
    data = 'tx_hex=' + rawtx;
    
    if (url != null && url != "")
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                
                if(xhr.status === 200){  //check if "OK" (200)
                    //success
                    console.log(xhr.responseText)
                    var checksuccess = jQuery.parseJSON(xhr.responseText)
                    callback(checksuccess.status, checksuccess.data.txid)
                } else {
                    callback("error", "") //otherwise, some other code was returned
                }
            }
        }
        xhr.open(data ? "POST" : "GET", url, true);
        if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send(data);
    }
}


function createTableUnconfirmed(txs){
    
    $('#content-unconfirmed-menubar-container').show()
    
    $('#content-unconfirmed').html("<i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
//    $("#content-unconfirmed").show()
//    $("#content-unconfirmed-header").show()
    
    if(txs.length > 0){
        
        //sessionStorage.setItem("unconfirmed", JSON.stringify(txs))
       
    
        $('#content-unconfirmed').load('html/table-unconfirmed.html', function() {

            var tabledata = new Array()
            
            for(var i=0; i < txs.length; i++){
                
                var asset = txs[i].asset
                var amount = txs[i].amount
                                         
                var matchdata = $("#matches-"+txs[i].match_id).data()
                if(matchdata) {
                    asset = matchdata.asset
                    amount = matchdata.buy_qty  
                    $("#matchTxStatus-"+txs[i].match_id).html("Waiting for confirmation")
                    $("#matches-"+txs[i].match_id).data("status", "waiting")
                    
                    var txid = txs[i].match_id
                    tabledata[txid] = {txid: txs[i].txid, txtype: "Order Match", asset: asset, amount: amount}
                }
                
                var orderdata
                
                if(txs[i].match_id){
                    $("#unconfirmedTable tbody").append("<tr class='unconfirmedTx' id='unconfirmed-"+txs[i].txid+"' data-txid='"+txs[i].txid+"'><td id='unconfirmedTxStatus-"+txs[i].match_id+"' class='unconfirmedTable hideSmall'>"+txs[i].txid+"</td><td>"+txs[i].txtype+"</td><td id='unconfirmedTxAsset-"+txs[i].match_id+"'>"+asset+"</td><td id='unconfirmedTxAmount-"+txs[i].match_id+"' class='unconfirmedTable hideVerySmall'>"+amount+"</td></tr>")
                } else {  
                    $("#unconfirmedTable tbody").append("<tr class='unconfirmedTx' id='unconfirmed-"+txs[i].txid+"' data-txid='"+txs[i].txid+"'><td id='unconfirmedTxStatus-"+txs[i].txid+"' class='unconfirmedTable hideSmall'>"+txs[i].txid+"</td><td>"+txs[i].txtype+"</td><td>"+asset+"</td><td class='unconfirmedTable hideVerySmall'>"+amount+"</td></tr>")
                }
                
                //        <th class='unconfirmedTable hideSmall'>Tx ID</th>
                //        <th class='unconfirmedTable'>Type</th>
                //        <th class='unconfirmedTable'>Asset</th> 
                //        <th class='unconfirmedTable hideVerySmall'>Amount</th>
                
                
                
            }
            
//            if(tabledata){
//                sessionStorage.setItem("unconfirmed", JSON.stringify(tabledata))
//            }
            
        })

    } else {
//        $("#content-unconfirmed").hide()
//        $("#content-unconfirmed-header").hide()
        
        
        $("#content-unconfirmed-menubar-container").hide()
        
        $("#content-unconfirmed").html("<div style='padding: 10px 0 20px 0;'>No Unconfirmed Transactions</div>")
    }
}

function resetWalletModal(){   
    
    var passphrase = sessionStorage.getItem("passphrase")
    
    BootstrapDialog.confirm({
        title: "Warning!",
        type: "type-danger",
        message: '<div>Write down your current passphrase before you reset!  It is not recoverable!</div><div style="padding: 10px 0 10px 0; font-weight: bold">'+passphrase+'</div>', 
        callback: function(result){
            if(result) {
                resetWallet()
            }
        } 
    })
}


function balanceClickModal(){
            
    var currentaddr = $("#addressCurrent").data("address")

    var depositBtcDialog = new BootstrapDialog({
        title: 'Deposit BTC and Counterparty Assets',
        message: function(dialog){
                var $message = $('<div align="center"></div>')
                $message.qrcode({text: currentaddr})
                $message.append('<div align="center" style="padding-top: 20px;font-weight:bold;">'+currentaddr+'</div>')
                return $message
            },
        buttons: [
            {
                label: 'Send BTC',
                cssClass: 'btn-success',
                action: function(dialogItself) {
                    var asset = "BTC"
                    var divisible = "yes"
                    var balance = $("#btcBalance").html()

                    sendAssetModal(asset, divisible, balance)
                    dialogItself.close()
                } 
            }
        ]
    });

    depositBtcDialog.open()    

}

function assetMenuModal(asset, divisible, balance){
    var currentaddr = $("#addressCurrent").data("address")

    var assetMenuDialog = new BootstrapDialog({
        title: asset,
        message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-asset-menu.html', function(){
                    $(this).find("#dialogAssetMenu-balance").html(balance)
                    $(this).find(".dialogAssetMenu-asset").html(asset)
                    $(this).find("#dialogAssetMenu-icon-lg").html(assetIcon(asset))
                })
                
                return $message
            },
        buttons: [
            {
                label: 'Send '+asset,
                cssClass: 'btn-success',
                action: function(dialogItself) {
                    sendAssetModal(asset, divisible, balance)
                    dialogItself.close()
                } 
            },
            {
                label: 'Sell '+asset,
                cssClass: 'btn-warning',
                action: function(dialogItself) {
                    
                    var btcbalance = $("#btcBalance").html()
                    
                    if(btcbalance >= 0.0001){

                        sellAssetModal(asset, divisible, balance)
                        dialogItself.close()

                    } else {

                        dialogItself.getModalBody().find('#dialogAssetMenu-header').html("Insufficient BTC")

                    }       
                } 
            }
        ]
    });

    assetMenuDialog.open()    
}

function sendAssetModal(asset, divisible, balance){
    
    var btcbalance = $("#btcBalance").html()
    
    var sendAssetDialog = new BootstrapDialog({
    title: "Send " + asset,
    //message: $('<div></div>').load('html/dialog-send-asset.html'),
    message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-send-asset.html', function(){
                    $(this).find("#dialogSendAsset-balance").html(balance)
                    $(this).find(".dialogSendAsset-asset").html(asset)
                    $(this).find("#dialogSendAsset-icon-lg").html(assetIcon(asset))
                })
                
                return $message
            },
    buttons: [
    {
        id: 'send-btn',
        label: 'Send',
        cssClass: 'btn-success',
        action: function(dialogItself) {
            
                var passphrase = sessionStorage.getItem("passphrase")

                var sendtoamount = dialogItself.getModalBody().find('#dialogSendAsset-amount').val()
                var add_to = dialogItself.getModalBody().find('#dialogSendAsset-address').val()
                var add_from = $("#addressCurrent").data("address")    

                var dust = 0.00005471
                var transfee = 0.0001
                var btc_total = dust + transfee

                if(divisible == "no"){
                    sendtoamount = Math.floor(sendtoamount) / 100000000
                } 
                console.log(sendtoamount)

                if (asset == "BTC") {
                    var totalsend = sendtoamount + transfee
                    balance = parseFloat(btcbalance)
                } else {
                    var totalsend = parseFloat(sendtoamount)
                }

                console.log(add_from)

                if (bitcore.Address.isValid(add_to)){
                    if (isNaN(sendtoamount) == true || sendtoamount <= 0 || $.isNumeric( sendtoamount ) == false) {
                        //Invalid Amount
                        dialogItself.getModalBody().find('#dialogSendAsset-header').html("Invalid amount.")
                    } else {
                        if (totalsend > balance) {
                            //Insufficient Funds
                            dialogItself.getModalBody().find('#dialogSendAsset-header').html("Insufficient funds.")
                        } else {               
                            if (asset == "BTC") {
                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                                sendBTC(add_from, add_to, sendtoamount, transfee, passphrase, function(signedtx){
                                    //push tx to network
                                    if(signedtx != "error") {
                                        sendRawSignedTx(signedtx, function(status, txid){
                                            if (status == "success") {
                                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                            } else {
                                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                            }   
                                        })                               
                                    } else {
                                        dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                    }
                                })
                            } else if (btc_total < btcbalance) { //check if enough btc balance for dust & tx fee
                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                                sendXCP_opreturn(add_from, add_to, asset, sendtoamount, dust, transfee, passphrase, function(signedtx){
                                    //push tx to network
                                    if(signedtx != "error") {
                                        sendRawSignedTx(signedtx, function(status, txid){
                                            if (status == "success") {
                                                dialogItself.getModalBody().find('#dialogSendAsset-container').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                                dialogItself.setClosable(false)
                                                $("body").data("sendTx", true)
                                            } else {
                                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                            }   
                                        })                               
                                    } else {
                                        dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                                    }
                                }) 
                            }
                        }

                    }
                } else {
                    //Invalid Address
                    dialogItself.getModalBody().find('#dialogSendAsset-header').html("Not a valid address.")
                }

                dialogItself.getModalBody().find('#dialogSendAsset-amount').prop('disabled', true)
                dialogItself.getModalBody().find('#dialogSendAsset-address').prop('disabled', true)
                dialogItself.getButton('send-btn').toggleEnable(false) 


            

        }
    },
    {
        label: 'Close',
        cssClass: 'btn-default',
        action: function(dialogItself) {
            
            if($("body").data("sendTx") == true){
                var address = $("#addressCurrent").data("address")
                
                $('#content-unconfirmed').html("<i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                $("#content-unconfirmed").show()
                $("#content-unconfirmed-header").show()
                
                getUnconfirmed(address, function(txs){
                    createTableUnconfirmed(txs)
                })
                $("body").data("sendTx", false)
                $('body').animate({
                            scrollTop: $('#container').offset().top
                        }, 500);
            }
            dialogItself.close()
            
        }
    }]
    })
    
//    sendAssetDialog.realize()   
//    sendAssetDialog.enableButtons(false)	
    
    sendAssetDialog.open() 
     
}

function aboutModal(status) {

    var aboutDialog = new BootstrapDialog({
    title: 'About',
    message: function(dialog){             
            var $message = $('<div></div>').load('html/dialog-About.html', function(){})          
            return $message
        },
    buttons: [
        {
            id: "btn-closeOrderInfo",
            label: 'Close',
            cssClass: 'btn-primary',
            action: function(dialogItself) {

                dialogItself.close()

            }
        }
    ]
    })

    aboutDialog.open()  
}

function pendingAlertModal() {

    var pendingAlertDialog = new BootstrapDialog({
    title: 'Action Required',
    message: function(dialog){             
            var $message = $('<div></div>').load('html/dialog-PendingAlert.html', function(){})          
            return $message
        },
    buttons: [
        {
            label: 'Close',
            cssClass: 'btn-primary',
            action: function(dialogItself) {

                dialogItself.close()

            }
        }
    ]
    })

    pendingAlertDialog.open()  
}


//function checkLoading(callback){
//    
//
//    
//}


//

function getTotalBalance(passphrases){
    //https://blockchain.info/q/addressbalance/1AtcSh7uxenQ6AR5xqr6agAegWRUF5N4uh%7C147cUCdYBpvPLVnpvSNGz14Ue2USzi1FsQ
    
    var allAddresses = ""
    
    for (var h = 0; h < passphrases.length; h++) {
    
        var array = passphrases[h].split(" ");

        m2 = new Mnemonic(array);

        var HDPrivateKey = bitcore.HDPrivateKey.fromSeed(m2.toHex(), NETWORK)

        for (var i = 0; i < 10; i++) {

            var derived = HDPrivateKey.derive("m/0'/0/" + i)
            var address1 = new bitcore.Address(derived.publicKey, NETWORK)

            var pubkey = address1.toString()
        
            if(i > 0){
                allAddresses += "|"
            }

            allAddresses += pubkey
        }
        
        if(h < (passphrases.length - 1)){
            allAddresses += "|"
        }
        
    }
    
    console.log(allAddresses)

    var source_html = "https://blockchain.info/q/addressbalance/"+allAddresses 
      
    $.getJSON( source_html, function( balance ) {  
          
        console.log(balance)
        
    })

}



