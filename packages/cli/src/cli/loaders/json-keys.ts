import { ILoader } from "./_types";
import { createLoader } from "./_utils";

export default function createJsonKeysLoader(): ILoader<
  Record<string, any>,
  Record<string, string>
> {
  return createLoader({
    pull: async (locale, input, initCtx, originalLocale) => {
      const result: Record<string, string> = {};
      
      function extractKeysRecursive(obj: any, prefix: string = ""): void {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}/${key}` : key;
            
            if (key === originalLocale && typeof value === "string") {
              result[fullKey] = value;
            } else if (typeof value === "object" && value !== null) {
              extractKeysRecursive(value, fullKey);
            }
          }
        }
      }
      
      extractKeysRecursive(input);
      return result;
    },
    
    push: async (locale, data, originalInput, originalLocale) => {
      if (!originalInput) {
        return {};
      }
      
      const result = JSON.parse(JSON.stringify(originalInput));
      
      function setNestedValue(obj: any, path: string, value: string): void {
        const parts = path.split("/");
        let current = obj;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!(part in current) || typeof current[part] !== "object") {
            current[part] = {};
          }
          current = current[part];
        }
        
        const lastPart = parts[parts.length - 1];
        if (lastPart === originalLocale) {
          if (typeof current === "object" && current !== null) {
            current[locale] = value;
          }
        } else {
          if (typeof current === "object" && current !== null) {
            if (!(originalLocale in current)) {
              current[originalLocale] = {};
            }
            if (typeof current[originalLocale] === "object") {
              current[originalLocale][locale] = value;
            }
          }
        }
      }
      
      for (const [key, value] of Object.entries(data)) {
        setNestedValue(result, key, value);
      }
      
      return result;
    },
  });
}
