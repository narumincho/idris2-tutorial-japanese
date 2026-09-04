# カリー化

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/Currying.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/Currying.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Functions1.Currying

import Tutorial.Functions1.HigherOrder
import Tutorial.Functions1.FunctionsWithMultipleArguments
```

高階関数を使い始めると、関数の部分適用（数学者・論理学者ハスケル・カリーにちなんで **カリー化 (currying)** とも呼ばれます）の概念が非常に重要になってきます。

このファイルを REPL セッションに読み込んで、以下を試してみてください：

```repl
Tutorial.Functions1.Currying> :t testSquare isEven
testSquare isEven : Integer -> Bool
Tutorial.Functions1.Currying> :t isTriple 1
isTriple 1 : Integer -> Integer -> Bool
Tutorial.Functions1.Currying> :t isTriple 1 2
isTriple 1 2 : Integer -> Bool
```

Idris では、複数の引数を取る関数に対して引数を一部だけ適用し、その結果として新しい関数を受け取ることができる点に注目してください。たとえば、`isTriple 1` は関数 `isTriple` に引数 `1` を適用し、`Integer -> Integer -> Bool` 型の新しい関数を返します。このような部分適用の結果を新しいトップレベル定義で使用することもできます：

```idris
partialExample : Integer -> Bool
partialExample = isTriple 3 4
```

REPL での実行結果：

```repl
Tutorial.Functions1.Currying> partialExample 5
True
```

先ほどの `twice` の例でも、ごくわずかなコードで印象的な結果を得るために部分適用を活用していました。

<!-- vi: filetype=idris2:syntax=markdown
-->
