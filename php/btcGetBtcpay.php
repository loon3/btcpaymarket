<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);


$filters = array();
$btcpay_result = $client->execute('get_btcpays', array('filters' => $filters, 'filterop' => "AND", 'start_block' => 423351));

$totalbtc = 0;

for($i=0; $i < count($btcpay_result); $i++){
     if ($btcpay_result[$i]["status"] == "valid"){
        $totalbtc += $btcpay_result[$i]["btc_amount"];
     }
}

echo json_encode(array("total_btc" => $totalbtc, "total_orders" => count($btcpay_result), "btcpay_txs" => $btcpay_result));


?>