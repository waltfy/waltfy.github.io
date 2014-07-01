#!/bin/bash

echo "Deploying waltercarvalho.com at $(date)" >> ~/deployment_log.txt
git pull
grunt
forever restartall