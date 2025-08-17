<p align="center">
  <a href="https://lingo.dev">
    <img
      src="https://raw.githubusercontent.com/lingodotdev/lingo.dev/main/content/banner.compiler.png"
      width="100%"
      alt="Lingo.dev"
    />
  </a>
</p>

<p align="center">
  <strong>
    ⚡ Lingo.dev - ओपन-सोर्स, AI-संचालित i18n टूलकिट LLMs के साथ त्वरित
    स्थानीयकरण के लिए।
  </strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev/compiler">Lingo.dev कंपाइलर</a> •
  <a href="https://lingo.dev/cli">Lingo.dev CLI</a> •
  <a href="https://lingo.dev/ci">Lingo.dev CI/CD</a> •
  <a href="https://lingo.dev/sdk">Lingo.dev SDK</a>
</p>

<p align="center">
  <a href="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml">
    <img
      src="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml/badge.svg"
      alt="रिलीज़"
    />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/blob/main/LICENSE.md">
    <img
      src="https://img.shields.io/github/license/lingodotdev/lingo.dev"
      alt="लाइसेंस"
    />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/commits/main">
    <img
      src="https://img.shields.io/github/last-commit/lingodotdev/lingo.dev"
      alt="अंतिम कमिट"
    />
  </a>
</p>

---

## कंपाइलर से मिलें 🆕

**Lingo.dev कंपाइलर** एक मुफ्त, ओपन-सोर्स कंपाइलर मिडलवेयर है, जो मौजूदा React कंपोनेंट्स में कोई परिवर्तन किए बिना बिल्ड टाइम पर किसी भी React ऐप को बहुभाषी बनाने के लिए डिज़ाइन किया गया है।

एक बार इंस्टॉल करें:

```bash
npm install lingo.dev
```

अपने बिल्ड कॉन्फिग में सक्षम करें:

```js
import lingoCompiler from "lingo.dev/compiler";

const existingNextConfig = {};

export default lingoCompiler.next({
  sourceLocale: "en",
  targetLocales: ["es", "fr"],
})(existingNextConfig);
```

`next build` चलाएँ और स्पेनिश और फ्रेंच बंडल को प्रकट होते देखें ✨

[दस्तावेज़ पढ़ें →](https://lingo.dev/compiler) पूर्ण गाइड के लिए, और [हमारे Discord में शामिल हों](https://lingo.dev/go/discord) अपने सेटअप में सहायता प्राप्त करने के लिए।

---

### इस रेपो में क्या है?

| टूल         | संक्षिप्त विवरण                                                              | दस्तावेज़                               |
| ----------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| **कंपाइलर** | बिल्ड-टाइम React स्थानीयकरण                                                  | [/compiler](https://lingo.dev/compiler) |
| **CLI**     | वेब और मोबाइल ऐप्स, JSON, YAML, मार्कडाउन, + अधिक के लिए एक-कमांड स्थानीयकरण | [/cli](https://lingo.dev/cli)           |
| **CI/CD**   | हर पुश पर अनुवादों को ऑटो-कमिट करें + आवश्यकतानुसार पुल रिक्वेस्ट बनाएं      | [/ci](https://lingo.dev/ci)             |
| **SDK**     | उपयोगकर्ता-जनित सामग्री के लिए रीयलटाइम अनुवाद                               | [/sdk](https://lingo.dev/sdk)           |

नीचे प्रत्येक के लिए त्वरित जानकारी दी गई है 👇

---

### ⚡️ Lingo.dev CLI

अपने टर्मिनल से सीधे कोड और सामग्री का अनुवाद करें।

```bash
npx lingo.dev@latest run
```

यह प्रत्येक स्ट्रिंग को फिंगरप्रिंट करता है, परिणामों को कैश करता है, और केवल उन्हीं चीजों का पुनः अनुवाद करता है जो बदली गई हैं।

[दस्तावेज़ का अनुसरण करें →](https://lingo.dev/cli) इसे सेट अप करने का तरीका जानने के लिए।

---

### 🔄 Lingo.dev CI/CD

स्वचालित रूप से परिपूर्ण अनुवाद शिप करें।

```yaml
# .github/workflows/i18n.yml
name: Lingo.dev i18n
on: [push]

jobs:
  i18n:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: lingodotdev/lingo.dev@main
        with:
          api-key: ${{ secrets.LINGODOTDEV_API_KEY }}
```

आपके रेपो को हरा और आपके उत्पाद को मैनुअल चरणों के बिना बहुभाषी रखता है।

[दस्तावेज़ पढ़ें →](https://lingo.dev/ci)

---

### 🧩 Lingo.dev SDK

गतिशील सामग्री के लिए तत्काल प्रति-अनुरोध अनुवाद।

```ts
import { LingoDotDevEngine } from "lingo.dev/sdk";

const lingoDotDev = new LingoDotDevEngine({
  apiKey: "your-api-key-here",
});

const content = {
  greeting: "Hello",
  farewell: "Goodbye",
  message: "Welcome to our platform",
};

const translated = await lingoDotDev.localizeObject(content, {
  sourceLocale: "en",
  targetLocale: "es",
});
// Returns: { greeting: "Hola", farewell: "Adiós", message: "Bienvenido a nuestra plataforma" }
```

चैट, उपयोगकर्ता टिप्पणियों और अन्य रीयल-टाइम फ़्लो के लिए उत्तम।

[दस्तावेज़ पढ़ें →](https://lingo.dev/sdk)

---

## 🤝 समुदाय

हम समुदाय-संचालित हैं और योगदान पसंद करते हैं!

- कोई विचार है? [एक इश्यू खोलें](https://github.com/lingodotdev/lingo.dev/issues)
- कुछ ठीक करना चाहते हैं? [एक PR भेजें](https://github.com/lingodotdev/lingo.dev/pulls)
- सहायता चाहिए? [हमारे Discord में शामिल हों](https://lingo.dev/go/discord)

## ⭐ स्टार इतिहास

यदि आपको हमारा काम पसंद है, तो हमें एक ⭐ दें और 3,000 स्टार तक पहुंचने में हमारी मदद करें! 🌟

[

![स्टार इतिहास चार्ट](https://api.star-history.com/svg?repos=lingodotdev/lingo.dev&type=Date)

](https://www.star-history.com/#lingodotdev/lingo.dev&Date)

## 🌐 अन्य भाषाओं में रीडमी

[English](https://github.com/lingodotdev/lingo.dev) • [中文](/readme/zh-Hans.md) • [日本語](/readme/ja.md) • [한국어](/readme/ko.md) • [Español](/readme/es.md) • [Français](/readme/fr.md) • [Русский](/readme/ru.md) • [Українська](/readme/uk-UA.md) • [Deutsch](/readme/de.md) • [Italiano](/readme/it.md) • [العربية](/readme/ar.md) • [עברית](/readme/he.md) • [हिन्दी](/readme/hi.md) • [বাংলা](/readme/bn.md) • [فارسی](/readme/fa.md)

अपनी भाषा नहीं देख रहे हैं? इसे [`i18n.json`](./i18n.json) में जोड़ें और एक PR खोलें!
