import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { splitCleanerPrice } from "../src/lib/splitCleanerPrice.js";

describe("splitCleanerPrice", () => {
  it("splits evenly across cleaners", () => {
    const ids = ["a", "b", "c", "d"];
    const result = splitCleanerPrice(100, ids);
    assert.deepEqual(
      result,
      ids.map((id) => ({ id, amount: 25 }))
    );
  });

  it("applies remainder to the first cleaner deterministically", () => {
    const ids = ["a", "b", "c"];
    const result = splitCleanerPrice(100, ids);
    assert.deepEqual(result, [
      { id: "a", amount: 33.34 },
      { id: "b", amount: 33.33 },
      { id: "c", amount: 33.33 },
    ]);
  });

  it("returns zero amounts when no cleaners or zero total", () => {
    assert.deepEqual(splitCleanerPrice(0, ["x"]), [{ id: "x", amount: 0 }]);
    assert.deepEqual(splitCleanerPrice(100, []), []);
  });

  it("handles decimal totals with 2dp precision", () => {
    const result = splitCleanerPrice(50.55, ["a", "b"]);
    assert.deepEqual(result, [
      { id: "a", amount: 25.28 },
      { id: "b", amount: 25.27 },
    ]);
  });
});
