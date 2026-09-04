# インターフェースの基礎

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/Basics.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/Basics.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Interfaces.Basics
```

前述の関数のオーバーロードは便利ですが、この形式のオーバーロードでは大量のコードの重複が発生するユースケースが存在します。

例として、`String` 型の値の順序関係を記述する `cmp` 関数（*Prelude* からエクスポートされている `compare` の短縮形）を考えてみましょう：

```idris
cmp : String -> String -> Ordering
```

他の多くのデータ型に対しても同様の関数を用意したいとします。関数のオーバーロードを使えばそれ自体は可能ですが、`cmp` は単独で完結する機能ではありません。`cmp` からは `greaterThan'`、`lessThan'`、`minimum'`、`maximum'` など、多くの関数を導出できます：

```idris
lessThan' : String -> String -> Bool
lessThan' s1 s2 = LT == cmp s1 s2

greaterThan' : String -> String -> Bool
greaterThan' s1 s2 = GT == cmp s1 s2

minimum' : String -> String -> String
minimum' s1 s2 =
  case cmp s1 s2 of
    LT => s1
    _  => s2

maximum' : String -> String -> String
maximum' s1 s2 =
  case cmp s1 s2 of
    GT => s1
    _  => s2
```

`cmp` 関数を持つ他のすべての型に対してもこれらすべてを再実装する必要があり、それらの実装の大部分（あるいはすべて）は上記と全く同じコードになります。これは著しいコードの重複です。

この問題を解決する1つの方法は、高階関数を使用することです。たとえば、比較関数を第1引数として受け取り、残り2つの引数のうち小さい方を返す関数 `minimumBy` を定義できます：

```idris
minimumBy : (a -> a -> Ordering) -> a -> a -> a
minimumBy f a1 a2 =
  case f a1 a2 of
    LT => a1
    _  => a2
```

この解決策は高階関数によってコードの重複を減らせる良い例ですが、比較関数を常に明示的に引き回さなければならないのは面倒です。Idris がそのような比較関数を自動的に見つけ出してくれると便利です。

インターフェース（Interfaces）は、まさにこの問題を解決します。例を見てみましょう：

```idris
public export
interface Comp a where
  comp : a -> a -> Ordering

export
implementation Comp Bits8 where
  comp = compare

export
implementation Comp Bits16 where
  comp = compare
```

上記のコードは、型 `a` の2つの値の順序関係を計算する関数 `comp` を提供する **インターフェース** `Comp` を定義し、続いて `Bits8` と `Bits16` に対するこのインターフェースの2つの **実装 (implementation)** を定義しています。なお、`implementation` キーワードは省略可能です。

`Bits8` と `Bits16` の `comp` 実装は、どちらも *Prelude* にある `Ord` という同様のインターフェースの一部である `compare` 関数を使用しています。

次に REPL で `comp` の型を確認してみましょう：

```repl
Tutorial.Interfaces> :t comp
Tutorial.Interfaces.comp : Comp a => a -> a -> Ordering
```

`comp` の型シグネチャで興味深い部分は、先頭の `Comp a =>` 引数です。ここで `Comp` は型パラメータ `a` に対する **制約 (constraint)** です。このシグネチャは、「任意の型 `a` について、`a` に対するインターフェース `Comp` の実装が存在するならば、型 `a` の2つの値を比較して `Ordering` を返すことができる」と読めます。`comp` を呼び出すたびに、Idris が `Comp a` の実装を自動的に解決して渡してくれるため、新しい矢印 `=>` が使われています。Idris が実装を見つけられない場合は、型エラーが発生します。

これで、関連する関数の実装において `comp` を利用できるようになりました。必要なのは、導出された関数にも `Comp` 制約を付けることだけです：

```idris
lessThan : Comp a => a -> a -> Bool
lessThan s1 s2 = LT == comp s1 s2

greaterThan : Comp a => a -> a -> Bool
greaterThan s1 s2 = GT == comp s1 s2

minimum : Comp a => a -> a -> a
minimum s1 s2 =
  case comp s1 s2 of
    LT => s1
    _  => s2

maximum : Comp a => a -> a -> a
maximum s1 s2 =
  case comp s1 s2 of
    GT => s1
    _  => s2
```

`minimum` の定義が `minimumBy` とほぼ同じであることに注目してください。唯一の違いは、`minimumBy` では比較関数を明示的な引数として渡す必要があったのに対し、`minimum` では Idris が `Comp` の実装の一部として自動的に渡してくれる点です。

こうして、インターフェース `Comp` の実装を持つあらゆる型に対して、これらすべてのユーティリティ関数を一度の定義で利用できるようになりました。

<!-- vi: filetype=idris2:syntax=markdown
-->
