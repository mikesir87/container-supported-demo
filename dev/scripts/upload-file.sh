#!/bin/bash

id=$1

if [ -z "$id" ]; then
  echo "id is not set. Exiting..."
  exit 1
fi

curl -F "file=@docker-logo-blue.png" "http://localhost:3000/api/products/${id}/image"