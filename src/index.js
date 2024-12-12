require("dotenv").config();
const os = require("os");
const fs = require("fs");
const express = require("express");
const ProductService = require("./services/ProductService");
const multer = require("multer");

const app = express();
app.use(express.json());
const upload = multer({ dest: os.tmpdir() });

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.post("/api/products", async (req, res) => {
  try {
    const newProduct = await ProductService.createProduct(req.body);

    res
      .status(201)
      .header("Location", `/api/products/${newProduct.id}`)
      .json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const product = await ProductService.getProductById(req.params.id);

  if (!product) {
    res.status(404).send();
    return;
  }

  res.json(product);
});

app.post("/api/products/:id/image", upload.single("file"), async (req, res) => {
  const filename = req.file.originalname;
  const extn = filename.split(".").pop();
  const imageName = `${req.params.id}.${extn}`;

  const product = await ProductService.uploadProductImage(
    req.params.id,
    imageName,
    fs.readFileSync(req.file.path),
  );

  res.json(product);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
