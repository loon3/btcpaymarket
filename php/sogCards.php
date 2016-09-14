<?

header('Content-Type: application/json');

include_once('includes/simple_html_dom.php');
// Create DOM from URL or file

$html = file_get_html('http://api.moonga.com/RCT/cp/cards/blockchainCards/');


$cards_all = array();


foreach($html->find('div[class=cell]') as $data) {
    
    $img = $data->find('img', 0);
    $card = $data->find('h6', 0);
    $imgurl = $img->src;
    $cardtext = $card->innertext;
    $pieces = explode(" ", $cardtext);
    $asset = $pieces[0];
    
    $cards_all[$asset] = "http://api.moonga.com".$imgurl;
    
}

echo json_encode($cards_all);


?>