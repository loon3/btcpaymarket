<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);

//$block = 380000;

$block = $_GET["currentblock"]-10000;
$assets = array("BTC");
$filters = array(array('field' => 'get_asset', 'op' => 'IN', 'value' => $assets));

$orders_result = $client->execute('get_orders', array('filters' => $filters, 'filterop' => "AND", 'start_block' => $block));

$give_assets = array();

for($i=0; $i < count($orders_result); $i++){
    $give_assets[$i] = $orders_result[$i]["give_asset"];
}

//array_push($give_assets, "XCP");

$filters = array(array('field' => 'asset', 'op' => 'IN', 'value' => $give_assets));
$issuances_result = $client->execute('get_issuances', array('filters' => $filters, 'filterop' => "AND"));

$assets_divisible = array();

for($i=0; $i < count($issuances_result); $i++){
    $assets_divisible[$issuances_result[$i]["asset"]] = $issuances_result[$i]["divisible"];
}

//$assets_divisible = array_values(array_map("unserialize", array_unique(array_map("serialize", $assets_divisible))));
//$assets_divisible_key = array();
//
//for($i=0; $i < count($assets_divisible); $i++){
//    $assets_divisible_key[$assets_divisible[$i]["asset"]] = $assets_divisible[$i]["divisible"];
//}

$jsonarray = array('orders' => $orders_result, 'divisibility' => $assets_divisible);

echo json_encode($jsonarray);


?>