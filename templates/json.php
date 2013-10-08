<?php

header('Content-type: application/json');

if ( isset( $__content  ) ) {
	echo ( isset( $_GET['callback'] ) ? $_GET['callback'] . '(' . $__content . ')' : $__content );
} else {
	echo json_encode( array( ) );
}

