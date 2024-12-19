#!/bin/bash

id=$1

if [ -z "$id" ]; then
  echo "id is not set. Exiting..."
  exit 1
fi

aws --endpoint=http://localhost:4566 s3 cp product-image.png s3://product-images/${id}/product.png
