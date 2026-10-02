// node --test scripts/fix-cloudinary-bloqueadas.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { publicIdDeUrl, firmaCloudinary, parchear, RAMAS } from "./fix-cloudinary-bloqueadas.mjs";

test("public_id, tipo y cloud desde la secure_url de una subida", () => {
  assert.deepEqual(publicIdDeUrl("https://res.cloudinary.com/dvqtepklc/image/upload/v1759372345/abc123xyz.jpg"),
    { cloud: "dvqtepklc", tipo: "image", publicId: "abc123xyz" });
  assert.deepEqual(publicIdDeUrl("https://res.cloudinary.com/dvqtepklc/video/upload/v17/postly/reel_9.mp4"),
    { cloud: "dvqtepklc", tipo: "video", publicId: "postly/reel_9" });
});

test("sin versión en la URL, y public_id con puntos", () => {
  assert.deepEqual(publicIdDeUrl("https://res.cloudinary.com/c1/image/upload/carpeta/foto.final.png"),
    { cloud: "c1", tipo: "image", publicId: "carpeta/foto.final" });
});

test("lo que no es una URL de Cloudinary no se toca", () => {
  for (const u of ["", null, undefined, "https://example.com/a.jpg", "https://res.cloudinary.com/c1/image/fetch/x.jpg"])
    assert.equal(publicIdDeUrl(u), null, String(u));
});

test("firma según la especificación de Cloudinary: parámetros ordenados + secret, SHA-1", () => {
  const esperado = createHash("sha1").update("public_id=abc&timestamp=1700000000" + "SECRETO").digest("hex");
  assert.equal(firmaCloudinary({ timestamp: 1700000000, public_id: "abc" }, "SECRETO"), esperado);
  assert.notEqual(firmaCloudinary({ timestamp: 1700000000, public_id: "abd" }, "SECRETO"), esperado);
});

// ── el parche sobre el workflow
const wfRepo = () => JSON.parse(readFileSync(new URL("../workflows/Postly - Entrega Final Sprint 1 v2.json", import.meta.url), "utf-8"));

test("cuelga un nodo de borrado en la MISMA salida que cada aviso de bloqueo visual, y es idempotente", () => {
  const wf = wfRepo();
  parchear(wf);
  assert.equal(parchear(wf), 0);
  for (const { si, aviso, nodo } of RAMAS) {
    const salidas = wf.connections[si].main;
    const rama = salidas.find((b) => (b || []).some((c) => c.node === aviso));
    assert.ok(rama.some((c) => c.node === nodo), `${nodo} no cuelga de la salida de ${aviso}`);
    const n = wf.nodes.find((x) => x.name === nodo);
    assert.equal(n.onError, "continueRegularOutput", `${nodo}: un error de Cloudinary no debe cortar el aviso`);
  }
});

test("el bloqueo por TEXTO no borra nada (la usuaria edita y reintenta con las mismas imágenes)", () => {
  const wf = wfRepo(); parchear(wf);
  const ramas = Object.fromEntries(RAMAS.map((r) => [r.aviso, r]));
  for (const avisoTexto of ["HU5: Pub bloqueado", "Repost: imagen con precio"]) assert.equal(ramas[avisoTexto], undefined);
});

test("el código de cada nodo compila y borra cada URL de su rama con una firma válida", async () => {
  const wf = wfRepo(); parchear(wf);
  const AsyncFunction = (async () => {}).constructor;
  const datos = {
    "HTTP Request": [{ secure_url: "https://res.cloudinary.com/dvqtepklc/image/upload/v1/img1.jpg" }],
    "HU5: Juntar URLs": [{ urlList: "https://res.cloudinary.com/dvqtepklc/image/upload/v1/c1.jpg,https://res.cloudinary.com/dvqtepklc/image/upload/v1/c2.jpg" }],
    "Video: procesar": [{ videoUrl: "https://res.cloudinary.com/dvqtepklc/video/upload/v1/vid.mp4",
      frameUrls: "https://res.cloudinary.com/dvqtepklc/image/upload/v1/f1.jpg,https://res.cloudinary.com/dvqtepklc/image/upload/v1/f2.jpg" }],
  };
  const esperados = { "HU8: borrar de Cloudinary": ["image/img1"], "HU5: borrar de Cloudinary": ["image/c1", "image/c2"],
                      "Video: borrar de Cloudinary": ["video/vid", "image/f1", "image/f2"] };
  for (const { nodo } of RAMAS) {
    const codigo = wf.nodes.find((x) => x.name === nodo).parameters.jsCode;
    const pedidos = [];
    const $ = (n) => { if (!datos[n]) throw new Error(`nodo ${n} no ejecutado`); return { all: () => datos[n].map((json) => ({ json })), first: () => ({ json: datos[n][0] }) }; };
    const helpers = { httpRequest: async (o) => { pedidos.push(o); return { result: "ok" }; } };
    const salida = await new AsyncFunction("$", "$env", "helpers", "require", codigo)(
      $, { CLOUDINARY_API_KEY: "K", CLOUDINARY_API_SECRET: "S" }, helpers, (m) => (m === "crypto" ? { createHash } : null));
    assert.deepEqual(pedidos.map((p) => p.url.split("/").slice(-2, -1)[0] + "/" + p.body.public_id), esperados[nodo], nodo);
    for (const p of pedidos) {
      assert.equal(p.body.api_key, "K");
      assert.equal(p.body.signature, firmaCloudinary({ public_id: p.body.public_id, timestamp: p.body.timestamp }, "S"));
    }
    assert.equal(salida[0].json.borradas.length, esperados[nodo].length);
  }
});
