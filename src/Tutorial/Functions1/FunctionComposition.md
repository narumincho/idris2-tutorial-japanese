# 関数合成

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/FunctionComposition.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/FunctionComposition.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions1.FunctionComposition
```

関数はいくつかの方法で組み合わせることができますが、最も直接的な方法はドット（`.`）演算子（関数合成演算子）を使うことです：

```idris
export
square : Integer -> Integer
square n = n * n

times2 : Integer -> Integer
times2 n = 2 * n

squareTimes2 : Integer -> Integer
squareTimes2 = times2 . square
```

これを REPL で試してみましょう！期待通りの動作をしますか？

`squareTimes2` は、ドット演算子を使わずに以下のように実装することもできます：

```idris
squareTimes2' : Integer -> Integer
squareTimes2' n = times2 (square n)
```

ドット演算子がどのように動作するかをより深く理解するために、組み込みのドット演算子との名前の衝突を避けるため `<.>` という名前で独自のバージョンを実装してみましょう：

```idris
private infixr 9 <.>
(<.>) : (b -> c) -> (a -> b) -> a -> c
f <.> g = \x => (f (g x))
```

他の関数を引数として受け取る関数については次のセクションで詳しく説明しますが、現時点では私たちが定義した `<.>` が組み込みの `.` と同一であり、同じように使用できることを知っておけば十分です：

```idris
squareTimes2'' : Integer -> Integer
squareTimes2'' = times2 <.> square
```

重要な点として、ドット演算子で連結された関数は **右から左へと** 呼び出されます。`times2 . square` は `\n => times2 (square n)` と同じであり、`\n => square (times2 n)` ではありません。これは `<.>` の定義を見ても明らかです。

ドット演算子を使って複数の関数をつなぐことで、より複雑な関数を簡潔に書くことができます：

```idris
dotChain : Integer -> String
dotChain = reverse . show . square . square . times2 . times2
```

これはまず引数を4倍（2倍を2回）し、それを2回2乗した後に文字列に変換（`show`）し、最後にその文字列を反転（`reverse`）させます（`show` と `reverse` 関数は Idris の *Prelude* に含まれているため、すべての Idris プログラムで利用可能です）。

<!-- vi: filetype=idris2:syntax=markdown
-->
