#!/bin/bash

id=$1

if [ -z "$id" ]; then
  echo "id is not set. Exiting..."
  exit 1
fi

if [ ${#id} -gt 1 ]; then
  echo "id length is greater than 1. Exiting..."
  exit 1
fi

curl -X POST --data "{\"name\":\"Test product\",\"upc\":\"10000000000${id}\",\"price\":150}" -H "Content-type: application/json" http://localhost:3000/api/products