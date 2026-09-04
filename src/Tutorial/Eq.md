# 命題的等値性 (Propositional Equality)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

前章では、実行時にしか分からない値にパターンマッチすることで、その値から「型」を導出するための依存ペアや依存レコードの使い方を学びました。本章では、値の間の関係性や「契約（contracts）」を **型として記述** し、その型の値を **契約が成立していることの証明** として活用する方法（命題的等値性）について見ていきます。

```idris hide
module Tutorial.Eq

import Data.Either
import Data.HList
import Data.Vect
import Data.String

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
