# エフェクトを伴う走査 (Effectful Traversals)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

本章では、*Prelude* における高階カインド（higher-kinded）インターフェースの解説を締めくくります。そのために、「Functor とその仲間たち」の章で作成し始めた CSV リーダーの開発をさらに進めていきます。前章のデータ型やインターフェースの一部は専用のモジュールに切り出されているため、最初から書き直すことなくインポートして利用できます。

なお、当初の CSV リーダーとは異なり、例外処理には `Either` ではなく `Validated` を使用します。これにより、CSV ファイルの読み込み時に発生したすべてのエラーを蓄積・集約できるようになります。

```idris hide
module Tutorial.Traverse

import Data.HList
import Data.IORef
import Data.List1
import Data.String
import Data.Validated
import Data.Vect
import Text.CSV

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
