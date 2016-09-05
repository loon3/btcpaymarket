<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);

$address = array($_GET["addr"]);

$block = 400000;
$assets = array("BTC");
$filters = array(array('field' => 'backward_asset', 'op' => 'IN', 'value' => $assets), array('field' => 'tx1_address', 'op' => 'IN', 'value' => $address));

//array('field' => 'status', 'op' => 'IN', 'value' => array('pending', 'completed')), 

$ordermatches_result = $client->execute('get_order_matches', array('filters' => $filters, 'filterop' => "AND", 'start_block' => $block)); 

$give_assets = array();

for($i=0; $i < count($ordermatches_result); $i++){
    $give_assets[$i] = $ordermatches_result[$i]["forward_asset"];
}

$filters = array(array('field' => 'asset', 'op' => 'IN', 'value' => $give_assets));
$issuances_result = $client->execute('get_issuances', array('filters' => $filters, 'filterop' => "AND"));

$assets_divisible = array();

for($i=0; $i < count($issuances_result); $i++){
    $assets_divisible[$issuances_result[$i]["asset"]] = $issuances_result[$i]["divisible"];
}


$jsonarray = array('matches' => $ordermatches_result, 'divisibility' => $assets_divisible);

echo json_encode($jsonarray);


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


?>