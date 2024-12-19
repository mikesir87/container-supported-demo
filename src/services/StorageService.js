const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { publishEvent } = require("./PublisherService");

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.PRODUCT_IMAGE_BUCKET_NAME || "product-images";

async function getFile(id) {
  const name = "product.png";

  const result = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${id}/${name}`,
    }),
  );

  return result.Body;
}

async function uploadFile(id, buffer) {
  const name = "product.png";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${id}/${name}`,
      Body: buffer,
    }),
  );

  const details = {
    action: "image_uploaded",
    product_id: id,
    filename: name,
  };

  await publishEvent("products", details);

  return details;
}

module.exports = {
  uploadFile,
  getFile,
};
