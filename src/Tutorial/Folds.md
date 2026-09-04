# 再帰と畳み込み (Recursion and Folds)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

本章では、`List`、`Maybe`、`Identity` のような、型パラメータで指定された型の値を 0 個以上保持する **コンテナ型** に対して通常行う計算について詳しく見ていきます。これらの関数の多くは本質的に再帰的であるため、まず一般的な再帰について、そして重要な最適化手法である **末尾再帰（tail recursion）** についての解説から始めます。本節のほとんどの再帰関数は、リストに対する純粋な反復処理を記述します。

全域性の判定が難しいのは再帰関数であるため、次に全域性チェッカーについて簡単に確認し、コンパイラが関数の全域性を認めてくれないケースとその対処法について学びます。

最後に、前半で登場した再帰関数の共通パターンを抽出し、コンテナ型を集約・消費するための新しいインターフェース **`Foldable`（畳み込み可能）** を導入します。

```idris hide
module Tutorial.Folds

import Data.List1
import Data.Maybe
import Data.Vect
import Debug.Trace

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
