# プリミティブ (Primitives)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

これまで扱ってきたトピックでは、Idris のプリミティブ型についてほとんど触れてきませんでした。それらは身近に存在し、いくつかの計算でも使用してきましたが、それらがどのように動作し、どこから来ているのか、何ができて何ができないのかについて詳しく説明していませんでした。

本章では、Idris におけるプリミティブ型とプリミティブ関数、各バックエンドとの関係、そしてそれらを安全かつ効果的に扱う方法について詳しく見ていきます。

```idris hide
module Tutorial.Prim

import Data.Bits
import Data.String

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
