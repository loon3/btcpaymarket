$( document ).ready(function() {
    
    $('[data-toggle="tooltip"]').tooltip()
    
    
    $.ajaxSetup({cache:false})
    
//    $("#content-unconfirmed").hide()
//    $("#content-unconfirmed-header").hide()
        
    checkPassphrase()
//        getCurrentBlock(function(currentblock){
//
//            getOrdersMatches(function(matches){
//                createTableMatches(matches, currentblock)   
//            })
//
//            getBtcOrders(currentblock, function(orders){
//                createTableOrders(orders, currentblock)
//            }) 
//            
//            getUnconfirmed(address, function(txs){
//                createTableUnconfirmed(txs)
//            })
//            
//        })
    
    
    $(document).on("keyup", '#inputbox-decrypt', function (event) {
        if(event.keyCode == 13){
            $("body").find("#decrypt-passphrase-btn").trigger("click");
        }
    });

    
    
    $("#btn-DismissWarning").on('click', function(){
        sessionStorage.setItem("disclaimer_dismissed", true) 
    })
    
    
//    $("#toggleHelpBubbles").on('click', function(){
//         if($("#toggleHelpBubbles").html() == "Turn Off Help Bubbles"){
//            $('[data-toggle="tooltip"]').tooltip('hide')
//            $("#toggleHelpBubbles").html("Turn On Help Bubbles")
//            sessionStorage.setItem("tooltips", false) 
//        } else {
//            $('[data-toggle="tooltip"]').tooltip()
//            $("#toggleHelpBubbles").html("Turn Off Help Bubbles")
//            sessionStorage.setItem("tooltips", true) 
//        }
//        
//    })
    
    $("#btn-minimizeOrderMatches-container").on('click', function(){
        $("#content-matches-subcontainer").toggle(function(){
            
                if($("#btn-minimizeOrderMatches").html()=='<i class="fa fa-minus"></i><span class="sr-only">Hide</span>'){
                    $("#btn-minimizeOrderMatches").html('<i class="fa fa-plus"></i><span class="sr-only">Show</span>')
                } else {
                    $("#btn-minimizeOrderMatches").html('<i class="fa fa-minus"></i><span class="sr-only">Hide</span>')
                }
            
        })
    })
    
    $("#btn-minimizeOrders-container").on('click', function(){
        $("#content-subcontainer").toggle(function(){

                if($("#btn-minimizeOrders").html()=='<i class="fa fa-minus"></i><span class="sr-only">Hide</span>'){
                    $("#btn-minimizeOrders").html('<i class="fa fa-plus"></i><span class="sr-only">Show</span>')
                } else {
                    $("#btn-minimizeOrders").html('<i class="fa fa-minus"></i><span class="sr-only">Hide</span>')
                }
            
        })
    })
    
    $("#btn-minimizeUnconfirmed-container").on('click', function(){
        $("#content-unconfirmed-subcontainer").toggle(function(){

                if($("#btn-minimizeUnconfirmed").html()=='<i class="fa fa-minus"></i><span class="sr-only">Hide</span>'){
                    $("#btn-minimizeUnconfirmed").html('<i class="fa fa-plus"></i><span class="sr-only">Show</span>')
                } else {
                    $("#btn-minimizeUnconfirmed").html('<i class="fa fa-minus"></i><span class="sr-only">Hide</span>')
                }
            
        })
    })
    
    $("#btn-minimize-yourorders-container").on('click', function(){
        $("#yourorders-subcontainer").toggle(function(){

                if($("#btn-minimize-yourorders").html()=='<i class="fa fa-minus"></i><span class="sr-only">Hide</span>'){
                    $("#btn-minimize-yourorders").html('<i class="fa fa-plus"></i><span class="sr-only">Show</span>')
                } else {
                    $("#btn-minimize-yourorders").html('<i class="fa fa-minus"></i><span class="sr-only">Hide</span>')
                }
            
        })
    })
    
    
    $('.addressDropdown').on('click', function(){
        var address = $(this).find('.addressDropdownPubkey').html()
        var label = $(this).find('.addressDropdownLabel').html()
        
        $("#addressCurrent").data("address", address)
        $("#addressCurrent").html(address.substr(0,6)+"...")
        $("#addressCurrentLabel").html(label)
        localStorage.setItem("last_address", address)  
        
//        getBalances(address)
//        
//        getUnconfirmed(address, function(txs){
//            createTableUnconfirmed(txs)
//        })
//        
//        var currentblock = sessionStorage.getItem("last_block")
//        getOrdersMatches(function(matches){
//            getBtcOrders(function(orders){
//                createTableOrders(orders, currentblock)
//                createTableMatches(matches, currentblock)
//            })  
//        })
        
        location.reload()
    })
    
    $("#balanceNav").on('click', function(){
        balanceClickModal()
    })    
    
    $("#resetNav").on('click', function(){
        resetWalletModal()
    })  
    
    $("#aboutNav").on('click', function(){
        aboutModal()
    })  
    
//    $("#navbar-sitename").on('click', function(){
//        
////        location.reload()
//        var address = $("#addressCurrent").data("address")
//        refreshTables(address)
//    })
    
//    $(document).on("click", '#btn-refreshOrderMatches', function (event) {
//        getCurrentBlock(function(currentblock){
//            getOrdersMatches(function(matches){
//                createTableMatches(matches, currentblock)   
//            })
//        })
//        
//    })
//    
//    $(document).on("click", '#btn-refreshOrders', function (event) {
//        getCurrentBlock(function(currentblock){
//            getBtcOrders(currentblock, function(orders){
//                createTableOrders(orders, currentblock)
//            }) 
//        })
//        
//    })
//    
//    $(document).on("click", '#btn-refreshUnconfirmed', function (event) {
//        var address = $("#addressCurrent").data("address")
//        getUnconfirmed(address, function(txs){
//            createTableUnconfirmed(txs)
//        })
//                
//    })
    
    
    
    $(document).on("click", '.whatIsBtcpay', function (event) {
        
        aboutModal()
        
    })
    
    
    $(document).on("click", '.unconfirmedTx', function (event) {
        
        var txid = $(this).data("txid")
        var url = 'https://chain.so/tx/BTC/'+txid
    
        window.open(url)
        
    })
    
    $(document).on("click", '.orderTx', function (event) {
        
        var tx_index = $(this).data("tx_index")
        
        if($(this).data("status") == "Active") {
            buyAssetModal(tx_index)
        }
        
        if($(this).data("status") == "active yours") {
            buyAssetModal(tx_index, "you")
        }
    })
    
    $(document).on("click", '.matchTx', function (event) {
        
        var status = $(this).data("status")
        
        console.log(status)
        
        if(status == "pending"){  

            var txData = new Array()
            
            var txData = {add_from: $(this).data("add_from"), add_to: $(this).data("add_to"), sell_qty: $(this).data("sell_qty"), order_txid_0: $(this).data("tx0_hash"), order_txid_1: $(this).data("tx1_hash"), buy_qty: $(this).data("buy_qty"), asset: $(this).data("asset")}
            
            btcpayModal(txData)       
            
        } else {
            
            orderInfoModal(status)
            
        }
        
    })
    
    $(document).on("click", '.assetDropdownItem', function (event) {
        
        var asset = $(this).find('.assetDropdownItem-name').html()
        var divisible = $(this).find('.assetDropdownItem-name').data("divisible")
        var balance = $(this).find('.assetDropdownItem-balance').html()
        
        assetMenuModal(asset, divisible, balance)
    })
    
    
    
    $(document).on("click", '#dialogBuyAsset-btn-cancel', function (event) {
        
        var order_txid = $(this).data("txhash")
        var asset = $(this).data("asset")
        
        cancelOrderModal(asset, order_txid)

    })
    
    
    
    
    $(document).on("keyup", '#dialogBuyAsset-amount', function (event) {
        
        var inputval = $(this).val()
        
        calcBtcOrderAmount(inputval, function(total){
            $("#dialogBuyAsset-cost").html(total)
            
            $("#btn-previewOrder").addClass("disabled")
            
            if($("#dialogBuyAsset-cost").data("valid") == true){
                $("#btn-previewOrder").removeClass("disabled")
            }
        })
    })
    
    
    
    
    
    $(document).on("keyup", '#dialogSellAsset-amount', function (event) {
        
        var asset = $(this).val()
        var btc = $("#dialogSellAsset-rateperbtc").val()
        
        calcAssetAmount(asset, btc, function(response){
            $("#dialogSellAsset-cost").html(response)

            if($("#dialogSellAsset-cost").data("valid") == true ){
                $("#btn-previewOrder").removeClass("disabled")
            } else {
                $("#btn-previewOrder").addClass("disabled")
            }
        })
    })
    
    $(document).on("keyup", '#dialogSellAsset-rateperbtc', function (event) {
        var btc = $(this).val()
        var asset = $("#dialogSellAsset-amount").val()
        
        calcAssetAmount(asset, btc, function(response){
            $("#dialogSellAsset-cost").html(response)

            if($("#dialogSellAsset-cost").data("valid") == true ){
                $("#btn-previewOrder").removeClass("disabled")
            } else {
                $("#btn-previewOrder").addClass("disabled")
            }
        })
    })
    
    
    setInterval(function(){
        var address = $("#addressCurrent").data("address")
        refreshTables(address)
    }, 600000) //refresh at 10 min interval
    //}, 15000) //for testing, 15 sec interval
   
    
    

})