<?php
class Api_Path{
    public $api_path;
    public $domain_path ;
    public $download;
    public $api_path_dev;
    public $pdf_path;
    public $processing_percentage;
    function __construct() {
        $this->processing_percentage =0.029;
        $this->domain_path='https://salescontrolcenter.com/';
        //$this->domain_path='https://strongcontainers.net/';
        $this->download = 'download/';
        $this->api_path_dev ='https://api.salescontrolcenter.com/';
        //$this->api_path_dev ='http://localhost/CRMAPI/';
    }
}


