---
title: On Letter-Spacing
date: 2019-12-30
summary: The trusty letter-spacing CSS property. It’s been around forever, and is an essential part of any front-end developer’s toolbox. I typically use it on fully-capitalized text or unruly webfonts…
tags:
  - CSS
  - Typography
  - Design
---

The trusty `letter-spacing` CSS property. It’s been around forever, and is an essential part of any front-end developer’s toolbox. I typically use it on fully-capitalized text [insert example], or unruly webfonts, like this header text using [insert font]. But, as with most CSS properties, this one has a few quirks we need to consider during implementation.

## Use relative units
The most useful tip I can give when dealing with `letter-spacing` is to use `em` units, which will scale with your font. Using absolute units, such as `px` won’t scale if you need to rescale, which you inevitably will need to do.

My go-to units lie within the `.005em to .02em` range, but it all depends on the typeface and design I’m working with.

## Couple it with word-spacing
If you’re using a negative `letter-spacing` value, you might want to couple it with a positive `word-spacing` property. This will restore the typeface’s normal word spacing, which will allow it to breathe and maintain its legibility.

## Don’t forget to trim your ends

As expected, declaring `letter-spacing` on an element will add horizontal space between its characters. Unexpectedly, that also applies to the *last* character as well. And that means you need to account for it in your designs.

I typically do that with adding a `text-indent` declaration, or reducing and element’s right `padding`, like below:

Hopefully these tidbits help you out. And remember, kids: it may seem like a small detail, but you’re a designer. It’s your job to recognize and account for the minor inconsistencies of the medium. God knows no one else will.