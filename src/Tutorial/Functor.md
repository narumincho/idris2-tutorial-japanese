# Functor とその仲間たち

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

プログラミングは数学と同様に、抽象化がすべてです。私たちは現実世界の振る舞いをモデル化し、繰り返し現れるパターンを抽象化して再利用しようとします。

本章では、抽象化に関するいくつかの関連するインターフェースについて学びます。これらは抽象的であるがゆえに、最初は理解しにくいかもしれません。特に、「**なぜ** 有用なのか」「**いつ** 使うべきなのか」を掴むには時間と経験が必要です。そのため本章には多くの練習問題が用意されています（そのほとんどはわずか数行の短いコードで解決できます）。練習問題を飛ばさずに、自然に感じられるようになるまで何度も立ち返ってみてください。次第に最初の難しさが消え去っていくのを実感できるはずです。

```idris hide
module Tutorial.Functor

import Data.List1
import Data.String
import Data.Vect

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
