<?php
session_destroy();
header( 'Location:  http://' . $_SERVER['HTTP_HOST'] . CLIMATE_DIR_WWW . '/' , TRUE );
return 302; exit;
