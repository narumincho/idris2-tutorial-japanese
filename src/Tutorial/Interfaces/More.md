# インターフェースの発展的な機能

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/More.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/More.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Interfaces.More

import Tutorial.Interfaces.Basics
```

前節では、インターフェースの基本的な概念（なぜ有用なのか、どのように定義・実装するのか）について学びました。本節では、インターフェースの拡張（継承）、制約付きの実装、デフォルト実装といった少し発展的な概念について学びます。

## インターフェースの拡張 (Extending Interfaces)

インターフェースの中には階層構造を形成するものがあります。たとえば練習問題 4 の `Concat` インターフェースに対して、連結操作に関する単位元を持つ型のための子インターフェース `Empty` を定義したいとします。このような場合、`Concat` の実装を `Empty` を実装するための前提条件とすることができます：

```idris
interface Concat a where
  concat : a -> a -> a

implementation Concat String where
  concat = (++)

interface Concat a => Empty a where
  empty : a

implementation Empty String where
  empty = ""
```

`Concat a => Empty a` は、「型 `a` に対する `Concat` の実装が存在することが、`a` に対する `Empty` の実装が存在するための **前提条件** である」と読めます。これは同時に、インターフェース `Empty` の実装がある場合は **必ず** `Concat` の実装も存在し、対応する関数を呼び出せることを意味します：

```idris
concatListE : Empty a => List a -> a
concatListE []        = empty
concatListE (x :: xs) = concat x (concatListE xs)
```

`concatListE` の型制約には `Empty` のみを指定しているにもかかわらず、実装内では `empty` と `concat` の両方を呼び出せていることに注目してください。

## 制約付きの実装 (Constrained Implementations)

ジェネリックな型に対してインターフェースを実装する際、その型パラメータ自身が同じインターフェースを実装している場合にのみ実装可能となるケースがあります。たとえば、`Maybe a` に対して `Comp` インターフェースを実装することは、型 `a` 自体が `Comp` を実装している場合にのみ意味を持ちます。制約付き関数の場合と同じ構文を使って、インターフェースの実装に制約を付けることができます：

```idris
implementation Comp a => Comp (Maybe a) where
  comp Nothing  Nothing  = EQ
  comp (Just _) Nothing  = GT
  comp Nothing  (Just _) = LT
  comp (Just x) (Just y) = comp x y
```

これは構文は似ていますが、インターフェースの拡張とは異なります。ここでは制約が型全体ではなく **型パラメータ** に課されています。`Comp (Maybe a)` の実装の最後の行では、2つの `Just` 内に格納された値を比較しています。これが可能なのは、それらの値に対しても `Comp` の実装が存在する場合に限られます。試しに上記の実装から `Comp a =>` 制約を削除してみてください。Idris の型エラーを読んで理解することは、エラーを修正するために重要です。

便利なことに、Idris はこれらすべての制約を自動的に連鎖して解決してくれます：

```idris
maxTest : Maybe Bits8 -> Ordering
maxTest = comp (Just 12)
```

ここで Idris は `Comp (Maybe Bits8)` の実装を見つけようとします。そのためには `Comp Bits8` の実装が必要です。`maxTest` の型にある `Bits8` を `Bits64` に変更してみて、Idris が出力するエラーメッセージを確認してみてください。

## デフォルト実装 (Default Implementations)

関連する複数の関数をインターフェースに含め、プログラマが最も効率的な方法で各関数を実装できるようにしたい場合があります（たとえそれらがお互いを使って実装可能であるとしても）。たとえば、2つの値の等値性を比較する `Equals` インターフェースを考えます。等しい場合に `True` を返す `eq` と、等しくない場合に `True` を返す `neq` があるとします。明らかに `neq` は `eq` を使って実装できるため、`Equals` を実装する際はほとんどの場合 `eq` のみを実装すれば十分です。このような場合、`Equals` の定義内で `neq` のデフォルト実装を提供できます：

```idris
interface Equals a where
  eq : a -> a -> Bool

  neq : a -> a -> Bool
  neq a1 a2 = not (eq a1 a2)
```

`Equals` の実装で `eq` のみを実装した場合、Idris は上記で定義された `neq` のデフォルト実装を使用します：

```idris
Equals String where
  eq = (==)
```

一方で、両方の関数に明示的な実装を提供したい場合は、そのように記述することも可能です：

```idris
Equals Bool where
  eq True True   = True
  eq False False = True
  eq _ _         = False

  neq True  False = True
  neq False True  = True
  neq _ _         = False
```

<!-- vi: filetype=idris2:syntax=markdown
-->
