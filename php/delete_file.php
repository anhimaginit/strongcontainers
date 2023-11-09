<?php
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : $_SERVER['HTTP_HOST'];
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: POST, OPTIONS, GET, PUT');
header('Access-Control-Allow-Credentials: true');

$filename = $_POST['filename'];
$pathname ="download/";
//$pdfPathTemp = $_SERVER["DOCUMENT_ROOT"].$pathname.$filename;
$pdfPathTemp ='C:/xampp/htdocs/crm/'.$pathname.$filename;

$err = unlink($pdfPathTemp);
/*print_r($pdfPathTemp);
    if (file_exists($pdfPathTemp)) {
       // unlink($pdfPathTemp);
        echo json_encode(true);
    } else {
        echo json_encode('not exist');
    }*/
echo json_encode($err);
//echo json_encode(true);
