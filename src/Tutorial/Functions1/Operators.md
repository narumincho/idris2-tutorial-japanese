# 演算子

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/Operators.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/Operators.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions1.Operators
```

Idris では、`.` や `*`、`+` のような中置演算子は言語にハードコードされているわけではなく、中置記法で使用するための特別なサポートを備えた通常の Idris 関数です。中置記法以外で演算子を使用する場合は、括弧で囲む必要があります。

例として、`Bits8 -> Bits8` 型の関数を順次適用するためのカスタム演算子を定義してみましょう：

```idris
infixr 4 >>>

(>>>) : (Bits8 -> Bits8) -> (Bits8 -> Bits8) -> Bits8 -> Bits8
f1 >>> f2 = f2 . f1

foo : Bits8 -> Bits8
foo n = 2 * n + 3

test : Bits8 -> Bits8
test = foo >>> foo >>> foo >>> foo
```

演算子自体の宣言と定義に加えて、その結合性（fixity）も指定する必要があります。`infixr 4 >>>` は、`(>>>)` が優先順位 `4` で右結合（つまり `f >>> g >>> h` が `f >>> (g >>> h)` と解釈される）であることを意味します。*Prelude* からエクスポートされている演算子の結合性は、REPL で確認できます：

```repl
Tutorial.Functions1> :doc (.)
Prelude.. : (b -> c) -> (a -> b) -> a -> c
  Function composition.
  Totality: total
  Fixity Declaration: infixr operator, level 9
```

式の中で複数の中置演算子が混在している場合、優先順位が高い演算子ほど強く結合します。たとえば、`(+)` は優先順位 8 の左結合であり、`(*)` は優先順位 9 の左結合です。したがって、`a * b + c` は `a * (b + c)` ではなく `(a * b) + c` と解釈されます。

## 演算子セクション (Operator Sections)

演算子は通常の関数と同様に部分適用することができます。この場合、式全体を括弧で囲む必要があり、これは **演算子セクション (operator section)** と呼ばれます。以下に2つの例を示します：

```repl
Tutorial.Functions1> testSquare (< 10) 5
False
Tutorial.Functions1> testSquare (10 <) 5
True
```

このように、`(< 10)` と `(10 <)` には違いがあります。前者は「引数が10未満であるか」を判定し、後者は「10が引数未満であるか」を判定します。

演算子セクションが機能しない例外の1つが、マイナス演算子 `(-)` です。これを示す例を以下に挙げます：

```idris
applyToTen : (Integer -> Integer) -> Integer
applyToTen f = f 10
```

これは単に関数引数に10を適用する高階関数です。以下の例では問題なく動作します：

```repl
Tutorial.Functions1> applyToTen (* 2)
20
```

しかし、10から5を引きたい場合、以下はエラーになります：

```repl
Tutorial.Functions1> applyToTen (- 5)
Error: Can't find an implementation for Num (Integer -> Integer).

(Interactive):1:12--1:17
 1 | applyToTen (- 5)
```

ここでの問題は、Idris が `- 5` を演算子セクションではなく負の整数リテラルとして扱うことです。この特殊なケースでは、代わりに無名関数を使用する必要があります：

```repl
Tutorial.Functions1> applyToTen (\x => x - 5)
5
```

## 非演算子関数の中置記法

Idris では、通常の2引数関数をバッククォート（`` ` ``）で囲むことで、中置記法として使用できます。これらに対しても優先順位（結合性）を定義し、通常の演算子と同様に演算子セクションで使用することも可能です：

```idris
infixl 8 `plus`

infixl 9 `mult`

plus : Integer -> Integer -> Integer
plus = (+)

mult : Integer -> Integer -> Integer
mult = (*)

arithTest : Integer
arithTest = 5 `plus` 10 `mult` 12

arithTest' : Integer
arithTest' = 5 + 10 * 12
```

## *Prelude* がエクスポートする主な演算子

*Prelude* からエクスポートされている重要な演算子のリストです：

- `(.)`: 関数合成
- `(+)`: 加算
- `(*)`: 乗算
- `(-)`: 減算
- `(/)`: 除算
- `(==)` : 2つの値が等しい場合に True
- `(/=)` : 2つの値が等しくない場合に True
- `(<=)`, `(>=)`, `(<)`, `(>)` : 比較演算子
- `($)`: 関数適用

これらの多くには **制約 (constraint)** があり、特定の **インターフェース** を実装した型に対してのみ機能します。これについては現時点では気にする必要はありません。インターフェースについては後の章で詳しく学びますし、これらの演算子は直感通りに振る舞います。たとえば、加算や乗算はすべての数値型に対して動作し、比較演算子は関数を除く Prelude のほぼすべての型に対して動作します。

上記の中で最も特殊なのが最後の `($)` です。この優先順位は 0 であり、他のすべての演算子や通常の関数適用よりも弱く結合します。これを利用して、式の中の括弧の数を減らすことができます。たとえば、`isTriple 3 4 (2 + 3 * 1)` と書く代わりに、全く同じ意味で `isTriple 3 4 $ 2 + 3 * 1` と書くことができます。これは可読性を向上させることもあればそうでないこともありますが、経験を積むにつれてどちらが読みやすいかの直感が身につくでしょう。覚えておくべき重要な点は、`fun $ x y` は `fun (x y)` と全く同じであるということです。

<!-- vi: filetype=idris2:syntax=markdown
-->
