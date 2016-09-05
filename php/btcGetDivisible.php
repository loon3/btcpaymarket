<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);

$assets = $_POST['assets'];
$assets = explode(',', $assets);


$filters = array(array('field' => 'asset', 'op' => 'IN', 'value' => $assets));
$issuances_result = $client->execute('get_issuances', array('filters' => $filters, 'filterop' => "AND"));

$assets_divisible = array();

for($i=0; $i < count($issuances_result); $i++){
    $assets_divisible[$issuances_result[$i]["asset"]] = $issuances_result[$i]["divisible"];
}

echo json_encode($assets_divisible);


?>