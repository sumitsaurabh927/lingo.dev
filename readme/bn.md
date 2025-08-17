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
    ⚡ Lingo.dev - ওপেন-সোর্স, এআই-পাওয়ার্ড i18n টুলকিট যা এলএলএম ব্যবহার করে
    তাৎক্ষণিক লোকালাইজেশন সম্ভব করে।
  </strong>
</p>

<br />

<p align="center">
  <a href="https://lingo.dev/compiler">Lingo.dev কম্পাইলার</a> •
  <a href="https://lingo.dev/cli">Lingo.dev CLI</a> •
  <a href="https://lingo.dev/ci">Lingo.dev CI/CD</a> •
  <a href="https://lingo.dev/sdk">Lingo.dev SDK</a>
</p>

<p align="center">
  <a href="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml">
    <img
      src="https://github.com/lingodotdev/lingo.dev/actions/workflows/release.yml/badge.svg"
      alt="রিলিজ"
    />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/blob/main/LICENSE.md">
    <img
      src="https://img.shields.io/github/license/lingodotdev/lingo.dev"
      alt="লাইসেন্স"
    />
  </a>
  <a href="https://github.com/lingodotdev/lingo.dev/commits/main">
    <img
      src="https://img.shields.io/github/last-commit/lingodotdev/lingo.dev"
      alt="সর্বশেষ কমিট"
    />
  </a>
</p>

---

## কম্পাইলারের সাথে পরিচিত হোন 🆕

**Lingo.dev কম্পাইলার** একটি ফ্রি, ওপেন-সোর্স কম্পাইলার মিডলওয়্যার, যা বিদ্যমান রিঅ্যাক্ট কম্পোনেন্টগুলিতে কোনো পরিবর্তন না করেই বিল্ড টাইমে যেকোনো রিঅ্যাক্ট অ্যাপকে বহুভাষিক করার জন্য ডিজাইন করা হয়েছে।

---CODE-PLACEHOLDER-f159f7253d409892d00e70ee045902a5---

`next build` চালান এবং স্প্যানিশ এবং ফরাসি বান্ডলগুলি দেখুন ✨

সম্পূর্ণ গাইডের জন্য [ডকুমেন্টেশন পড়ুন →](https://lingo.dev/compiler)।

---

### এই রিপোজিটরিতে কী আছে?

| টুল           | সংক্ষিপ্ত বিবরণ                                                                            | ডকুমেন্টেশন                             |
| ------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
| **কম্পাইলার** | বিল্ড-টাইম রিঅ্যাক্ট লোকালাইজেশন                                                           | [/compiler](https://lingo.dev/compiler) |
| **CLI**       | ওয়েব এবং মোবাইল অ্যাপ, JSON, YAML, মার্কডাউন, + আরও অনেক কিছুর জন্য এক-কমান্ড লোকালাইজেশন | [/cli](https://lingo.dev/cli)           |
| **CI/CD**     | প্রতিটি পুশে অটো-কমিট অনুবাদ + প্রয়োজনে পুল রিকোয়েস্ট তৈরি করুন                          | [/ci](https://lingo.dev/ci)             |
| **SDK**       | ব্যবহারকারী-তৈরি কন্টেন্টের জন্য রিয়েলটাইম অনুবাদ                                         | [/sdk](https://lingo.dev/sdk)           |

নিচে প্রতিটির সংক্ষিপ্ত বিবরণ দেওয়া হল 👇

---

### ⚡️ Lingo.dev CLI

আপনার টার্মিনাল থেকে সরাসরি কোড এবং কন্টেন্ট অনুবাদ করুন।

---CODE-PLACEHOLDER-a4836309dda7477e1ba399e340828247---

এটি প্রতিটি স্ট্রিং-এর ফিঙ্গারপ্রিন্ট তৈরি করে, ফলাফল ক্যাশে রাখে, এবং শুধুমাত্র পরিবর্তিত অংশগুলি পুনরায় অনুবাদ করে।

[ডকুমেন্টেশন পড়ুন →](https://lingo.dev/cli)

---

### 🔄 Lingo.dev CI/CD

স্বয়ংক্রিয়ভাবে নিখুঁত অনুবাদ প্রকাশ করুন।

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

ম্যানুয়াল পদক্ষেপ ছাড়াই আপনার রিপোজিটরি সবুজ এবং আপনার প্রোডাক্ট বহুভাষিক রাখে।

[ডকুমেন্টেশন পড়ুন →](https://lingo.dev/ci)

---

### 🧩 Lingo.dev SDK

ডাইনামিক কন্টেন্টের জন্য তাৎক্ষণিক প্রতি-অনুরোধ অনুবাদ।

---CODE-PLACEHOLDER-c50e1e589a70e31dd2dde95be8da6ddf---

চ্যাট, ব্যবহারকারী মন্তব্য এবং অন্যান্য রিয়েল-টাইম ফ্লো-এর জন্য নিখুঁত।

[ডকুমেন্টেশন পড়ুন →](https://lingo.dev/sdk)

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

## 🤝 কমিউনিটি

আমরা কমিউনিটি-চালিত এবং অবদান পছন্দ করি!

- একটি আইডিয়া আছে? [একটি ইস্যু খুলুন](https://github.com/lingodotdev/lingo.dev/issues)
- কিছু ঠিক করতে চান? [একটি PR পাঠান](https://github.com/lingodotdev/lingo.dev/pulls)
- সাহায্য দরকার? [আমাদের Discord-এ যোগ দিন](https://lingo.dev/go/discord)

## ⭐ স্টার হিস্টরি

আমরা যা করছি তা যদি আপনার পছন্দ হয়, আমাদের একটি ⭐ দিন এবং ৩,০০০ স্টার পৌঁছাতে সাহায্য করুন! 🌟

[

![স্টার হিস্টরি চার্ট](https://api.star-history.com/svg?repos=lingodotdev/lingo.dev&type=Date)

](https://www.star-history.com/#lingodotdev/lingo.dev&Date)

## 🌐 অন্যান্য ভাষায় রিডমি

[English](https://github.com/lingodotdev/lingo.dev) • [中文](/readme/zh-Hans.md) • [日本語](/readme/ja.md) • [한국어](/readme/ko.md) • [Español](/readme/es.md) • [Français](/readme/fr.md) • [Русский](/readme/ru.md) • [Deutsch](/readme/de.md) • [Italiano](/readme/it.md) • [العربية](/readme/ar.md) • [हिन्दी](/readme/hi.md) • [বাংলা](/readme/bn.md) • [فارسی](/readme/fa.md)

আপনার ভাষা দেখতে পাচ্ছেন না? [`i18n.json`](./i18n.json)-এ এটি যোগ করুন এবং একটি PR খুলুন!

## 🌐 অন্যান্য ভাষায় রিডমি

[English](https://github.com/lingodotdev/lingo.dev) • [中文](/readme/zh-Hans.md) • [日本語](/readme/ja.md) • [한국어](/readme/ko.md) • [Español](/readme/es.md) • [Français](/readme/fr.md) • [Русский](/readme/ru.md) • [Українська](/readme/uk-UA.md) • [Deutsch](/readme/de.md) • [Italiano](/readme/it.md) • [العربية](/readme/ar.md) • [עברית](/readme/he.md) • [हिन्दी](/readme/hi.md) • [বাংলা](/readme/bn.md) • [فارسی](/readme/fa.md)

আপনার ভাষা দেখতে পাচ্ছেন না? এটি [`i18n.json`](./i18n.json) এ যোগ করুন এবং একটি PR খুলুন!
