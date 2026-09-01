# CSV テーブルの読み込み (Reading CSV Tables)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/CSV.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/CSV.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Traverse.CSV

import Data.HList
import Data.IORef
import Data.List1
import Data.String
import Data.Validated
import Data.Vect
import Text.CSV

%default total
```

CSV リーダーの開発では、CSV ファイルの 1 行をヘテロジニアスリストにデコードする `hdecode` 関数まで作成しました。REPL での使い方は以下の通りでした：

```repl
Tutorial.Traverse> hdecode [Bool,String,Bits8] 1 "f,foo,12"
Valid [False, "foo", 12]
```

次のステップは、各文字列がテーブルの各行に対応する文字列リストとして表現された、CSV テーブル全体をパースすることです。最終的に目指すのは、以下の型を持つ関数です：

```idris
hreadTable1 :  (0 ts : List Type)
            -> CSVLine (HList ts)
            => List String
            -> Validated CSVError (List $ HList ts)
```

最初の実装では、行番号は一旦気にしないことにします：

```idris
hreadTable1 _  []        = pure []
hreadTable1 ts (s :: ss) = [| hdecode ts 0 s :: hreadTable1 ts ss |]
```

`hreadTable1` の実装において、アプリカティブ構文がそのまま使える点に注目してください。1行目では `Valid []` ではなく、より一般的な `pure []` を使用しています。実際、エラー処理に `Validated` ではなく `Either` や `Maybe` を使用した場合でも、`hreadTable1` の実装はまったく同じになります。

ここから共通パターンを抽象化してみましょう。`hreadTable1` で行っているのは、`String -> Validated CSVError (HList ts)` というエフェクトフルな計算を文字列のリストに対して実行し、結果として `Validated CSVError` でラップされた `List (HList ts)` を得ることです。まず入力と出力の型を抽象化します：

```idris
traverseValidatedList :  (a -> Validated CSVError b)
                      -> List a
                      -> Validated CSVError (List b)
traverseValidatedList _ []        = pure []
traverseValidatedList f (x :: xs) = [| f x :: traverseValidatedList f xs |]

hreadTable2 :  (0 ts : List Type)
            -> CSVLine (HList ts)
            => List String
            -> Validated CSVError (List $ HList ts)
hreadTable2 ts = traverseValidatedList (hdecode ts 0)
```

さらに、エフェクトの型も `Validated CSVError` に限定されず、`Either` や `Maybe` でも同じでした。そこで、エフェクトの型 `f` を `Applicative` 制約を持つ型パラメータとして抽象化します：

```idris
traverseList :  Applicative f => (a -> f b) -> List a -> f (List b)
traverseList _ []        = pure []
traverseList f (x :: xs) = [| f x :: traverseList f xs |]

hreadTable3 :  (0 ts : List Type)
            -> CSVLine (HList ts)
            => List String
            -> Validated CSVError (List $ HList ts)
hreadTable3 ts = traverseList (hdecode ts 0)
```

`traverseList` の実装は `traverseValidatedList` と同一ですが、型がはるかに汎用的になり、強力になりました。

REPL で動作を確認してみましょう：

```repl
Tutorial.Traverse> hreadTable3 [Bool,Bits8] ["f,12","t,0"]
Valid [[False, 12], [True, 0]]
Tutorial.Traverse> hreadTable3 [Bool,Bits8] ["f,12","t,1000"]
Invalid (FieldError 0 2 "1000")
Tutorial.Traverse> hreadTable3 [Bool,Bits8] ["1,12","t,1000"]
Invalid (Append (FieldError 0 1 "1") (FieldError 0 2 "1000"))
```

エラーメッセージで行番号が 0 になっているのは、`hdecode` にダミーの 0 を渡しているためです。行番号と文字列のペアを受け取るようにすれば、正確な行番号を渡すことができます：

```idris
hreadTable4 :  (0 ts : List Type)
            -> CSVLine (HList ts)
            => List (Nat, String)
            -> Validated CSVError (List $ HList ts)
hreadTable4 ts = traverseList (uncurry $ hdecode ts)
```

REPL で正しく行番号がエラーメッセージに反映されることを確認できます：

```repl
Tutorial.Traverse> hreadTable4 [Bool,Bits8] [(1,"t,1000"),(2,"1,100")]
Invalid (Append (FieldError 1 2 "1000") (FieldError 2 1 "1"))
```

## Traversable インターフェース

`traverseList` のような関数は、他のコンテナ型に対しても実装できます。`Foldable` の `toList` を経由してリストに変換することもできますが、それでは元のコンテナの型情報（たとえば `Vect` の長さなど）が失われてしまいます：

```idris
traverseVect' : Applicative f => (a -> f b) -> Vect n a -> f (List b)
traverseVect' fun = traverseList fun . toList
```

ここで必要となるのは、元のコンテナの構造（型レベル情報）をそのまま保持する関数です：

```idris
traverseVect : Applicative f => (a -> f b) -> Vect n a -> f (Vect n b)
traverseVect _   []        = pure []
traverseVect fun (x :: xs) = [| fun x :: traverseVect fun xs |]
```

そして、これに関連する便利な派生関数 `sequence` も直ちに導かれます：

```idris
sequenceList : Applicative f => List (f a) -> f (List a)
sequenceList = traverseList id
```

これらすべての走査可能なデータ構造を抽象化するインターフェースが **`Traversable`** であり、*Prelude* から提供されています：

```idris
interface Functor t => Foldable t => Traversable' t where
  traverse' : Applicative f => (a -> f b) -> t a -> f (t b)
```

`traverse` 関数は、*Prelude* で提供されている最も抽象的で汎用性の高い関数の 1 つです。4 つもの型パラメータ（コンテナ型 `t`、エフェクト型 `f`、入力型 `a`、出力型 `b`）にパラメータ化されており、何百通りもの組み合わせでコンテナをエフェクトフルに走査できます。

## Traversable の法則 (Traversable Laws)

`traverse` は以下の 2 つの法則に従う必要があります：

- `traverse (Id . f) = Id . map f`: `Identity` モナドに対する走査は、単なる Functor の `map` と等価でなければならない。
- `traverse (MkComp . map f . g) = MkComp . map (traverse f) . traverse g`: エフェクトの合成を伴う走査は、1 回の走査で行っても 2 回連続の走査で行っても等価でなければならない。

これらの法則から、`traverse` はコンテナのサイズや形状を変更してはならず、要素の順序を変更してもいけないことが導かれます。

<!-- vi: filetype=idris2:syntax=markdown
-->
