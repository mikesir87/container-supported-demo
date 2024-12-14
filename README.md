# Catalog Service - Node

This repo is a demo project that demonstrates all of Docker's services in a single project. Specifically, it includes the following:

- A containerized development environment (in a few varieties of setup)
- Integration testing with Testcontainers
- Building in GitHub Actions with Docker Build Cloud

This project is also setup to be used for various demos. Learn more about the demo setups by using [the README in the ./demo directory](./demo/README.md).

## Application architecture

This sample app provides an API that utilizes the following setup:

- Data is stored in a PostgreSQL database
- Product images are stored in a AWS S3 bucket
- Inventory data comes from an external inventory service
- Updates to products are published to a Kafka cluster

![Application architecture](./architecture.png)

During development, containers provide the following services:

- PostgreSQL and Kafka runs directly in a container
- LocalStack is used to run S3 locally
- WireMock is used to mock the external inventory service
- pgAdmin and kafbat are added to visualize the PostgreSQL database and Kafka cluster

![Dev environment architecture](./dev-environment-architecture.png)

## Trying it out

This project is configured to run with the app running in a container or natively (using Node installed on the machine).

### Developing with everything in containers

The `compose.yaml` file defines an `app` service that will run the application in the container.

The code is currently mounted into the app container, theoretically allowing for hot reloading. However, there is a limitation for WSL environments where the filesystem event isn't propagated, preventing nodemon from seeing the file change event.

1. Start the app using Compose.

   ```console
   docker compose up -d
   ```

### Developing with the app running natively

Alternatively, you can start the application by running the app natively on your machine and connecting to the app dependencies that are running in containers.

1. Ensure you have Node and yarn installed on your machine.

2. Start all of the application dependencies

   ```console
   docker compose -f compose.native.yaml up
   ```

3. Install the app dependencies and start the main app with the following command:

   ```console
   yarn install
   yarn dev
   ```

#### Debugging the application

Once the app is running, you can start a debug session by using the **Debug** task in the "Run and Debug" panel. This currently only works when the app is running natively on the machine.

### Running tests

This project contains a few sample tests to demonstrate Testcontainer integration. To run them, follow these steps (assuming you're using Visual Studio Code):

1. Download and install the [Jest extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest#user-interface).

2. Open the "Testing" tab in the left-hand navigation (looks like a flask).

3. Press play for the test you'd like to run.

The \*.integration.spec.js tests will use Testcontainers to launch Kafka, Postgres, and LocalStack.

#### Running tests via the command line

Or you can run the tests using the command line:

```console
# Run only the unit tests
$ yarn test

# Run only the integration tests
$ yarn integration-test
```

## Additional utilities

Once the development environment is up and running, the following URLs can be leveraged:

- [http://localhost:5050](http://localhost:5050) - [pgAdmin](https://www.pgadmin.org/) to visualize the database. Login using the password `postgres` (configured in the Compose file)
- [http://localhost:8080](http://localhost:8080) - [kafbat](https://github.com/kafbat/kafka-ui) to visualize the Kafka cluster

The `compose.traefik.*` variants make the previous accessible using hostnames, instead of hard-to-remember ports.

- [http://db.localhost](http://db.localhost) - [pgAdmin](https://www.pgadmin.org/) to visualize the database
- [http://kafka.localhost](http://kafka.localhost) - [kafbat](https://github.com/kafbat/kafka-ui) to visualize the Kafka cluster

### Helper scripts

In the `dev/scripts` directory, there are a few scripts that can be used to interact with the REST API of the application.

#### Create the product

```
cd /dev/scripts
chmod +x create-product.sh
./create-product.sh 1
{"name":"Test product","upc":"100000000001","price":150,"id":1}%
```


#### Get the product

If you run the script, the provided output seems to be a combination of the cURL command and the response from the catalog service.
Let's modify it so as to just get the result.

```
#!/bin/bash

id=$1

if [ -z "$id" ]; then
  echo "id is not set. Exiting..."
  exit 1
fi

response=$(curl -s "http://localhost:3000/api/products/${id}")

if echo "$response" | jq -e '.inventory.error' &>/dev/null; then
  error_message=$(echo "$response" | jq -r '.inventory.message')
  echo "Error: $error_message"
else
  echo "Product details:"
  echo "$response" | jq -r '. | del(.inventory)'
fi
```

```
./create-product.sh 2
{"name":"Test product","upc":"100000000002","price":150,"id":2}%
ajeetsraina  scripts  ➜ ( main)  ♥ 20:39  ./get-product.sh 2
Product details:
{
  "id": 2,
  "name": "Test product",
  "upc": "100000000002",
  "price": "150.00"
}
```

## Upload the image

```
./upload-file.sh 2
{"action":"image_uploaded","product_id":"2","filename":"2.png"}%
```
