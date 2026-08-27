# 書き換え規則 (Rewrite Rules)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Rewrite.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Rewrite.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Eq.Rewrite

import Data.Either
import Data.HList
import Data.Vect
import Data.String

%default total
```

命題的等値性の極めて重要な用途の 1 つが、Idris が自動的には単一化（unify）できない型を置き換える（**書き換える / rewrite**）ことです。たとえば `0 + n` は `plus` の定義（第 1 引数に対するパターンマッチ）により自動的に `n` と等しいと認識されます：

```idris
leftZero :  List (Vect n Nat)
         -> List (Vect (0 + n) Nat)
         -> List (Vect n Nat)
leftZero = (++)
```

しかし、`n + 0` と `n` は Idris にとって自動的には等しくありません（`n` が変数であるため）。これを解決するには、等値性の証明を与えて型を書き換えます：

```idris
addZeroRight : (n : Nat) -> n + 0 = n
addZeroRight 0     = Refl
addZeroRight (S k) = cong S $ addZeroRight k
```

*Prelude* の `replace` 関数、あるいは Idris の **`rewrite` 構文** を用いて、ゴールや引数の型を書き換えることができます：

```idris
rewriteVect : Vect (n + 0) a -> Vect n a
rewriteVect as = rewrite sym (addZeroRight n) in as
```

## ユースケース: ベクトルの反転 (Reversing Vectors)

ベクトルの反転（`reverse`）を実装する際、補佐関数 `revOnto` では型レベルの加算の等値性証明が必要になります：

```idris
revOnto : Vect m a -> Vect n a -> Vect (m + n) a
revOnto xs [] = rewrite addZeroRight m in xs
revOnto {n = S len} xs (x :: ys) =
  rewrite sym (plusSuccRightSucc m len) in revOnto (x :: xs) ys
```

ここで `Data.Nat.plusSuccRightSucc : (left, right : Nat) -> S (left + right) = left + S right` は自然数の加算に関する標準ライブラリの定理です。

## 消去（Erasure）に関する注意

`Equal` や `Refl` のような単一の値しか持たない型は、実行時には何の情報も持たないため、**多重度 0（コンパイル時に消去）** として扱われます。どれほど複雑な証明を書いても実行時性能には一切影響を与えません。

<!-- vi: filetype=idris2:syntax=markdown
-->
