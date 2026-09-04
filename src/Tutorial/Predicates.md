# 述語と証明探索 (Predicates and Proof Search)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

前章では、2 つの値が等しいことを証明するための命題的等値性について学びました。等値性は値の間の関係（二項関係）であり、インデックス付きデータ型のコンストラクタでインデックスの自由度を制限することで表現しました。同様の方法で、値の間のさまざまな関係や契約（述語）をエンコードできます。これにより、関数の引数として受け付ける値や関数が返す値を型レベルで厳密に制限（事前条件・事後条件）できるようになります。

```idris hide
module Tutorial.Predicates

import Data.Either
import Data.List1
import Data.String
import Data.Vect
import Data.HList
import Decidable.Equality

import Text.CSV
import System.File

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
