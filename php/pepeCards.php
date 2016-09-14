<?

header('Content-Type: application/json');

$html = file_get_contents('http://myrarepepe.com/json/pepelist.json');

echo $html;


?>