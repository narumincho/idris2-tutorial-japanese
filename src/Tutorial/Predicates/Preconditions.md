# 事前条件 (Preconditions)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Preconditions.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Preconditions.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Predicates.Preconditions

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

関数を実装する際、すべての入力値が有効な引数であるとは限りません（例: ゼロ除算の禁止、空リストからの先頭要素の取得など）。関数の引数に **事前条件（precondition）** を課すためのいくつかのアプローチがあります：

1. **`Maybe` や `Either` でラップする**: 失敗の可能性が明示されますが、空でないことが自明な場合でも常にアンラップの負担が生じます。
2. **専用の非空データ型（`List1` など）を定義する**: 純粋な値を返せますが、既存の `List` のユーティリティを再実装するコストが発生します。
3. **インデックス付き型（`Vect` など）を使う**: 長さなどの情報が厳密に追跡できますが、型レベルでの追跡コストが高くなります。
4. **述語（証明）を引数として受け取る**: 入力値が条件を満たしていることの証拠（witness）を（通常は多重度 0 で消去される）引数として受け取ります。

本章では、既存の型を活用しつつ安全性を高められる 4 番目の「述語による事前条件の指定」について詳しく見ていきます。

## 例: 空でないリスト (Non-empty Lists)

「リストが空でない」という述語 `NotNil` をインデックス付きデータ型として定義します：

```idris
data NotNil : (as : List a) -> Type where
  IsNotNil : NotNil (h :: t)
```

これを使って、安全かつ純粋な `head` 関数を定義できます：

```idris
head1 : (as : List a) -> (0 _ : NotNil as) -> a
head1 (h :: _) _ = h
head1 [] IsNotNil impossible
```

コンパイル時にリストが空でないことが分かっている場合は `IsNotNil` を直接渡せます：

```idris
headEx1 : Nat
headEx1 = head1 [1,2,3] IsNotNil
```

実行時にしか内容が分からないリストに対しては、述語が決定可能（`Dec (NotNil as)`）であることを利用して安全にアンラップできます：

```idris
Uninhabited (NotNil []) where
  uninhabited IsNotNil impossible

nonEmpty : (as : List a) -> Dec (NotNil as)
nonEmpty (x :: xs) = Yes IsNotNil
nonEmpty []        = No uninhabited

headMaybe1 : List a -> Maybe a
headMaybe1 as = case nonEmpty as of
  Yes prf => Just $ head1 as prf
  No  _   => Nothing
```

## 自動暗黙引数と証明探索 (Auto Implicits)

毎回手動で `IsNotNil` を渡すのは煩雑です。Idris では `{auto 0 prf : NotNil as}` のように **`auto` キーワード** を付けることで、コンパイラに自動で証明を構築（**証明探索 / proof search**）させることができます。

また、インターフェース制約と同じ構文 `(0 _ : NotNil as) =>` を用いて簡潔に書くこともできます：

```idris
head : (as : List a) -> {auto 0 prf : NotNil as} -> a
head (x :: _) = x
head [] impossible

head' : (as : List a) -> (0 _ : NotNil as) => a
head' (x :: _) = x
head' [] impossible
```

非空リストに対しては引数を省略してそのまま呼び出せます：

```idris
headEx3 : Nat
headEx3 = Preconditions.head [1,2,3]
```

空リストに対して呼び出そうとすると、コンパイル時に証明探索が失敗してエラーになります：

```idris
failing "Can't find an implementation\nfor NotNil []."
  errHead : Nat
  errHead = Preconditions.head []
```

実行時のコンテキストに証明 `prf` が存在する場合も自動で証明探索が見つけ出すため、`headMaybe` を簡潔に実装できます：

```idris
headMaybe : List a -> Maybe a
headMaybe as = case nonEmpty as of
  Yes prf => Just $ Preconditions.head as
  No  _   => Nothing
```

<!-- vi: filetype=idris2:syntax=markdown
-->
