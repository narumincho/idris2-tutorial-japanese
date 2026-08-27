# Idris における定義の構造

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Intro/ShapeOfADef.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Intro/ShapeOfADef.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Intro.ShapeOfADef
```

最初の Idris プログラムを実行できたところで、定義するために記述したコードについてもう少し詳しく見ていきましょう。

Idris における典型的なトップレベルの関数は、以下の3つの要素で構成されます：

1. 関数名（前節の例では `main`）
2. その型（`IO ()`）
3. その実装（`putStrLn "Hello World!"`）

いくつか例を通じてこれらの要素を探ってみましょう。まずは符号なし8ビット整数の最大値を表す定数を定義します：

```idris
maxBits8 : Bits8
maxBits8 = 255
```

1行目は次のように読むことができます：

> （0個の引数を取る）関数 `maxBits8` を宣言します。その型は `Bits8` です。

これは **関数宣言 (function declaration)** と呼ばれ、指定された名前と型を持つ関数が存在することを宣言します。

2行目は次のように読みます：

> `maxBits8` を呼び出した（評価した）結果は `255` となります。（このように、`Integer` だけでなく他の整数型に対しても整数リテラルを使用できます。）

これは **関数定義 (function definition)** と呼ばれ、関数 `maxBits8` が評価されたときにどのように振る舞うかを記述します。

これを REPL で確認してみましょう。前節で説明したように、このソースファイル（`src/Tutorial/Intro/ShapeOfADef.md`）を Idris REPL に読み込み、以下を試してみてください：

```repl
Tutorial.Intro> maxBits8
255
Tutorial.Intro> :t maxBits8
Tutorial.Intro.maxBits8 : Bits8
```

また、`maxBits8` を他の式の一部として使用することもできます：

```repl
Tutorial.Intro> maxBits8 - 100
155
```

先ほど `maxBits8` を「0引数の関数」と説明しましたが、これは単に「定数」の別の言い方にすぎません。では、最初の **本物の** 関数を書いてテストしてみましょう：

```idris
distanceToMax : Bits8 -> Bits8
distanceToMax n = maxBits8 - n
```

ここでは新しい構文と新しい種類の型である「関数型」が登場しました。

`distanceToMax : Bits8 -> Bits8` は次のように読みます：

> `distanceToMax` は `Bits8` 型の引数を1つ取り、`Bits8` 型の結果を返す関数です。

実装では、引数に `n` というローカル識別子（「名前」のこと）が与えられ、それが右辺の計算で使用されます。REPL でこの関数を試してみましょう：

```repl
Tutorial.Intro> distanceToMax 12
243
Tutorial.Intro> :t distanceToMax
Tutorial.Intro.distanceToMax : Bits8 -> Bits8
Tutorial.Intro> :t distanceToMax 12
distanceToMax 12 : Bits8
```

最後の例として、整数の2乗（平方）を計算する関数を実装してみましょう：

```idris
square : Integer -> Integer
square n = n * n
```

ここで、Idris でプログラミングする際の非常に重要な側面を学びます。Idris は **静的型付き** 言語です。異なる型を自由に混在させることはできず、型を混在させると型チェッカー（Idris のコンパイルプロセスの一部）からエラーメッセージが出力されます。たとえば、REPL で以下を試すと型エラーになります：

```repl
Tutorial.Intro> square maxBits8
Error: ...
```

これは `square` が `Integer` 型の引数を期待しているのに対し、`maxBits8` は `Bits8` 型であるためです。多くのプリミティブ型は、`cast` 関数を使用することで相互に変換できます（精度が失われるリスクがある場合もあります）。`cast` については、後の「Prelude のインターフェース」のセクションで詳しく説明します：

```repl
Tutorial.Intro> square (cast maxBits8)
65025
```

上記の結果が `maxBits8` よりもはるかに大きいことに注目してください。これは、`maxBits8` がまず同じ値を持つ `Integer` に変換され、その後2乗されているためです。もし `maxBits8` を直接2乗した場合、結果は `Bits8` の有効範囲に収まるように切り詰められます（オーバーフロー）：

```repl
Tutorial.Intro> maxBits8 * maxBits8
1
```

<!-- vi: filetype=idris2:syntax=markdown
-->
