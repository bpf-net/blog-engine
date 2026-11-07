---
title: Welcome to the blog
description: The first post, with an image next to the file and a code block.
pubDate: 2026-11-01
tags: [astro, images]
module: example-module
tldr: A folder post keeps `index.md` and its images together; link them relatively, e.g. `./obrazek.png`.
---

## Folder posts

This is a folder post: an `index.md` file and an image in the same directory.

![Test gradient](./obrazek.png)

## Code

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## File names

With a file name above the block:

```php title="app/etc/config-local.php"
<?php
// kept out of the repository
return [
    'modules' => ['Magento_TwoFactorAuth' => 0],
];
```
