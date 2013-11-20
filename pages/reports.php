<?php

if ( $_SESSION['group'] == 'Teachers' ) {
	include 'reports/teacher.php';
} elseif ( $_SESSION['group'] == 'Users' ) {
	include 'reports/user.php';
}
