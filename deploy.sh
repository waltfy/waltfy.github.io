#!/bin/bash

echo "Deploying waltercarvalho.com at $(date)" >> ./deployment_log.txt
git pull
npm install
grunt
forever start app.js
