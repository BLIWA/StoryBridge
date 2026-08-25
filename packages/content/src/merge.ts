/**
 * Shared between apps/website (renders the merged result) and apps/cms
 * (edits the override half). The default site copy lives in ./messages/*.json
 * — the same next-intl catalog the website has always read. What's new is a
 * second, sparse layer: Firestore documents under `siteContent/{namespace}`
 * that hold only the strings someone has actually overridden through the
 * CMS, keyed by locale. deepMerge() layers one onto the other; flatten()
 * and setPath() are what let the CMS edit that sparse layer without needing
 * bespoke UI per page — see apps/cms/src/components/views/site-content.tsx.
 */

export type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
export type JSONObject = { [key: string]: JSONValue };

function isPlainObject(v: unknown): v is JSONObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * `base` with `override`'s values layered on top, recursively. Arrays are
 * replaced wholesale rather than merged element-by-element — an override
 * for a list (e.g. a set of section headings) is meant to replace the
 * whole list, not patch individual entries by position.
 */
export function deepMerge<T extends JSONValue>(base: T, override: JSONValue | undefined): T {
  if (override === undefined) return base;
  if (isPlainObject(base) && isPlainObject(override)) {
    const out: JSONObject = { ...base };
    for (const key of Object.keys(override)) {
      out[key] = deepMerge(base[key] ?? null, override[key]);
    }
    return out as T;
  }
  return override as T;
}

/** Every leaf string in `value`, keyed by its dot/index path — `{a:{b:["x"]}}` → `{"a.b.0": "x"}`. */
export function flatten(value: JSONValue, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (typeof value === "string") {
    out[prefix] = value;
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => Object.assign(out, flatten(v, prefix ? `${prefix}.${i}` : String(i))));
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) Object.assign(out, flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  // Numbers/booleans/null don't occur in this catalog's translatable text — skipped, not editable.
  return out;
}

/** Builds a sparse nested object from flat `{"a.b.0": "x"}`-style entries — the inverse of flatten(). */
export function unflatten(entries: Record<string, string>): JSONValue {
  const root: JSONValue = {};
  for (const [path, value] of Object.entries(entries)) {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- building a JSON tree of unknown shape from string keys
    let node: any = root;
    keys.forEach((key, i) => {
      if (i === keys.length - 1) {
        node[key] = value;
        return;
      }
      const nextIsIndex = /^\d+$/.test(keys[i + 1]);
      if (node[key] === undefined) node[key] = nextIsIndex ? [] : {};
      node = node[key];
    });
  }
  return root;
}
