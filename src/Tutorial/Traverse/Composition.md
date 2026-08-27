# 合成の威力 (The Power of Composition)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/Composition.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/Composition.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Traverse.Composition

import Tutorial.Traverse.State

import Data.HList
import Data.IORef
import Data.List1
import Data.String
import Data.Validated
import Data.Vect
import Text.CSV

%default total
```

状態付き計算の基礎を学んだところで、状態変更とエラー集約を組み合わせて、1 回の走査でインデックス付けと CSV 行の読み込みを同時に行ってみましょう。

```idris
tagAndDecode :  (0 ts : List Type)
             -> CSVLine (HList ts)
             => String
             -> State Nat (Validated CSVError (HList ts))
tagAndDecode ts s = uncurry (hdecode ts) <$> pairWithIndex s
```

アプリカティブファンクタは合成可能であり、`tagAndDecode` の結果は `State Nat` と `Validated CSVError` という 2 つのアプリアティブの入れ子になっています。*Prelude* は合成用のアプリアティブ名前付き実装（`Prelude.Applicative.Compose`）を提供しています：

```idris
readTable :  (0 ts : List Type)
          -> CSVLine (HList ts)
          => List String
          -> Validated CSVError (List $ HList ts)
readTable ts = evalState 1 . traverse @{%search} @{Compose} (tagAndDecode ts)
```

これは `Traversable` にはデフォルトの探索（`%search`）を使い、`Applicative` には名前付き実装 `Compose` を使うよう Idris に指示しています。可読性のためにヘルパー関数を定義することもできます：

```idris
traverseComp : Traversable t
             => Applicative f
             => Applicative g
             => (a -> f (g b))
             -> t a
             -> f (g (t b))
traverseComp = traverse @{%search} @{Compose}

readTable' :  (0 ts : List Type)
           -> CSVLine (HList ts)
           => List String
           -> Validated CSVError (List $ HList ts)
readTable' ts = evalState 1 . traverseComp (tagAndDecode ts)
```

さらに、`Traversable` も合成可能です。入れ子になった Traversable も再び Traversable になります。

たとえば、行に追加のアノテーション（コメントなど）が付与された CSV 行を表現するデータ型を考えてみましょう：

```idris
data Line : Type -> Type where
  Annotated : String -> a -> Line a
  Clean     : a -> Line a

Functor Line where
  map f (Annotated s x) = Annotated s $ f x
  map f (Clean x)       = Clean $ f x

Foldable Line where
  foldr f acc (Annotated _ x) = f x acc
  foldr f acc (Clean x)       = f x acc

Traversable Line where
  traverse f (Annotated s x) = Annotated s <$> f x
  traverse f (Clean x)       = Clean <$> f x

readLine : String -> Line String
readLine s = case split ('#' ==) s of
  h ::: [t] => Annotated t h
  _         => Clean s
```

これを用いて、アノテーションを保持しながらテーブル全体をパースする関数を定義できます：

```idris
readCSV :  (0 ts : List Type)
        -> CSVLine (HList ts)
        => String
        -> Validated CSVError (List $ Line $ HList ts)
readCSV ts = evalState 1
           . traverse @{Compose} @{Compose} (tagAndDecode ts)
           . map readLine
           . lines
```

`List (Line String)` という「Traversable の合成」に対し、`tagAndDecode` という「Applicative の合成」を適用して走査しています。

REPL で動作を確認してみましょう：

```idris
validInput : String
validInput = """
  f,12,-13.01#this is a comment
  t,100,0.0017
  t,1,100.8#color: red
  f,255,0.0
  f,24,1.12e17
  """

invalidInput : String
invalidInput = """
  o,12,-13.01#another comment
  t,100,0.0017
  t,1,abc
  f,256,0.0
  f,24,1.12e17
  """
```

```repl
Tutorial.Traverse> readCSV [Bool,Bits8,Double] validInput
Valid [Annotated "this is a comment" [False, 12, -13.01],
       Clean [True, 100, 0.0017],
       Annotated "color: red" [True, 1, 100.8],
       Clean [False, 255, 0.0],
       Clean [False, 24, 1.12e17]]

Tutorial.Traverse> readCSV [Bool,Bits8,Double] invalidInput
Invalid (Append (FieldError 1 1 "o")
  (Append (FieldError 3 3 "abc") (FieldError 4 2 "256")))
```

型システムと全域性チェッカーの導きにより、行番号の自動付与、エラー蓄積、カスタム行タグの抽出を兼ね備えた型安全なパーサーを美しく合成することができました。

<!-- vi: filetype=idris2:syntax=markdown
-->
