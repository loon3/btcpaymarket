function getBtcOrders(block, callback){
    
    var source_html = window.location.pathname+"php/btcGetOrders.php?currentblock="+block;
    
    $.getJSON( source_html, function( data ) { 
        
        //console.log(data)
        
        var orders = new Array()
        
        for(var i=0; i < data.orders.length; i++){
     
//            if(data.orders[i].get_remaining > 100000 || data.orders[i].get_remaining == 0) {
                orders.push({asset: data.orders[i].give_asset, divisible: data.divisibility[data.orders[i].give_asset], give_asset: data.orders[i].give_quantity, get_btc: data.orders[i].get_quantity, asset_remaining: data.orders[i].give_remaining, btc_remaining: data.orders[i].get_remaining, tx_index: data.orders[i].tx_index, tx_hash: data.orders[i].tx_hash, status: data.orders[i].status, expire_index: data.orders[i].expire_index, source: data.orders[i].source})
//            }
            
        }
        
        callback(orders)
        
    })
}

function getOrdersMatches(callback){
    
    var currentAddress = $("#addressCurrent").data("address")
    
    var source_html = window.location.pathname+"php/btcGetOrdersMatches.php?addr="+currentAddress
    
    $.getJSON( source_html, function( data ) { 
        
        //console.log(data)
        
        var matches = new Array()
        
        for(var i=0; i < data.matches.length; i++){
            matches.push({add_from: data.matches[i].tx1_address, add_to: data.matches[i].tx0_address, sell_qty: data.matches[i].backward_quantity, asset_qty: data.matches[i].forward_quantity, tx0_hash: data.matches[i].tx0_hash, tx1_hash: data.matches[i].tx1_hash, get_asset: data.matches[i].forward_asset, match_expire_index: data.matches[i].match_expire_index, order_id: data.matches[i].id, status: data.matches[i].status, asset_div: data.divisibility[data.matches[i].forward_asset], block_index: data.matches[i].block_index})
        }
        
        callback(matches)
        
    })
}


//[
//{
//"tx1_hash": "efb5168bd9c1193ba8f92776138043faf07677d8a497397d5e1155e6ea6a7bfb",
//"id": "38b7a3b35ac9ac1dc87a5e1794f425d65f426a1118ab0634fa23378b2144078d_efb5168bd9c1193ba8f92776138043faf07677d8a497397d5e1155e6ea6a7bfb",
//"backward_quantity": 247500,
//"tx0_expiration": 5000,
//"match_expire_index": 422690,
//"tx1_address": "18VNeRv8vL528HF7ruKwxycrfNEeoqmHpa",
//"tx1_index": 518730,
//"status": "pending",
//"tx0_address": "1CRrFNBPg951C1s8VoobEtT62sFoQbmAo2",
//"tx0_index": 515943,
//"fee_paid": 0,
//"forward_quantity": 150000000,
//"backward_asset": "BTC",
//"tx1_block_index": 422670,
//"block_index": 422670,
//"forward_asset": "DOUGH",
//"tx0_hash": "38b7a3b35ac9ac1dc87a5e1794f425d65f426a1118ab0634fa23378b2144078d",
//"tx0_block_index": 421859,
//"tx1_expiration": 20
//}
//]


//function getBtcOrdersTxIndex(callback){
//    
//    var source_html = window.location.pathname+"php/btcGetOrders.php";
//    
//    $.getJSON( source_html, function( data ) { 
//        
//        console.log(data)
//        
//        var orders = new Array()
//        
//        for(var i=0; i < data.orders.length; i++){
//            
//            var tx = data.orders[i].tx_index
//            
//            orders[tx] = {asset: data.orders[i].give_asset, divisible: data.divisibility[data.orders[i].give_asset], give_asset: data.orders[i].give_quantity, get_btc: data.orders[i].get_quantity, asset_remaining: data.orders[i].give_remaining, btc_remaining: data.orders[i].get_remaining, status: data.orders[i].status, expire_index: data.orders[i].expire_index}
//                                
//        }
//        
//        callback(orders)
//        
//    })
//}

function getCurrentBlock(callback){
    var source_html = "https://btc.blockr.io/api/v1/coin/info"
    
    $.getJSON( source_html, function( data ) { 
        sessionStorage.setItem("last_block", data.data.last_block.nb)
        callback(data.data.last_block.nb)
    })
}

function checkValidBtcAmount(inputval, callback) {
    
    if(isNaN(inputval) == true || inputval <= 0 || $.isNumeric( inputval ) == false) {
        //invalid
        callback("Invalid")
    } else {
        if(retr_dec(inputval) > 8) {
        //too many decimal places
        callback("Too many decimal places!")
        } else  {
            if(inputval < 0.00000001 || inputval > 21000000){
                callback("Invalid Amount")
            } else {
                callback("ok")
            }
        }
    }
    
}

function calcAssetAmount(asset, btc, callback) {
    
    $("#dialogSellAsset-cost").data("valid", false)
    
    var btcbalance = $("#btcBalance").html()
    var assetBalance = $("#dialogSellAsset-balance").html()
    var assetDivisible = $("#dialogSellAsset-balance").data("divisible")
    
    var btcAmount = (asset * btc).toFixed(8)
    
    if(asset.length == 0 || btc.length == 0){
        //blank
        callback("0 BTC each")
    } else {
    
        checkValidBtcAmount(btcAmount, function(response){
            
            if(response == "ok") {
                if(isNaN(asset) == true || asset <= 0 || $.isNumeric( asset ) == false) {
                    //invalid
                    callback("Invalid (asset)")
                } else {
                    if (btcAmount <= 0.001) {
                        //invalid
                        callback("Valid orders must be greater than 0.001 BTC")
                    } else {
                        if (parseFloat(asset) > parseFloat(assetBalance)) {
                            //only asset_remaining available!
                            var cb = "Only "+assetBalance+" available!"
                            callback(cb)
                        } else {  
                            //console.log(assetDivisible)
                            if(assetDivisible == "no" && (isInt(asset) == false)) {
                                callback("Asset is not divisible.  Whole numbers only!")
                            } else {
                                if(retr_dec(asset) > 8) {
                                    //too many decimal places
                                    callback("Too many decimal places!")
                                } else {
                                    //valid!
                                    var usd_btc = sessionStorage.getItem("currentprice_btc");
                                    var usdperorder = (btcAmount * usd_btc).toFixed(2)
  
                                    $("#dialogSellAsset-cost").data("valid", true)
                                    $("#dialogSellAsset-cost").data("total", btcAmount)
                                    var displayTotal = "<div>" + parseFloat(btcAmount).toFixed(8) + " BTC</div><div class='small showUsd' style='font-style: italic; color: #266121;'>($"+usdperorder+")</div"
                                    callback(displayTotal)   
                                }
                            }

                        }
                    }
                }
            } else {
                callback(response)
            }
        })
    }
    
}

function calcBtcOrderAmount(inputval, callback) {
    
    var btcbalance = $("#btcBalance").html()
    
    var asset_remaining = $("#dialogBuyAsset-rate").data("asset_remaining")
    var btc_remaining = $("#dialogBuyAsset-rate").data("btc_remaining")
    var divisible = $("#dialogBuyAsset-rate").data("divisible")
    
    if(divisible == 0) {
        var total = inputval * ((btc_remaining/100000000)/asset_remaining)
    } else {
        var total = inputval * ((btc_remaining)/asset_remaining)    
    }
    
    //round up to 5 decimal places
    total = Math.ceil10(total, -5)
    
    $("#dialogBuyAsset-cost").data("valid", false)
    
    if(inputval.length == 0){
        //blank
        callback("0 BTC")
    }else{
        if(isNaN(inputval) == true || inputval <= 0 || $.isNumeric( inputval ) == false) {
            //invalid
            callback("Invalid")
        } else {
            if (total <= 0.001) {
                //invalid
                callback("Valid orders must be greater than 0.001 BTC")
            } else {
                if (inputval > asset_remaining) {
                    //only asset_remaining available!
                    var cb = "Only "+asset_remaining+" available!"
                    callback(cb)
                } else {    
                    if (total > btcbalance) {
                        //you don't have enough btc!
                        callback("You don't have enough BTC!")
                    } else {
                        if(divisible == 0 && (isInt(inputval) == false)) {
                            callback("Asset is not divisible.  Whole numbers only!")
                        } else {
                            if(retr_dec(inputval) > 8) {
                                //too many decimal places
                                callback("Too many decimal places!")
                            } else {
                                //valid!
                                var usd_btc = sessionStorage.getItem("currentprice_btc");
                                var usdperorder = (total * usd_btc).toFixed(2)
                                
                                $("#dialogBuyAsset-cost").data("valid", true)
                                $("#dialogBuyAsset-cost").data("total", total.toFixed(8))
                                
                                var displayTotal = "<div>" + total.toFixed(8) + " BTC</div><div class='small showUsd' style='font-style: italic; color: #266121;'>($"+usdperorder+")</div"
                                
                                callback(displayTotal)   
                            }
                        }
                    }
                }
            }
        }
    }
    
}

function createTableOrders(orders, currentblock){
    
    $('#content-menubar-container').show()
    
    
    var currentaddr = $("#addressCurrent").data("address")
    
    $('#yourorders').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
    $('#content').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
    
    
    $('#content').load('html/orderstable.html', function() {
    $('#yourorders').load('html/table-yourorders.html', function() {
        
        var yourordercount = 0;
          
        for(var i=0; i < orders.length; i++){
            
            if(orders[i].divisible == 1){
                var asset_remaining = orders[i].asset_remaining / 100000000
                var btcperasset = (orders[i].get_btc / orders[i].give_asset).toFixed(8)
            } else {
                var asset_remaining = orders[i].asset_remaining
                var btcperasset = (orders[i].get_btc / (orders[i].give_asset*100000000)).toFixed(8)
            }
            
            var usd_btc = sessionStorage.getItem("currentprice_btc");
            var usdperasset = (btcperasset * usd_btc).toFixed(2)
            
            if (usdperasset == 0 ) {usdperasset = "<$0.01"} else {usdperasset = "$"+usdperasset}
            //var time_remaining = (orders[i].expire_index-currentblock) 
            
            var time_remaining = ((orders[i].expire_index-currentblock) * 10 * 60).toTimeFormat() 
            
            if(!Number.isInteger(asset_remaining)){
                asset_remaining = asset_remaining.toFixed(8)
            }
            
            if(orders[i].source == currentaddr) {
                
                //console.log(orders[i])
                
//                {asset: data.orders[i].give_asset, divisible: data.divisibility[data.orders[i].give_asset], give_asset: data.orders[i].give_quantity, get_btc: data.orders[i].get_quantity, asset_remaining: data.orders[i].give_remaining, btc_remaining: data.orders[i].get_remaining, tx_index: data.orders[i].tx_index, tx_hash: data.orders[i].tx_hash, status: data.orders[i].status, expire_index: data.orders[i].expire_index, source: data.orders[i].source}
                
                var row_class = "active-yours"
                var active_status = "active yours" 
                var active_status_display = "Active" 
                if(orders[i].status != "open" && orders[i].asset_remaining != 0){  
                    var row_class = "active"
                    var active_status = "closed yours" 
                    //var active_status_display = "Closed"
                    var active_status_display = (orders[i].status).capitalizeFirstLetter()
                    if(orders[i].status == "cancelled"){row_class = "danger"}
                    var time_remaining = "n/a"
                } else if(orders[i].asset_remaining == 0){
                    var row_class = "success"
                    var active_status = "closed yours" 
                    var active_status_display = "Filled"
                    var time_remaining = "n/a"
                    if(orders[i].divisible == 1){
                        var asset_remaining = orders[i].give_asset / 100000000
                    } else {
                        var asset_remaining = orders[i].give_asset
                    }
                } 
                yourordercount++
                
                $("#table-yourorders tbody").append("<tr class='"+row_class+" orderTx' id='order-"+orders[i].tx_index+"' data-tx_index='"+orders[i].tx_index+"' data-status='"+active_status+"'><td class='ordersTable hideSmall'>"+active_status_display+"</td><td><div class='ordersTable-icon'>"+assetIcon(orders[i].asset)+"</div><div class='ordersTable-name'>"+orders[i].asset+"</div></td><td>"+btcperasset+" <span class='showUsd small' style='font-style: italic; color: #266121;'>("+usdperasset+")</span></td><td class='ordersTable hideVerySmall'>"+asset_remaining+"</td><td class='ordersTable hideSmall hideLarge'>"+time_remaining+"</td></tr>")
                
            } else {
                
                
                if(orders[i].status == "open" && orders[i].btc_remaining > 100000) {
                    var row_class = "warning"
                    var active_status = "Active"
                    var active_status_display = "Active"
                } else if(asset_remaining == 0){
                    var row_class = "success"
                    var active_status = "closed" 
                    var active_status_display = "Filled"
                    var time_remaining = "n/a"
                } else if(orders[i].status != "open"){
                    var row_class = "active"
                    var active_status = "Closed"
                    var active_status_display = (orders[i].status).capitalizeFirstLetter()
                    if(orders[i].status == "cancelled"){row_class = "danger"}
                    var time_remaining = "n/a"
                }
                
                $("#ordersTable tbody").append("<tr class='"+row_class+" orderTx' id='order-"+orders[i].tx_index+"' data-tx_index='"+orders[i].tx_index+"' data-status='"+active_status+"'><td class='ordersTable hideSmall'>"+active_status_display+"</td><td><div class='ordersTable-icon'>"+assetIcon(orders[i].asset)+"</div><div class='ordersTable-name'>"+orders[i].asset+"</div></td><td>"+btcperasset+" <span class='showUsd small' style='font-style: italic; color: #266121;'>("+usdperasset+")</span></td><td class='ordersTable hideVerySmall'>"+asset_remaining+"</td><td class='ordersTable hideSmall hideLarge'>"+time_remaining+"</td></tr>")
            
           
            }

            
        }
        
                    
            //time_remaining.toTimeFormat()
            
            $(".ordersTable-icon img").height("20px")
            $(".ordersTable-icon img").width("20px")
        
        
        var assetParam = gup("a")
        if(assetParam == null){assetParam = ""}
        
        $("#ordersTable").DataTable( {
            "lengthMenu": [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
            "dom": '<"pull-left"f><"pull-right"l>tip',
            "search": {
                "search": assetParam
            },
            "order": [[ 4, "asc" ]],
            "iDisplayLength": 5,
            "autoWidth": false
        })
        
        if(yourordercount > 0){
            $('#yourorders-menubar-container').show()
            $("#table-yourorders").DataTable( {
                "lengthMenu": [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
                "dom": '<"pull-left"f><"pull-right"l>tip',
                "search": {
                    "search": assetParam
                },
                "iDisplayLength": 5,
                "autoWidth": false
            })
            //$("#ordersTable").tablesorter({sortList: [[0,0], [1,0], [4,0]]})
        } else {
            $('#yourorders-menubar-container').hide()
        }
        
        var indexParam = gup("i")
        if(indexParam != null){
            if(sessionStorage.getItem("orders")){   
//                console.log("orders still loading")
//                var loadOrder = setTimeout(function(){
//                    buyAssetModal(indexParam) 
//                }, 2000)
//            } else {
                
            
                for(var i=0; i < orders.length; i++){
                    if(orders[i].tx_index == indexParam){
                        var thisorder = orders[i]
                        
                        console.log(thisorder)
                        
                        if(thisorder.status == "open") {
                            if(thisorder.source == currentaddr) {

                                buyAssetModal(indexParam, "you") 

                            } else {

                                buyAssetModal(indexParam) 

                            }
                        }
                        
                    } 
                    
                }
            }  
        }  
        
    })
        })
    
}

function createTableMatches(matches, currentblock){
    
    $('#content-matches-menubar-container').show()
    
    $('#content-matches').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
    
    sessionStorage.setItem("matches", JSON.stringify(matches)) 
    
    if(matches.length > 0){
        
        if($('#yourorders-container').hasClass('col-lg-12')){
            $('#yourorders-container').removeClass('col-lg-12').addClass('col-lg-6')
        }
    
        $('#content-matches').load('html/table-matches.html', function() {

            //var unconfirmed = $.parseJSON(sessionStorage.getItem("unconfirmed"))
            
            var pendingExists = false
            
            for(var i=0; i < matches.length; i++){

                //console.log(matches)

                var asset = matches[i].get_asset

                if(matches[i].asset_div == 1){
                    var buy_qty = matches[i].asset_qty / 100000000
                } else {
                    var buy_qty = matches[i].asset_qty
                }

                var sell_qty = matches[i].sell_qty / 100000000
                
                
                var usd_btc = sessionStorage.getItem("currentprice_btc");
                var usd_cost = (sell_qty * usd_btc).toFixed(2)
                if (usd_cost == 0 ) {usd_cost = "<$0.01"} else {usd_cost = "$"+usd_cost}

                if(matches[i].status == "pending") {
                    var time_remaining = ((matches[i].match_expire_index-currentblock) * 10 * 60).toTimeFormat() 
                    var statusClass = 'warning'
                    pendingExists = true
                } else if(matches[i].status == "expired"){
                    var time_remaining = "n/a"
                    var statusClass = 'active'
                } else if(matches[i].status == "completed"){
                    var time_remaining = "n/a"
                    var statusClass = 'success'
                }
                
                var statustext = (matches[i].status).capitalizeFirstLetter()
                
                //set unconfirmed tx info if exists
                $("#unconfirmedTxAmount-"+matches[i].order_id).html(buy_qty)
                $("#unconfirmedTxAsset-"+matches[i].order_id).html(asset)
                      
//                if ($("#matches-"+matches[i].order_id).data('status') == "waiting") {
                if($("#unconfirmedTxAsset-"+matches[i].order_id).is(':visible')) {
                    var status = "Waiting for confirmation"
                    var data_status = "waiting"
                    pendingExists = false
                } else {
                    var status = (matches[i].status).capitalizeFirstLetter()
                    var data_status = matches[i].status
                }

                $("#matchesTable tbody").append("<tr class='"+statusClass+" matchTx' id='matches-"+matches[i].order_id+"' data-tx0_hash='"+matches[i].tx0_hash+"' data-tx1_hash='"+matches[i].tx1_hash+"' data-add_from='"+matches[i].add_from+"' data-add_to='"+matches[i].add_to+"' data-sell_qty='"+matches[i].sell_qty+"' data-buy_qty='"+buy_qty+"' data-asset='"+asset+"' data-status='"+data_status+"' data-block_index='"+matches[i].block_index+"'><td id='matchTxStatus-"+matches[i].order_id+"' class='matchesTable hideSmall'>"+status+"</td><td class='matchesTable hideVerySmall hideLarge'>"+matches[i].block_index+"</td><td><div class='ordersTable-icon'>"+assetIcon(asset)+"</div><div class='matchesTable-name'>"+asset+"</div></td><td>"+buy_qty+"</td><td class='matchesTable hideVerySmall hideLarge'>"+sell_qty+" <span class='showUsd small' style='font-style: italic; color: #266121;'>("+usd_cost+")</span></td><td class='matchesTable hideSmall'>"+time_remaining+"</td></tr>")

                $(".ordersTable-icon img").height("20px")
                $(".ordersTable-icon img").width("20px")
                
                //console.log(matches[i].order_id)

            }
            
            if(pendingExists == true){
                pendingAlertModal()
            }


            $("#matchesTable").DataTable( {
//                "bFilter": false,
                "lengthMenu": [[5, 10, 25, -1], [5, 10, 25, "All"]],
                "order": [[ 1, "desc" ]],
                "dom": '<"pull-left"f><"pull-right"l>tip',
                "iDisplayLength": 5,
                "autoWidth": false
            })
            //$("#matchesTable").tablesorter({sortInitialOrder: 'desc', sortList: [[0,1], [1,0]]})
            

        });

    } else {
        
        if($('#content-container').hasClass('col-lg-6')){
            $('#content-container').removeClass('col-lg-6').addClass('col-lg-12')
        }
        
        $('#content-matches').html("No order matches")
        $('#content-matches-menubar-container').hide()
        
    }
    
}



function buyAssetModal(tx_index, owner){
            
    var currentaddr = $("#addressCurrent").data("address")
    
    var orders = $.parseJSON(sessionStorage.getItem("orders"))
    
    for(var i=0; i < orders.length; i++){
        if(orders[i].tx_index == tx_index){
            var thisorder = orders[i]
        }
    }
    
 //{"asset":"CAKE","divisible":0,"give_asset":12,"get_btc":200000,"asset_remaining":12,"btc_remaining":200000,"tx_index":515946,"status":"open","expire_index":426859}
    
    var asset = thisorder.asset
    var maxbtc = thisorder.btc_remaining
    if(thisorder.divisible == 1){
        var maxasset = thisorder.asset_remaining / 100000000
        var btcperasset = (thisorder.get_btc / thisorder.give_asset).toFixed(8)
    } else {
        var maxasset = thisorder.asset_remaining   
        var btcperasset = (thisorder.get_btc / (thisorder.give_asset*100000000)).toFixed(8)
    }   
    
    
            
    console.log(asset)
    console.log(maxasset)
    
    
    var orderLink = "btcpaymarket.com/?i="+thisorder.tx_index
    var shareText = "Buy "+asset+" for "+btcperasset+" BTC at " + orderLink

    var buyAssetDialog = new BootstrapDialog({
        title: 'Buy '+asset,
        message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-buy-asset.html', function(){
                    $(this).find("#dialogBuyAsset-maxasset").html(maxasset)
                    $(this).find("#dialogBuyAsset-rate").html(btcperasset)
                    $(this).find("#dialogBuyAsset-icon-lg").html(assetIcon(asset))
                    $(this).find(".dialogBuyAsset-asset").html(asset)

                    
                    //$(this).find("#dialogBuyAsset-share").html("<a href='https://"+orderLink+"'>"+shareText+"</a>")
                    $(this).find("#dialogBuyAsset-share").html("<a href='http://twitter.com/intent/tweet?text="+encodeURI(shareText)+"' target='_blank'><div style='font-size: 20px; margin: -8px;'><i class='fa fa-twitter'></i></div></a>")
                    
//                    getPoloRate(asset, function(topbid){
//                        console.log(topbid)
//                    })
                    
                    var usd_btc = sessionStorage.getItem("currentprice_btc");
                    var usdperasset = (btcperasset * usd_btc).toFixed(2)

                    if (usdperasset == 0 ) {usdperasset = "<$0.01"} else {usdperasset = "($"+usdperasset+")"}
                    $(this).find("#dialogBuyAsset-usd").html(usdperasset)
                    
                    var btcBal = $("#btcBalance").html()
                    $(this).find(".btcBalanceModalInfo").html(btcBal)
                    
                    var btcBalUsd = (btcBal * usd_btc).toFixed(2)
                    
                    $(this).find("#dialogBuyAsset-btcBalance-usd").html("($"+btcBalUsd+")")
                    
                    $(this).find("#dialogBuyAsset-rate").data({asset_remaining: thisorder.asset_remaining, btc_remaining: thisorder.btc_remaining, divisible: thisorder.divisible})
                    
                    if(owner == "you"){
                        
                        buyAssetDialog.setClosable(false) 
                        
                        buyAssetDialog.setTitle("Your Order to Sell "+asset);
                        
                        $(this).find("#dialogBuyAsset-body").html("<p style='font-style: italic;' align='center'>To share this order use the following link:</p><p style='font-weight: bold;' align='center'>"+orderLink+"</p>")
                        buyAssetDialog.getButton('btn-previewOrder').addClass("hidden")
                        
                        
                        $(this).find("#dialogBuyAsset-body").append("<div align='center' style='padding: 50px 0 10px 0; margin: -15px 0 0 0;'><button id='dialogBuyAsset-btn-cancel' type='button' class='btn btn-danger btn-sm' data-txhash='"+thisorder.tx_hash+"' data-asset='"+asset+"'>Cancel Order</button></div>");
                        
                    }
                })

                return $message
            },
        buttons: [
            {
                id: "btn-previewOrder",
                label: 'Preview Order',
                cssClass: 'btn-primary disabled',
                action: function(dialogItself) {
                    var btcAmount = $("#dialogBuyAsset-cost").data("total")
                    var assetAmount = $("#dialogBuyAsset-amount").val()
                    var assetDivisible = $("#dialogBuyAsset-rate").data("divisible")
                    var rate = $("#dialogBuyAsset-rate").html()
                    var costandfees = (parseFloat(btcAmount)+0.0006).toFixed(8)
                    
                    var btcperasset = $("#dialogBuyAsset-rate").html()
                    $message = $('<div></div>').load('html/dialog-buy-asset-preview.html', function(){
                        $("#dialogBuyAssetPreview-btctotal").html(btcAmount)
                        $("#dialogBuyAssetPreview-icon-lg").html(assetIcon(asset))
                        $("#dialogBuyAssetPreview-rate").html(rate)
                        $("#dialogBuyAssetPreview-amount").html(assetAmount)
                        $("#dialogBuyAssetPreview-amount").data({divisible: assetDivisible})
                        $(".dialogBuyAssetPreview-asset").html(asset)
                        $("#dialogBuyAssetPreview-costandfees").html(costandfees)
                        
                        var usd_btc = sessionStorage.getItem("currentprice_btc");
                        var usdperasset = (costandfees * usd_btc).toFixed(2)

                        if (usdperasset == 0 ) {usdperasset = "<$0.01"} else {usdperasset = "($"+usdperasset+")"}
                        $(this).find("#dialogBuyAssetPreview-usd").html(usdperasset)
                        
                        var usdperfees = (0.0006 * usd_btc).toFixed(2)
                        var usdperbtcAmount = (btcAmount * usd_btc).toFixed(2)
                        
                        $(this).find("#dialogBuyAssetPreview-btctotal-usd").html("($"+usdperbtcAmount+")")
                        $(this).find("#dialogBuyAssetPreview-fees-usd").html("($"+usdperfees+")")
                    })
                    buyAssetDialog.setMessage($message);
                    
                    
                    $("#btn-previewOrder").addClass("hidden")
                    $("#btn-placeOrder").removeClass("hidden")
                } 
            },
            {
                id: "btn-placeOrder",
                label: 'Place Order',
                cssClass: 'btn-success hidden',
                action: function(dialogItself) {
                    
                    var sell_asset = "BTC"
                    var sell_asset_div = 1
                    var sell_qty = $("#dialogBuyAssetPreview-btctotal").html()
                    
                    var buy_asset = $(".dialogBuyAssetPreview-asset").html()
                    var buy_asset_div = $("#dialogBuyAssetPreview-amount").data("divisible")
                    var buy_qty = $("#dialogBuyAssetPreview-amount").html()
                    
                    var expiration = 20 //set at 20 blocks
                    var transfee = 0.0001 //set at 0.0001
                    var passphrase = sessionStorage.getItem("passphrase")
                    
                    $("#btn-placeOrder").addClass("disabled")
                    dialogItself.getModalBody().find('#dialogBuyAssetPreview-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                    
                    createOrder_opreturn(currentaddr, sell_asset, sell_asset_div, sell_qty, buy_asset, buy_asset_div, buy_qty, expiration, transfee, passphrase, function(signedtx){
                        sendRawSignedTx(signedtx, function(status, txid){
                            if (status == "success") {
                                dialogItself.getModalBody().find('#dialogBuyAssetPreview-container').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                dialogItself.setClosable(false)  
                                
                                $("body").data("sendTx", true)
                            } else {
                                dialogItself.getModalBody().find('#dialogSendAsset-header').html("Error")
                            }   
                        })    
                    })
                }
            },
            {
                id: "btn-closeBuyAsset",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
                    
                    if($("body").data("sendTx") == true){
                        var address = $("#addressCurrent").data("address")
                        
                        $('#content-unconfirmed').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
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
            }
        ]
    });

    buyAssetDialog.open()    

}


function sellAssetModal(asset, divisible, balance){
            
    var currentaddr = $("#addressCurrent").data("address")

    var sellAssetDialog = new BootstrapDialog({
        title: 'Sell '+asset,
        message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-sell-asset.html', function(){
                    $(this).find("#dialogSellAsset-balance").html(balance)
                    $(this).find("#dialogSellAsset-balance").data("divisible", divisible)
                    $(this).find("#dialogSellAsset-icon-lg").html(assetIcon(asset))
                    $(this).find(".dialogSellAsset-asset").html(asset)
                    
                })
                
                return $message
            },
        buttons: [
            {
                id: "btn-previewOrder",
                label: 'Preview Order',
                cssClass: 'btn-primary disabled',
                action: function(dialogItself) {

                    var assetAmount = $("#dialogSellAsset-amount").val()
                    var assetDivisible = $("#dialogBuyAsset-balance").data("divisible")
                    var btcperasset = $("#dialogSellAsset-rateperbtc").val()
                    var txfee = 0.0001
                    
                    $message = $('<div></div>').load('html/dialog-sell-asset-preview.html', function(){
                        
                        
                        var usd_btc = sessionStorage.getItem("currentprice_btc");
                        var usdperfee = (txfee * usd_btc).toFixed(2)
                        $("#dialogSellAssetPreview-btccost-usd").html("($"+usdperfee+")")
                        
                        
                        $("#dialogSellAssetPreview-btccost").html(txfee)
                        $("#dialogSellAssetPreview-btctotal").html((assetAmount * btcperasset).toFixed(8))
                        $("#dialogSellAssetPreview-icon-lg").html(assetIcon(asset))
                        $("#dialogSellAssetPreview-rate").html(parseFloat(btcperasset).toFixed(8))
                        $("#dialogSellAssetPreview-amount").html(assetAmount)
                        $("#dialogSellAssetPreview-amount").data({divisible: assetDivisible})
                        $(".dialogSellAssetPreview-asset").html(asset)
                    })
                    sellAssetDialog.setMessage($message);
                    
                    
                    $("#btn-previewOrder").addClass("hidden")
                    $("#btn-placeOrder").removeClass("hidden")
                } 
            },
            {
                id: "btn-placeOrder",
                label: 'Place Order',
                cssClass: 'btn-success hidden',
                action: function(dialogItself) {
                    
                    var sell_asset = asset
                    var sell_asset_div = divisible
                    var sell_qty = $("#dialogSellAssetPreview-amount").html()
                    
                    var buy_asset = "BTC"
                    var buy_asset_div = "yes"
                    var buy_qty = $("#dialogSellAssetPreview-btctotal").html()
                    
                    var expiration = 1000 //set at 1000 blocks
                    var transfee = 0.0001 //set at 0.0001
                    var passphrase = sessionStorage.getItem("passphrase")
                    
                    $("#btn-placeOrder").addClass("disabled")
                    dialogItself.getModalBody().find('#dialogSellAssetPreview-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")
                    
                    createOrder_opreturn(currentaddr, sell_asset, sell_asset_div, sell_qty, buy_asset, buy_asset_div, buy_qty, expiration, transfee, passphrase, function(signedtx){
                        sendRawSignedTx(signedtx, function(status, txid){
                            if (status == "success") {
                                dialogItself.getModalBody().find('#dialogSellAssetPreview-header').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div>")  
                                dialogItself.setClosable(false)
                                
                                $("body").data("sendTx", true)
                            } else {
                                dialogItself.getModalBody().find('#dialogSellAssetPreview-header').html("Error")
                            }   
                        })    
                        console.log(signedtx)
                    })
                }
            },
            {
                id: "btn-closeBuyAsset",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
                    
                    if($("body").data("sendTx") == true){
                        var address = $("#addressCurrent").data("address")
                        
                        $('#content-unconfirmed').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
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
            }
        ]
    });

    sellAssetDialog.open()    

}

function btcpayModal(txdata){
    
    var btcpayDialog = new BootstrapDialog({
        title: 'Send BTC to complete order',
        message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-btcpay.html', function(){
              
                    var btcAmount = (txdata.sell_qty / 100000000).toFixed(8)
                    var costandfees = (parseFloat(btcAmount)+0.0006).toFixed(8)
                    
                    $(this).find("#dialogBtcpay-btctotal").html(btcAmount)
                    $(this).find("#dialogBtcpay-costandfees").html(costandfees)
                    $(this).find("#dialogBtcpay-assetQty").html(txdata.buy_qty)
                    $(this).find("#dialogBtcpay-asset").html(txdata.asset)
                    
                    $(this).find("#dialogBtcpay-assetIcon").html(assetIcon(txdata.asset))
                    
                    
       
                })
                
                return $message
            },
        buttons: [
            {
                id: "btn-completeBtcpay",
                label: 'Complete Order',
                cssClass: 'btn-success',
                action: function(dialogItself) {
    
                    var passphrase = sessionStorage.getItem("passphrase")
                    var transfee_satoshis = 50000
                    
                    console.log(txdata.sell_qty)
                    
                    $("#btn-completeBtcpay").addClass("disabled")
                    dialogItself.getModalBody().find('#dialogBtcpay-header').html("<i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span>")

                    btcpay_opreturn(txdata.add_from, txdata.add_to, txdata.sell_qty, txdata.order_txid_0, txdata.order_txid_1, transfee_satoshis, passphrase, function(signedtx){

                        sendRawSignedTx(signedtx, function(status, txid){
                            if (status == "success") {
                                dialogItself.getModalBody().find('#dialogBtcpay-container').html("<div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div>")
                                
                                dialogItself.setClosable(false)
                                $("body").data("sendTx", true)
                            } else {
                                dialogItself.getModalBody().find('#dialogBtcpay-header').html("Error")
                            }   
                        })    

                    })
                    
                }
            },
            {
                id: "btn-closeBtcpay",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
                    
                    if($("body").data("sendTx") == true){
                        var address = $("#addressCurrent").data("address")
                        
                        $('#content-unconfirmed').html("<div style='padding: 0 0 10px 0;'><i class='fa fa-refresh fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
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
            }
        ]
    })
    
    btcpayDialog.open()  
    
}

function orderInfoModal(status) {
    
        var orderInfoDialog = new BootstrapDialog({
        title: 'Order Information',
        message: function(dialog){
                if(status == "expired"){
                    var $message = $('<div></div>').load('html/dialog-OrderInfoExpired.html', function(){})
                } else if(status == "completed") {
                    var $message = $('<div></div>').load('html/dialog-OrderInfoCompleted.html', function(){})
                } else if(status == "waiting") {
                    var $message = $('<div></div>').load('html/dialog-OrderInfoWaiting.html', function(){})
                }
            
                return $message
            },
        buttons: [
            {
                id: "btn-closeOrderInfo",
                label: 'Close',
                cssClass: 'btn-default',
                action: function(dialogItself) {
    
                    dialogItself.close()
                    
                }
            }
        ]
    })
    
    orderInfoDialog.open()  
    
}

function cancelOrderModal(asset, order_txid) {
 
    var cancel_text = "<div id='cancelOrder-confirm'>Are you sure you want to cancel your "+asset+" sell order? <b>(0.0001 BTC fee)</b></div>"
    
    BootstrapDialog.confirm({
        title: "Cancel Order",
        type: "type-danger",
        btnCancelLabel: 'Close', // <-- Default value is 'Cancel',
//        btnOKLabel: 'Yes', // <-- Default value is 'OK',
        message: cancel_text, 
        callback: function(result){
            if(result) {
                
                var transfee = 0.0001 //set at 0.0001
                var passphrase = sessionStorage.getItem("passphrase")  
                var add_from = $("#addressCurrent").data("address")

                //BootstrapDialog.close()
                
                $('#dialogBuyAsset-container').html("<div align='center' style='padding: 20px;'><i class='fa fa-spinner fa-spin fa-3x fa-fw'></i><span class='sr-only'>Loading...</span></div>")
        
                cancelOrder_opreturn(add_from, order_txid, transfee, passphrase, function(signedtx){
                    sendRawSignedTx(signedtx, function(status, txid){
                        if (status == "success") {
                            $('#dialogBuyAsset-container').html("<div align='center'><div><div style='padding: 15px 0 15px 0; font-weight: bold; font-size: 18px;'>Transaction Sent!</div><i class='fa fa-check fa-3x' aria-hidden='true'></i></div><div style='padding: 15px 0 15px 0;'><a href='https://chain.so/tx/BTC/"+txid+"' target='_blank'>View your Transaction</a></div></div>")
                            $("body").data("sendTx", true)
                        } else {
                            $('#dialogBuyAsset-container').html("<div align='center' style='padding: 20px;'>Error</div>")
                        }  
                    })           
                })
                   
            }
        } 
    })

}

