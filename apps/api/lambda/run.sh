#!/bin/sh
# Lambda handler for the API function. AWS Lambda Web Adapter (layer) proxies
# invocations to the HTTP server started here on $PORT (8080).
exec node main.js
