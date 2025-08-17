import { describe, it, expect } from "vitest";
import createXcodeXcstringsLoader, { _removeLocale } from "./xcode-xcstrings";

describe("loaders/xcode-xcstrings", () => {
  const defaultLocale = "en";
  const mockInput = {
    sourceLanguage: "en",
    strings: {
      "app.title": {
        localizations: {
          en: {
            stringUnit: {
              state: "translated",
              value: "My App",
            },
          },
          es: {
            stringUnit: {
              state: "translated",
              value: "Mi App",
            },
          },
        },
      },
      "items.count": {
        localizations: {
          en: {
            variations: {
              plural: {
                one: {
                  stringUnit: {
                    state: "translated",
                    value: "1 item",
                  },
                },
                other: {
                  stringUnit: {
                    state: "translated",
                    value: "%d items",
                  },
                },
              },
            },
          },
          es: {
            variations: {
              plural: {
                one: {
                  stringUnit: {
                    state: "translated",
                    value: "1 artículo",
                  },
                },
                other: {
                  stringUnit: {
                    state: "translated",
                    value: "%d artículos",
                  },
                },
              },
            },
          },
        },
      },
      "key.no-translate": {
        shouldTranslate: false,
        localizations: {
          en: {
            stringUnit: {
              state: "translated",
              value: "Do not translate",
            },
          },
        },
      },
      "key.source-only": {
        localizations: {},
      },
      "key.missing-localization": {
        localizations: {
          es: {
            stringUnit: {
              state: "translated",
              value: "solo español",
            },
          },
        },
      },
    },
    version: "1.0",
  };

  describe("pull", () => {
    it("should pull simple string translations for a given locale", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const result = await loader.pull("es", mockInput);
      expect(result).toEqual({
        "app.title": "Mi App",
        "items.count": {
          one: "1 artículo",
          other: "%d artículos",
        },
        "key.missing-localization": "solo español",
      });
    });

    it("should pull plural translations for a given locale", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      const result = await loader.pull("en", mockInput);
      expect(result["items.count"]).toEqual({
        one: "1 item",
        other: "%d items",
      });
    });

    it("should use the key as value for the source language if no translation is available", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      const result = await loader.pull("en", mockInput);
      expect(result["key.source-only"]).toBe("key.source-only");
      expect(result["key.missing-localization"]).toBe(
        "key.missing-localization",
      );
    });

    it("should not use key as value if not source language", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const result = await loader.pull("es", mockInput);
      expect(result["key.source-only"]).toBeUndefined();
    });

    it("should skip keys marked with shouldTranslate: false", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      const result = await loader.pull("en", mockInput);
      expect(result["key.no-translate"]).toBeUndefined();
    });

    it("should return an empty object for a locale with no translations", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const result = await loader.pull("fr", mockInput);
      expect(result).toEqual({});
    });
  });

  describe("push", () => {
    it("should push simple string translations", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "app.title": "Mon App",
      };
      const result = await loader.push("fr", payload);
      expect(result).not.toBeNull();
      expect(result!.version).toBe("1.0");
      expect(result!.strings["app.title"].localizations.fr).toEqual({
        stringUnit: {
          state: "translated",
          value: "Mon App",
        },
      });
    });

    it("should push plural translations", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "items.count": {
          one: "1 article",
          other: "%d articles",
        },
      };
      const result = await loader.push("fr", payload);
      expect(result).not.toBeNull();
      expect(result!.strings["items.count"].localizations.fr).toEqual({
        variations: {
          plural: {
            one: {
              stringUnit: {
                state: "translated",
                value: "1 article",
              },
            },
            other: {
              stringUnit: {
                state: "translated",
                value: "%d articles",
              },
            },
          },
        },
      });
    });

    it("should merge translations into existing input", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "app.title": "Mi App (actualizado)",
      };
      const result = await loader.push("es", payload);
      expect(result).not.toBeNull();
      // check new value
      expect(
        result!.strings["app.title"].localizations.es.stringUnit.value,
      ).toBe("Mi App (actualizado)");
      // check existing value is untouched
      expect(
        result!.strings["app.title"].localizations.en.stringUnit.value,
      ).toBe("My App");
    });

    it("should preserve the shouldTranslate: false flag", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "key.no-translate": "Ne pas traduire",
      };
      const result = await loader.push("fr", payload);
      expect(result).not.toBeNull();
      expect(result!.strings["key.no-translate"].shouldTranslate).toBe(false);
      expect(
        result!.strings["key.no-translate"].localizations.fr.stringUnit.value,
      ).toBe("Ne pas traduire");
    });

    it("should handle pushing to a null or undefined originalInput", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, { strings: {} });
      const payload = {
        greeting: "Hello",
      };
      const result = await loader.push("en", payload);
      expect(result).toEqual({
        strings: {
          greeting: {
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "Hello",
                },
              },
            },
          },
        },
      });
    });

    it("should skip null and undefined values in payload", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "app.title": "new title",
        "key.null": null,
        "key.undefined": undefined,
      };
      const result = await loader.push("en", payload);
      expect(result).not.toBeNull();
      expect(Object.keys(result!.strings)).not.toContain("key.null");
      expect(Object.keys(result!.strings)).not.toContain("key.undefined");
      expect(
        result!.strings["app.title"].localizations.en.stringUnit.value,
      ).toBe("new title");
    });

    it("should remove the pushed locale from original input", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);
      const payload = {
        "app.title": "new title",
      };
      const result = await loader.push("en", payload);
      expect(result).not.toBeNull();
      expect(result!.strings["app.title"].localizations.en.stringUnit).toEqual({
        state: "translated",
        value: "new title",
      });
      expect(result!.strings["items.count"].localizations.en).toBeUndefined();
      expect(
        result!.strings["key.no-translate"].localizations.en,
      ).toBeUndefined();
      expect(
        result!.strings["key.source-only"].localizations.en,
      ).toBeUndefined();
      expect(
        result!.strings["key.missing-localization"].localizations.en,
      ).toBeUndefined();
    });
  });

  describe("_removeLocale", () => {
    it("should remove the locale from the input", () => {
      const input = {
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {
              en: { stringUnit: { state: "translated", value: "Hello" } },
              es: { stringUnit: { state: "translated", value: "Hola" } },
            },
          },
          key2: {
            localizations: {
              en: { stringUnit: { state: "translated", value: "World" } },
              fr: { stringUnit: { state: "translated", value: "Monde" } },
            },
          },
          key3: {
            localizations: {
              en: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: { state: "translated", value: "1 item" },
                    },
                  },
                },
              },
              fr: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: { state: "translated", value: "1 article" },
                    },
                  },
                },
              },
            },
          },
        },
      };
      const result = _removeLocale(input, "en");
      expect(result).toEqual({
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {
              es: { stringUnit: { state: "translated", value: "Hola" } },
            },
          },
          key2: {
            localizations: {
              fr: { stringUnit: { state: "translated", value: "Monde" } },
            },
          },
          key3: {
            localizations: {
              fr: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: { state: "translated", value: "1 article" },
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    it("should do nothing if the locale does not exist", () => {
      const input = {
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {
              en: { stringUnit: { state: "translated", value: "Hello" } },
              es: { stringUnit: { state: "translated", value: "Hola" } },
            },
          },
        },
      };
      const result = _removeLocale(input, "fr");
      expect(result).toEqual({
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {
              en: { stringUnit: { state: "translated", value: "Hello" } },
              es: { stringUnit: { state: "translated", value: "Hola" } },
            },
          },
        },
      });
    });

    it("should handle empty strings object", () => {
      const input = {
        sourceLanguage: "en",
        strings: {},
      };
      const result = _removeLocale(input, "en");
      expect(result).toEqual({
        sourceLanguage: "en",
        strings: {},
      });
    });

    it("should handle keys with no localizations", () => {
      const input = {
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {},
          },
        },
      };
      const result = _removeLocale(input, "en");
      expect(result).toEqual({
        sourceLanguage: "en",
        strings: {
          key1: {
            localizations: {},
          },
        },
      });
    });
  });

  describe("pullHints", () => {
    it("should extract comments from xcstrings format", async () => {
      const inputWithComments = {
        sourceLanguage: "en",
        strings: {
          welcome_message: {
            comment: "Greeting shown on the main screen",
            extractionState: "manual",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "Welcome!",
                },
              },
            },
          },
          user_count: {
            comment: "Number of active users",
            extractionState: "manual",
            localizations: {
              en: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: {
                        state: "translated",
                        value: "1 user",
                      },
                    },
                    other: {
                      stringUnit: {
                        state: "translated",
                        value: "%d users",
                      },
                    },
                  },
                },
              },
            },
          },
          no_comment_key: {
            extractionState: "manual",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "No comment",
                },
              },
            },
          },
        },
      };

      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, inputWithComments);

      const hints = await loader.pullHints(inputWithComments);

      expect(hints).toEqual({
        welcome_message: { hint: "Greeting shown on the main screen" },
        user_count: { hint: "Number of active users" },
        "user_count/one": { hint: "Number of active users" },
        "user_count/other": { hint: "Number of active users" },
      });
    });

    it("should handle empty input", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);

      const hints1 = await loader.pullHints({});
      expect(hints1).toEqual({});

      const hints2 = await loader.pullHints(null as any);
      expect(hints2).toEqual({});

      const hints3 = await loader.pullHints(undefined as any);
      expect(hints3).toEqual({});
    });

    it("should handle xcstrings without comments", async () => {
      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, mockInput);

      const hints = await loader.pullHints(mockInput);
      expect(hints).toEqual({});
    });

    it("should handle strings with only some having comments", async () => {
      const inputWithMixedComments = {
        sourceLanguage: "en",
        strings: {
          with_comment: {
            comment: "This has a comment",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "Value with comment",
                },
              },
            },
          },
          without_comment: {
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "Value without comment",
                },
              },
            },
          },
        },
      };

      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, inputWithMixedComments);

      const hints = await loader.pullHints(inputWithMixedComments);

      expect(hints).toEqual({
        with_comment: { hint: "This has a comment" },
      });
    });

    it("should handle multiple locales with same comment", async () => {
      const inputWithMultipleLocales = {
        sourceLanguage: "en",
        strings: {
          multi_locale: {
            comment: "Available in multiple languages",
            localizations: {
              en: {
                stringUnit: {
                  state: "translated",
                  value: "English",
                },
              },
              es: {
                stringUnit: {
                  state: "translated",
                  value: "Español",
                },
              },
              fr: {
                variations: {
                  plural: {
                    one: {
                      stringUnit: {
                        state: "translated",
                        value: "1 français",
                      },
                    },
                    other: {
                      stringUnit: {
                        state: "translated",
                        value: "%d français",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const loader = createXcodeXcstringsLoader(defaultLocale);
      loader.setDefaultLocale(defaultLocale);
      await loader.pull(defaultLocale, inputWithMultipleLocales);

      const hints = await loader.pullHints(inputWithMultipleLocales);

      expect(hints).toEqual({
        multi_locale: { hint: "Available in multiple languages" },
        "multi_locale/one": { hint: "Available in multiple languages" },
        "multi_locale/other": { hint: "Available in multiple languages" },
      });
    });
  });
});
