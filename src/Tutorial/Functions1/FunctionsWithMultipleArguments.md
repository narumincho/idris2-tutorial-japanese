# 複数の引数を取る関数

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/FunctionsWithMultipleArguments.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/FunctionsWithMultipleArguments.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Functions1.FunctionsWithMultipleArguments
```

3つの `Integer` 引数が [ピタゴラスの三つ組（ピタゴラス数）](https://ja.wikipedia.org/wiki/%E3%83%94%E3%82%BF%E3%82%B8%E3%83%A9%E3%82%B9%E6%95%B0) を形成しているかどうかを判定する関数を実装してみましょう。ここでは新しい演算子である等値演算子 `==` を使用します。

```idris
export
isTriple : Integer -> Integer -> Integer -> Bool
isTriple x y z = x * x + y * y == z * z
```

型について詳しく説明する前に、まずは REPL で試してみましょう：

```repl
Tutorial.Functions1> isTriple 1 2 3
False
Tutorial.Functions1> isTriple 3 4 5
True
```

この例が示すように、複数の引数を取る関数の型は、関数矢印（`->`）で連結された引数の型（*入力型*）の並びと、最後の出力型（この例では `Bool`）で構成されます。

実装部分は数学の方程式のように見えます。`=` の左側に引数が列挙され、右側にそれらを使って行う計算が記述されます。

関数型プログラミング言語における関数の実装は、命令型言語の実装に比べて数学的な見た目になることがよくあります。命令型言語では「何を (what)」計算するかではなく、命令文の並びとして「どのように (how)」計算するかを記述することが多いためです。Idris でもこうした命令型のスタイルを記述することができ、後の章で学びますが、可能な限り宣言的なスタイルが好まれます。

上の例で示したように、関数を呼び出す際は引数を空白で区切って渡します。引数として渡す式自体に空白が含まれていない限り、括弧 `()` は不要です。この構文は、後のセクションで扱う「部分適用」を非常に扱いやすくしています。

なお、`Integer` や `Bits8` とは異なり、`Bool` は Idris 言語に組み込まれたプリミティブ型ではなく、ユーザー自身が定義できる通常のデータ型です。データ型の定義方法については次の章で扱います。

<!-- vi: filetype=idris2:syntax=markdown
-->
