<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);

$address = array($_GET["address"]);

$filters = array(array('field' => 'address', 'op' => 'IN', 'value' => $address));
$balances_result = $client->execute('get_balances', array('filters' => $filters));

$balances_parsed = array();

//check if divisible
$assets = array();
for($i=0; $i < count($balances_result); $i++){
    $assets[$i] = $balances_result[$i]["asset"];
}
$filters = array(array('field' => 'asset', 'op' => 'IN', 'value' => $assets));
$issuances_result = $client->execute('get_issuances', array('filters' => $filters, 'filterop' => "AND"));
$assets_divisible = array();

for($i=0; $i < count($issuances_result); $i++){
    $assets_divisible[$issuances_result[$i]["asset"]] = $issuances_result[$i]["divisible"];
}

for($i=0; $i < count($balances_result); $i++){
    $balances_parsed[$i]["asset"] = $balances_result[$i]["asset"];
    if($assets_divisible[$balances_parsed[$i]["asset"]] == 1) {
        $balances_result[$i]["quantity"] /= 100000000;
        $balances_parsed[$i]["amount"] = number_format($balances_result[$i]["quantity"], 8, ".", "");
    } else {
        $balances_parsed[$i]["amount"] = number_format($balances_result[$i]["quantity"], 0, ".", "");
    }  
}

echo json_encode(array('success' => 1, 'total' => count($balances_parsed), 'data' => $balances_parsed));


?>