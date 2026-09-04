# 空型（Void）への招待 (Into the Void)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Void.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Void.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Eq.Void

import Tutorial.Eq.Eq

import Data.Either
import Data.HList
import Data.Vect
import Data.String

%default total
```

「ある命題が偽である（成り立たない）」ことを Idris で表現するにはどうすればよいでしょうか？
Idris では、命題が成り立つならその型は要素（値）を持つ（**要素が存在する / inhabited**）といい、成り立たないならその型には要素が存在しない（**空である / uninhabited**）といいます。

「命題 $P$ が偽である」ことは、「もし $P$ が成り立つと仮定すると矛盾（`Void`）が導かれる」、すなわち **$P \to \text{Void}$** という関数型で表現します：

```idris
onePlusOneWrongProvably : the Nat 1 + 1 = 3 -> Void
onePlusOneWrongProvably Refl impossible
```

`Not a` は *Prelude* で `a -> Void` のエイリアスとして定義されています：

```idris
notSameLength : Not (List.length as = length bs) -> Not (as = bs)
notSameLength f prf = f (cong length prf)

contraCong : {0 f : _} -> Not (f a = f b) -> Not (a = b)
contraCong fun x = fun $ cong f x
```

## `Uninhabited` インターフェース

値が存在し得ない型を表すインターフェースとして `Uninhabited`（関数 `uninhabited : t -> Void`）が用意されています。また、`absurd : Uninhabited t => t -> a` は矛盾から任意の型を導出する（爆発律 / principle of explosion）関数です：

```idris
Uninhabited (SameSchema [] (h :: t)) where
  uninhabited Same impossible

Uninhabited (SameSchema (h :: t) []) where
  uninhabited Same impossible
```

## 決定可能な等値性 (Decidable Equality)

単に `Maybe (a = b)` を返すだけでは、「等しくない」のか「単に関数が手抜きをして `Nothing` を返したのか」を区別できません。偽陽性（false positive）だけでなく偽陰性（false negative）も排除し、「等しい証明（`Yes prf`）」か「等しくない証明（`No contra`）」のいずれかを必ず返す性質を **決定可能（decidable）** といい、`Dec prop` 型で表現します：

```idris
decSameColType :  (c1,c2 : ColType) -> Dec (SameColType c1 c2)
decSameColType I64 I64         = Yes SameCT
decSameColType I64 Str         = No $ \case SameCT impossible
decSameColType I64 Boolean     = No $ \case SameCT impossible
decSameColType I64 Float       = No $ \case SameCT impossible

decSameColType Str I64         = No $ \case SameCT impossible
decSameColType Str Str         = Yes SameCT
decSameColType Str Boolean     = No $ \case SameCT impossible
decSameColType Str Float       = No $ \case SameCT impossible

decSameColType Boolean I64     = No $ \case SameCT impossible
decSameColType Boolean Str     = No $ \case SameCT impossible
decSameColType Boolean Boolean = Yes SameCT
decSameColType Boolean Float   = No $ \case SameCT impossible

decSameColType Float I64       = No $ \case SameCT impossible
decSameColType Float Str       = No $ \case SameCT impossible
decSameColType Float Boolean   = No $ \case SameCT impossible
decSameColType Float Float     = Yes SameCT
```

スキーマ全体に対しても `Dec` を実装できます：

```idris
consInjective :  SameSchema (c1 :: cs1) (c2 :: cs2)
              -> (SameColType c1 c2, SameSchema cs1 cs2)
consInjective Same = (SameCT, Same)

decSameSchema :  (s1, s2 : Schema) -> Dec (SameSchema s1 s2)
decSameSchema []        []        = Yes Same
decSameSchema []        (y :: ys) = No absurd
decSameSchema (x :: xs) []        = No absurd
decSameSchema (x :: xs) (y :: ys) = case decSameColType x y of
  Yes SameCT => case decSameSchema xs ys of
    Yes Same   => Yes Same
    No  contra => No $ contra . snd . consInjective
  No  contra => No $ contra . fst . consInjective
```

標準ライブラリの `Decidable.Equality` モジュールは、決定可能な命題的等値性のためのインターフェース `DecEq`（関数 `decEq : (x1, x2 : a) -> Dec (x1 = x2)`）を提供しています。

<!-- vi: filetype=idris2:syntax=markdown
-->
