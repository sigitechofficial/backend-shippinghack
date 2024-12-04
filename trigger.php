<?php
// Path to your working directory
$workingDir = '/home/theshippinghack/backend.theshippinghack.com';

// Set up the correct environment variables for the shell
$nodeBinPath = '/home/theshippinghack/node/bin'; // Path to node binaries

// Set the PATH environment variable explicitly using putenv()
putenv("PATH=$nodeBinPath:" . getenv('PATH')); // Prepend nodeBinPath to system PATH

// Define the process name for clarity
$processName = 'shipping.js';

// Commands for PM2 management
$pm2StopDeleteCommand = "pm2 stop $processName || true && pm2 delete $processName || true";
$pm2SaveCommand = "pm2 save";

// Command to create the PM2 process and save it again
$pm2CreateCommand = "npm install && pm2 start $processName && pm2 save";

// Combine all commands
$command = "export HOME=/home/theshippinghack && cd $workingDir && $pm2StopDeleteCommand && $pm2SaveCommand && $pm2CreateCommand 2>&1";

// Execute the command
$output = shell_exec($command);

// Output the result
echo nl2br($output);
?>