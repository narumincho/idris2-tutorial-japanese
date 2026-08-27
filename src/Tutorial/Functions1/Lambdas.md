# 無名関数（ラムダ式）

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/Lambdas.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/Lambdas.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions1.Lambdas

import Tutorial.Functions1.FunctionsWithMultipleArguments
```

高階関数にちょっとしたカスタム関数を渡したいけれど、わざわざトップレベル定義を書くのは面倒な場合があります。たとえば以下の例で、関数 `someTest` は非常に特定的で汎用性には欠けますが、高階関数 `testSquare` に渡したいとします：

```idris
someTest : Integer -> Bool
someTest n = n >= 3 || n <= 10
```

`testSquare` に渡すには以下のようにします：

```repl
Tutorial.Functions1> testSquare someTest 100
True
```

`someTest` を明示的に定義する代わりに、**無名関数 (anonymous function)** を使用できます：

```repl
Tutorial.Functions1> testSquare (\n => n >= 3 || n <= 10) 100
True
```

分かりやすくするために、無名関数を使って先ほどの定義を書き直してみましょう：

```idris
someTest' : Integer -> Bool
someTest' = \n => n >= 3 || n <= 10
```

無名関数は [ラムダ計算 (lambda calculus)](https://ja.wikipedia.org/wiki/%E3%83%A9%E3%83%A0%E3%83%80%E8%A8%88%E7%AE%97) にちなんで **ラムダ (lambda)** とも呼ばれ、バックスラッシュ `\` はギリシャ文字のラムダ（$\lambda$）に似ていることから構文として採用されています。

`\n =>` という構文は、`n` という1つの引数を取る新しい無名関数を導入し、その実装は関数矢印（`=>`）の右辺に記述されます。トップレベル関数と同様に、ラムダ式もカンマ区切りで複数の引数を取ることができます（例: `\x,y => x * x + y`）。ラムダ式を高階関数の引数として渡す場合は、通常括弧で囲むか、ドル演算子 `($)` で区切る必要があります（これについては次のセクションで説明します）。

ラムダ式では引数に型の注釈を付けないため、Idris は前後の文脈から型を推論できる必要がある点に注意してください。

<!-- vi: filetype=idris2:syntax=markdown
-->
