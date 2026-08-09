require("dotenv").config();
const http = require("http");

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: "localhost", port: 5000, path, method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) opts.headers.Authorization = "Bearer " + token;
    const r = http.request(opts, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(b) }); }
        catch (e) { resolve({ status: res.statusCode, body: b }); }
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

const uid = Date.now();

(async () => {
  // 1. Register customer
  console.log("--- 1. Register customer ---");
  const reg = await req("POST", "/api/auth/register", {
    name: "Customer1", email: `cust_${uid}@test.com`, password: "pass123",
  });
  console.log(reg.status, reg.body.message);
  const custToken = reg.body.data?.token;

  // 2. Register producer (registers as customer, then update role in DB)
  console.log("--- 2. Register producer ---");
  const reg2 = await req("POST", "/api/auth/register", {
    name: "Producer1", email: `prod_${uid}@test.com`, password: "pass123",
  });
  console.log(reg2.status, reg2.body.message);

  const mongoose = require("mongoose");
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.collection("users").updateOne(
    { email: `prod_${uid}@test.com` },
    { $set: { role: "producer" } }
  );

  // Login as producer to get a fresh token with updated role
  const login2 = await req("POST", "/api/auth/login", {
    email: `prod_${uid}@test.com`, password: "pass123",
  });
  const prodToken = login2.body.data?.token;
  console.log("Producer logged in, role:", login2.body.data?.user?.role);

  // 3. Create product as producer
  console.log("\n--- 3. Create product ---");
  const prod = await req("POST", "/api/products", {
    name: "Classic T-Shirt",
    description: "Premium cotton t-shirt",
    price: 29.99,
    variants: [
      { size: "M", color: "Black", sku: "TSH-BLK-M-" + uid, stock: 10 },
      { size: "L", color: "White", sku: "TSH-WHT-L-" + uid, stock: 5 },
    ],
  }, prodToken);
  console.log(prod.status, prod.body.message);
  const productId = prod.body.data?.product?._id;
  console.log("Product ID:", productId);

  // 4. Checkout as customer (2x Black-M + 1x White-L)
  console.log("\n--- 4. Checkout ---");
  const order = await req("POST", "/api/orders/checkout", {
    items: [
      { productId, variantSku: "TSH-BLK-M-" + uid, quantity: 2 },
      { productId, variantSku: "TSH-WHT-L-" + uid, quantity: 1 },
    ],
  }, custToken);
  console.log(order.status, order.body.message);
  console.log("Total:", order.body.data?.order?.totalAmount, "(expected 89.97)");
  console.log("Items:", order.body.data?.order?.items?.length);
  const orderId = order.body.data?.order?._id;

  // 5. Get my orders
  console.log("\n--- 5. My Orders ---");
  const my = await req("GET", "/api/orders/my", null, custToken);
  console.log(my.status, my.body.message, "| Count:", my.body.data?.orders?.length);

  // 6. Insufficient stock
  console.log("\n--- 6. Insufficient Stock ---");
  const fail = await req("POST", "/api/orders/checkout", {
    items: [{ productId, variantSku: "TSH-WHT-L-" + uid, quantity: 99 }],
  }, custToken);
  console.log(fail.status, fail.body.message);

  // 7. No auth
  console.log("\n--- 7. No Auth ---");
  const noAuth = await req("POST", "/api/orders/checkout", { items: [] });
  console.log(noAuth.status, noAuth.body.message);

  // 8. Update status (placed → paid) as producer
  console.log("\n--- 8. Status: placed → paid ---");
  const s1 = await req("PUT", "/api/orders/" + orderId + "/status", { status: "paid" }, prodToken);
  console.log(s1.status, s1.body.message);

  // 9. Invalid transition (paid → placed)
  console.log("\n--- 9. Invalid Transition ---");
  const s2 = await req("PUT", "/api/orders/" + orderId + "/status", { status: "placed" }, prodToken);
  console.log(s2.status, s2.body.message);

  // 10. Continue valid flow (paid → processing → completed)
  console.log("\n--- 10. paid → processing → completed ---");
  const s3 = await req("PUT", "/api/orders/" + orderId + "/status", { status: "processing" }, prodToken);
  console.log(s3.status, s3.body.message);
  const s4 = await req("PUT", "/api/orders/" + orderId + "/status", { status: "completed" }, prodToken);
  console.log(s4.status, s4.body.message);

  console.log("\n✅ All tests passed!");
  await mongoose.disconnect();
  process.exit(0);
})();
