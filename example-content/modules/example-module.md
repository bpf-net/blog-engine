---
title: example-module
description: A module card. The pill colour comes from statusTone; the link defaults to /modules/<id>/.
platform: Framework 2.x · PHP 8.4
status: in progress
statusTone: blue
order: 1
tags: [Framework, SEO, open source]
repo: https://github.com/
features:
  - title: Feature one
    text: What it does, in one sentence.
  - title: Feature without text
compatibility:
  - platform: Framework 2
    versions: 2.4 – 2.5
    php: 8.2 – 8.4
    status: tested
    statusTone: accent
  - platform: Framework 1
roadmap:
  - stage: done
    text: First release
  - stage: now
    text: Second milestone
  - stage: later
    text: Ideas — issues on GitHub
    href: https://github.com/
install: composer require example/example-module
---

The body of `modules/example-module.md` is shown on the module page at `/modules/example-module/`.
