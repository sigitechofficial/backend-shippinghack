<?php
// Path to your working directory
$workingDir = '/home/theshippinghack/stage.theshippinghack.com';

// Set HOME environment variable and run commands
$output = shell_exec("export HOME=/home/theshippinghack && cd $workingDir && npm install && ~/node/bin/pm2 start shippinghack.js 2>&1");

// Output the result
echo nl2br($output);
?>