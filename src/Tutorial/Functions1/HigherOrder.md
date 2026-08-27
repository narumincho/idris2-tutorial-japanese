# 高階関数

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/HigherOrder.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/HigherOrder.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions1.HigherOrder

import Tutorial.Functions1.FunctionComposition
```

関数は他の関数を引数として受け取ることができます。これは極めて強力な概念であり、非常に奥が深いものですが、まずはシンプルな例からゆっくり始めましょう：

```idris
export
isEven : Integer -> Bool
isEven n = mod n 2 == 0

export
testSquare : (Integer -> Bool) -> Integer -> Bool
testSquare fun n = fun (square n)
```

上記の定義で、`isEven` は `mod` 関数を使って整数が2で割り切れるかどうかを判定しており、これまでに定義した他の関数と同様にシンプルです。

一方、`testSquare` はより興味深い定義になっています。これは2つの引数を取り、第1引数の型は **`Integer` から `Bool` への関数**、第2引数の型は `Integer` です。第2引数の値は2乗された上で、第1引数の関数に渡されます。

REPL で動かしてみましょう：

```repl
Tutorial.Functions1> testSquare isEven 12
True
```

ここで何が起きているかをじっくり理解してください。関数 `isEven` を `testSquare` の第1引数として渡しています。第2引数は整数で、まず2乗されてから `isEven` に渡されます。この例自体は単純ですが、読み進めるにつれて、他の関数へ関数を渡す様々なユースケースに出会うことになります。

先述の通り、この概念を応用すると非常に強力なことができます。以下の例を見てみましょう：

```idris
twice : (Integer -> Integer) -> Integer -> Integer
twice f n = f (f n)
```

REPL での実行結果：

```repl
Tutorial.Functions1> twice square 2
16
Tutorial.Functions1> (twice . twice) square 2
65536
Tutorial.Functions1> (twice . twice . twice . twice) square 2
*** 非常に大きな数値 ***
```

この挙動に驚くかもしれませんが、分解して考えてみましょう。以下の2つの式は全く同じ振る舞いをします：

```idris
expr1 : Integer -> Integer
expr1 = (twice . twice . twice . twice) square

expr2 : Integer -> Integer
expr2 = twice (twice (twice (twice square)))
```

順を追って見ていきましょう：

- `square` は引数を2乗（2の累乗）します。
- `twice square` は `square` を2回適用するため、引数を4乗します。
- `twice (twice square)` は `twice square` を2回呼び出すため、16乗します。
- これを繰り返して `twice (twice (twice (twice square)))` となると、引数を65536乗することになり、とてつもなく巨大な数値になります。

<!-- vi: filetype=idris2:syntax=markdown
-->
