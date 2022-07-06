import { NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

export function buildQueryParser<
  V,
  T extends Record<
    string,
    {
      default: V;
      serialize?: (t: V) => string;
      deserialize?: (s: string) => V;
    }
  >
>(opts: { [K in keyof T]: T[K] }) {
  return {
    store: (router: NextRouter, items: { [K in keyof T]: T[K]["default"] }) => {
      const parts: string[] = [];

      for (const key in opts) {
        if (key in items) {
          const value = items[key];
          if (value !== opts[key].default) {
            const serialized = (opts[key].serialize || JSON.stringify)(value);
            parts.push(`${key}=${serialized}`);
          }
        }
      }

      if (parts.length) {
        router
          .push(`${window.location.pathname}?${parts.join("&")}`, undefined, {
            scroll: false,
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        router
          .push(window.location.pathname, undefined, {
            scroll: false,
          })
          .catch((error) => {
            console.error(error);
          });
      }
    },
    parse: (query: ParsedUrlQuery) => {
      const built: Record<string, T[keyof typeof opts]["default"]> = {};

      for (const key in opts) {
        const obj = opts[key];

        const fromQuery = key in query ? String(query[key]) : null;
        if (!fromQuery) {
          built[key] = obj.default;
        } else {
          built[key] = (obj.deserialize || JSON.parse)(fromQuery);
        }
      }

      return built as {
        [K in keyof T]: T[K]["default"];
      };
    },
  };
}
