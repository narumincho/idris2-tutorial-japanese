# 型としての等値性 (Equality as a Type)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Eq.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Eq.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Eq.Eq

import Data.Either
import Data.HList
import Data.Vect
import Data.String

%default total
```

2 つの CSV テーブルを連結する関数を考えます：

```idris
public export
data ColType = I64 | Str | Boolean | Float

public export
Schema : Type
Schema = List ColType

IdrisType : ColType -> Type
IdrisType I64     = Int64
IdrisType Str     = String
IdrisType Boolean = Bool
IdrisType Float   = Double

Row : Schema -> Type
Row = HList . map IdrisType

record Table where
  constructor MkTable
  schema : Schema
  size   : Nat
  rows   : Vect size (Row schema)

concatTables1 : Table -> Table -> Maybe Table
```

2 つのテーブルを行ベクトルとして連結するには、両者のスキーマが完全に一致していることを型チェッカーに対して検証・納得させる必要があります。通常の `Eq` インターフェースの `(==)` では、結果が単なる `Bool`（`True` または `False`）にすぎないため、Idris は `s1 == s2` が `True` であっても型レベルで `s1` と `s2` を単一化（unify）してくれません。

```idris
Eq ColType where
  I64     == I64     = True
  Str     == Str     = True
  Boolean == Boolean = True
  Float   == Float   = True
  _       == _       = False

concatTables1 (MkTable s1 m rs1) (MkTable s2 n rs2) = case s1 == s2 of
  True  => ?what_now
  False => Nothing
```

## 等しいスキーマを表す型 (A Type for equal Schemata)

この問題を解決するために、**値の間の等値性契約をインデックス付きデータ型としてエンコード** します：

```idris
public export
data SameSchema : (s1 : Schema) -> (s2 : Schema) -> Type where
  Same : SameSchema s s
```

`SameSchema` のコンストラクタ `Same` は、2 つのインデックスが同一（`s` と `s`）である場合にのみ構築できます。これを利用して `concatTables` を安全に実装できます：

```idris
public export
data SameColType : (c1, c2 : ColType) -> Type where
  SameCT : SameColType c1 c1

sameColType : (c1, c2 : ColType) -> Maybe (SameColType c1 c2)
sameColType I64     I64     = Just SameCT
sameColType Str     Str     = Just SameCT
sameColType Boolean Boolean = Just SameCT
sameColType Float   Float   = Just SameCT
sameColType _ _             = Nothing

sameNil : SameSchema [] []
sameNil = Same

sameCons :  SameColType c1 c2
         -> SameSchema s1 s2
         -> SameSchema (c1 :: s1) (c2 :: s2)
sameCons SameCT Same = Same

sameSchema : (s1, s2 : Schema) -> Maybe (SameSchema s1 s2)
sameSchema []        []        = Just sameNil
sameSchema (x :: xs) (y :: ys) =
  [| sameCons (sameColType x y) (sameSchema xs ys) |]
sameSchema (x :: xs) []        = Nothing
sameSchema []        (x :: xs) = Nothing

concatTables : Table -> Table -> Maybe Table
concatTables (MkTable s1 m rs1) (MkTable s2 n rs2) = case sameSchema s1 s2 of
  Just Same => Just $ MkTable s1 _ (rs1 ++ rs2)
  Nothing   => Nothing
```

パターンマッチで `Same` を取り出すことで、コンパイラは `s1` と `s2` が同一であることを認識し、`rs1` と `rs2` の行型が一致して安全に連結できるようになります。

## `Equal` 型と `Refl` (Type Equal)

このような **命題的等値性（propositional equality）** は Idris の基本概念であるため、*Prelude* に標準の等値性型 `Equal`（構文糖衣 `(=)` または `(===)`）とその唯一のコンストラクタ `Refl`（反射律 / reflexivity）が用意されています：

```idris
eqColType : (c1,c2 : ColType) -> Maybe (c1 = c2)
eqColType I64     I64     = Just Refl
eqColType Str     Str     = Just Refl
eqColType Boolean Boolean = Just Refl
eqColType Float   Float   = Just Refl
eqColType _ _             = Nothing

eqCons :  {0 c1,c2 : a}
       -> {0 s1,s2 : List a}
       -> c1 = c2 -> s1 = s2 ->  c1 :: s1 = c2 :: s2
eqCons Refl Refl = Refl

eqSchema : (s1,s2 : Schema) -> Maybe (s1 = s2)
eqSchema []        []        = Just Refl
eqSchema (x :: xs) (y :: ys) = [| eqCons (eqColType x y) (eqSchema xs ys) |]
eqSchema (x :: xs) []        = Nothing
eqSchema []        (x :: xs) = Nothing

concatTables3 : Table -> Table -> Maybe Table
concatTables3 (MkTable s1 m rs1) (MkTable s2 n rs2) = case eqSchema s1 s2 of
  Just Refl => Just $ MkTable _ _ (rs1 ++ rs2)
  Nothing   => Nothing
```

<!-- vi: filetype=idris2:syntax=markdown
-->
