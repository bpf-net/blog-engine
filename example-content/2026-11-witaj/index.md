---
title: Welcome to the blog
description: The first post, with an image next to the file and a code block.
pubDate: 2026-11-01
tags: [astro, images]
tldr: A folder post keeps `index.md` and its images together; link them relatively, e.g. `./obrazek.png`.
---

This is a folder post: an `index.md` file and an image in the same directory.

![Test gradient](./obrazek.png)

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```
