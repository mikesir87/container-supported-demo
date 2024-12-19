import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { ProductRow } from "./ProductRow";

function App() {
  const [lastRequest, setLastRequest] = useState(null);
  const [catalog, setCatalog] = useState(null);

  const fetchCatalog = useCallback(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data) => {
        setCatalog(data);
        setLastRequest({
          method: "GET",
          url: "/api/products",
          status: 200,
          response: data,
        });
      });
  }, []);

  const createProduct = useCallback(() => {
    const body = {
      name: "New Product",
      price: 100,
      upc: 100000000000 + catalog.length + 1,
    };

    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(fetchCatalog);
  }, [catalog, fetchCatalog]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <>
      <h1>Demo catalog client</h1>

      <p>
        <button onClick={fetchCatalog}>Refresh catalog</button>
        &nbsp;
        <button onClick={createProduct}>Create product</button>
      </p>

      {catalog ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>UPC</th>
              <th>Inventory</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onChange={() => fetchCatalog()}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading catalog...</p>
      )}
    </>
  );
}

export default App;
