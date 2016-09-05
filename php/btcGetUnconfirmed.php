<?php

//header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require 'includes/Client.php';
use JsonRPC\Client;

include("settings.php");

$client = new Client($cp_server);
$client->authentication($cp_user, $cp_password);

//$block = 380000;
//$assets = array("BTC");
//$filters = array(array('field' => 'get_asset', 'op' => 'IN', 'value' => $assets));

$filters = array();

$result = $client->execute('get_mempool', array('filters' => $filters, 'filterop' => "AND"));



echo json_encode($result);


?>