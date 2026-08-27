# 依存ペア (Dependent Pairs)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DPair/DPair.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DPair/DPair.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DPair.DPair

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

これまで、ベクトルの長さインデックスを利用して、関数の振る舞いを型レベルで厳密に表現する例を見てきました。たとえば、ベクトルに対する `map` や `traverse` は全く同じ長さのベクトルを返します。型がこれを保証しているため、以下の関数は完全に安全かつ全域的です：

```idris
parseAndDrop : Vect (3 + n) String -> Maybe (Vect n Nat)
parseAndDrop = map (drop 3) . traverse parsePositive
```

`traverse parsePositive` の引数が `Vect (3 + n) String` 型であるため、結果は `Maybe (Vect (3 + n) Nat)` 型になります。したがって、これに対して `drop 3` を安全に呼び出すことができます。

## 長さが不明なベクトル (Vectors of Unknown Length)

しかし、長さが事前にわからない場合もあります。`Data.List` の `takeWhile` 関数を考えてみましょう：

```repl
Tutorial.Relations> :t takeWhile
Data.List.takeWhile : (a -> Bool) -> List a -> List a
```

これは、与えられた述語が `True` を返す最長のプレフィックス（接頭辞）を取得します。この場合、プレフィックスの長さはリストの要素と述語に依存するため、実行時にしかわかりません。これをベクトル向けに書こうとするとどうなるでしょうか？

```idris
takeWhile' : (a -> Bool) -> Vect n a -> Vect m a
```

これを実装しようとしても、全域的な方法では実装できません。なぜなら、この型は「任意の型 `a` の述語と、任意の長さ `n` のベクトル、そして **呼び出し側が指定する任意の長さ `m`** に対して、長さ `m` のベクトルを返す」と約束してしまっているからです（**全称量化 / universal quantification**）。呼び出し側が出力長 `m` を自由に決められるため、型が破綻してしまいます。

そこで必要になるのが、**存在量化（existential quantification）** を表現する **依存ペア（dependent pair）** です。ベクトルと、そのベクトルの実際の長さの値をペアにして返します：

```idris
record AnyVect a where
  constructor MkAnyVect
  length : Nat
  vect   : Vect length a
```

`AnyVect a` の外部からはベクトルの長さは型レベルでは見えなくなりますが、ベクトルの実体とともに長さが格納されているため、実行時に検査できます。これを使って `takeWhile` を安全に実装できます：

```idris
takeWhile : (a -> Bool) -> Vect n a -> AnyVect a
takeWhile f []        = MkAnyVect 0 []
takeWhile f (x :: xs) = case f x of
  False => MkAnyVect 0 []
  True  => let MkAnyVect n ys = takeWhile f xs in MkAnyVect (S n) (x :: ys)
```

長さは Idris によって自動推論できるため、アンダースコア `_` で省略可能です：

```idris
takeWhile2 : (a -> Bool) -> Vect n a -> AnyVect a
takeWhile2 f []        = MkAnyVect _ []
takeWhile2 f (x :: xs) = case f x of
  False => MkAnyVect 0 []
  True  => let MkAnyVect _ ys = takeWhile2 f xs in MkAnyVect _ (x :: ys)
```

## 依存ペアの本質 (The Essence of Dependent Pairs)

依存ペアとは、**ある型の値と、その値に依存した型の第2の値とのペア** です。自然数 `n`（値）と、長さ `n` のベクトル（型が `n` に依存する値）のペアなどがその典型です。

これは非常に基本的な概念であるため、*Prelude* から標準の依存ペア型 `DPair` が提供されています：

```idris
record DPair' (a : Type) (p : a -> Type) where
  constructor MkDPair'
  fst : a
  snd : p fst
```

第1要素 `fst : a` の値を使って、第2要素の型 `p fst` が決定されます。たとえば `AnyVect a` は `DPair` を使って以下のように書けます：

```idris
AnyVect' : (a : Type) -> Type
AnyVect' a = DPair Nat (\n => Vect n a)
```

Idris は依存ペアのための特別な構文 `(x : a ** P x)` または型推論が効く場合の `(x ** P x)` を提供しています：

```idris
AnyVect'' : (a : Type) -> Type
AnyVect'' a = (n : Nat ** Vect n a)

AnyVect3 : (a : Type) -> Type
AnyVect3 a = (n ** Vect n a)
```

これを使って `takeWhile` を依存ペアで書き直すことができます。値の生成やパターンマッチにも `(x ** y)` 構文が使えます：

```idris
takeWhile3 : (a -> Bool) -> Vect m a -> (n ** Vect n a)
takeWhile3 f []        = (_ ** [])
takeWhile3 f (x :: xs) = case f x of
  False => (_ ** [])
  True  => let (_  ** ys) = takeWhile3 f xs in (_ ** x :: ys)
```

3つ以上のタプル（依存トリプルなど）も同様にネストして定義できます：

```idris
AnyMatrix : (a : Type) -> Type
AnyMatrix a = (m ** n ** Vect m (Vect n a))
```

## 消去された存在量化 (Erased Existentials)

ベクトルのように、値自体にパターンマッチすることでインデックスの値を復元できる場合、実行時にインデックスを明示的に保持し続ける必要はありません（実行時オーバーヘッドの削減）。*base* の `Data.DPair` モジュールは、第1引数の多重度が 0（実行時消去）である `Exists` 型を提供しています：

```idris
takeWhileExists : (a -> Bool) -> Vect m a -> Exists (\n => Vect n a)
takeWhileExists f []        = Evidence _ []
takeWhileExists f (x :: xs) = case f x of
  True  => let Evidence _ ys = takeWhileExists f xs
            in Evidence _ (x :: ys)
  False => takeWhileExists f xs
```

消去されたインデックスの値を明示的に復元したい場合、*base* の `Data.Singleton` モジュールの `Singleton` 型（特定の値 1 つだけに対応するシングルトン型）が役立ちます：

```idris
true : Singleton True
true = Val True

vectLength : Vect n a -> Singleton n
vectLength []        = Val 0
vectLength (x :: xs) = let Val k = vectLength xs in Val (S k)
```

`vectLength` は通常の `length` よりも強力で、返される値が厳密に型レベルの `n` と等しいことが型チェックによって保証されます。これを使って `Exists` から通常の `DPair` への安全な変換が可能です：

```idris
toDPair : Exists (\n => Vect n a) -> (m ** Vect m a)
toDPair (Evidence _ as) = let Val m = vectLength as in (m ** as)
```

<!-- vi: filetype=idris2:syntax=markdown
-->
