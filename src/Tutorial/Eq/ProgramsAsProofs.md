# 証明としてのプログラム (Programs as Proofs)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/ProgramsAsProofs.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/ProgramsAsProofs.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Eq.ProgramsAsProofs

import Tutorial.Eq.Eq

import Data.Either
import Data.HList
import Data.Vect
import Data.String

%default total
```

数学者ハスケル・カリー（Haskell Curry）と論理学者ウィリアム・アルヴィン・ハワード（William Alvin Howard）の有名な対応関係（**カリー＝ハワード同型対応 / Curry-Howard correspondence**）によれば、豊かな型システムを持つ言語において、**型は数学的命題（proposition）** であり、その型を持つ全域的な **プログラム（値）はその命題の証明（proof）** であるとみなすことができます。

たとえば、「1 + 1 = 2」という命題の証明は以下の通りです：

```idris
onePlusOne : the Nat 1 + 1 = 2
onePlusOne = Refl
```

型を宣言しただけでは証明にはなりません。たとえば「1 + 1 = 3」という型を宣言することは自由ですが、その全域的な実装（値）を構築することはできません（このような型を **要素を持たない型（uninhabited type / 空の型）** と呼びます）：

```idris
onePlusOneWrong : the Nat 1 + 1 = 3
```

## テストを置き換える証明 (When Proofs replace Tests)

コンパイル時証明の最も直接的な用途は、関数が期待通りの性質を満たしていることを証明することです。たとえば、「リストに対する `map` はリストの長さを変化させない」という命題を証明してみましょう：

```idris
mapListLength : (f : a -> b) -> (as : List a) -> length as = length (map f as)
mapListLength f []        = Refl
mapListLength f (x :: xs) = cong S $ mapListLength f xs
```

再帰呼び出し `mapListLength f xs` の結果（`length xs = length (map f xs)`）に対し、*Prelude* の `cong`（合同律: $x = y \implies f(x) = f(y)$）を適用して両辺に `S`（後者関数）を適用することで、数学的帰納法により証明が完了します。これがあれば、単体テストを書くまでもなく長さが不変であることが保証されます。

また、パーサーとシリアライザーが互いに逆変換になっていることの証明も同様に書けます：

```idris
showColType : ColType -> String
showColType I64      = "i64"
showColType Str      = "str"
showColType Boolean  = "boolean"
showColType Float    = "float"

readColType : String -> Maybe ColType
readColType "i64"      = Just I64
readColType "str"      = Just Str
readColType "boolean"  = Just Boolean
readColType "float"    = Just Float
readColType s          = Nothing

showReadColType : (c : ColType) -> readColType (showColType c) = Just c
showReadColType I64     = Refl
showReadColType Str     = Refl
showReadColType Boolean = Refl
showReadColType Float   = Refl
```

## 注意点: 関数型内の小文字識別子

型シグネチャを書く際、Idris は引数のない小文字の識別子を **暗黙の型パラメータ（型変数）** として解釈します。たとえば `id` 関数をそのまま書くと、グローバル関数の `id` ではなく新しい暗黙引数 `id : a -> a` とみなされてしまいます：

```idris
-- 誤った例: `id` が暗黙引数として束縛されてしまう
-- mapMaybeId1 : (ma : Maybe a) -> map id ma = ma
```

これを防ぐには、名前空間を明示して `Prelude.id` と書くか、大文字のエイリアス（`Id`）を定義します：

```idris
mapMaybeId : (ma : Maybe a) -> map Prelude.id ma = ma
mapMaybeId Nothing  = Refl
mapMaybeId (Just x) = Refl
```

<!-- vi: filetype=idris2:syntax=markdown
-->
