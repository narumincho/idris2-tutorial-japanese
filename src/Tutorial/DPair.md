# シグマ型（依存ペア） (Sigma Types)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DPair.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DPair.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

これまでの依存型プログラミングの例では、ベクトルの長さのような型インデックスはコンパイル時に既知であるか、コンパイル時に既知の値から計算できるものでした。しかし、実際のアプリケーションでは、そのような情報は実行時になって初めて判明することが多く、ユーザーの操作や外部世界の状況に依存します。たとえば、ファイルの内容を行のベクトルとして保持する場合、ファイルをメモリに読み込むまでベクトルの長さは事前にはわかりません。その結果、扱う値の型が「実行時にしか分からない他の値」に依存することになり、依存先の値に対してパターンマッチを行って初めて型を特定できるようになります。このような依存関係を表現するために、**[シグマ型（Sigma Types / $\Sigma$型）](https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E5%9E%8B#%CE%A3%E5%9E%8B)**（依存ペアおよびその一般化である依存レコード）が必要になります。

```idris hide
module Tutorial.DPair

import Control.Monad.State

import Data.DPair
import Data.Either
import Data.HList
import Data.List
import Data.List1
import Data.Singleton
import Data.String
import Data.Vect

import Text.CSV

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
