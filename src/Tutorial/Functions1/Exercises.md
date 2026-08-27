# 関数入門 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1/Exercises.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1/Exercises.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions1.Exercises
```

これらの練習問題の解答は [`src/Solutions/Functions1.idr`](../../Solutions/Functions1.md) にあります。

## 練習問題 1

ドット演算子（`.`）を使い、第2引数を省略することで、関数 `testSquare` と `twice` を再実装してください（`squareTimes2` の実装を参考にしてください）。このように引数を明示せずに書く簡潔なスタイルは **ポイントフリースタイル (point-free style)** と呼ばれ、小さなユーティリティ関数を書く際によく好まれます。

## 練習問題 2

先ほどの `isEven` と（Idris の *Prelude* にある）`not` 関数を組み合わせて、`isOdd` 関数を宣言・実装してください。ポイントフリースタイルを使用してください。

## 練習問題 3

第1引数の `Integer` が第2引数の2乗であるかどうかを判定する関数 `isSquareOf` を宣言・実装してください。

## 練習問題 4

`Integer` 引数が 100 以下であるかどうかを判定する関数 `isSmall` を宣言・実装してください。実装には比較演算子 `<=` または `>=` のいずれかを使用してください。

## 練習問題 5

`Integer` 引数の絶対値が 100 以下であるかどうかを判定する関数 `absIsSmall` を宣言・実装してください。実装には `isSmall` と（Idris の *Prelude* にある）`abs` 関数を使用し、ポイントフリースタイルで記述してください。

## 練習問題 6

この少し発展的な問題では、`Integer` 述語（`Integer -> Bool` 型の関数）を扱うためのユーティリティを実装します。以下の高階関数を実装してください（実装にはブール演算子 `&&`、`||`、および `not` 関数を使用してください）：

```idris
-- 両方の述語が成り立つ場合にのみ true を返す
and : (Integer -> Bool) -> (Integer -> Bool) -> Integer -> Bool

-- 少なくとも一方の述語が成り立つ場合にのみ true を返す
or : (Integer -> Bool) -> (Integer -> Bool) -> Integer -> Bool

-- 述語が成り立たない場合に true を返す
negate : (Integer -> Bool) -> Integer -> Bool
```

実装できたら、REPL で試してみてください。以下の例では、2引数関数 `and` をバッククォートで囲んで中置記法で使用しています。これは特定の関数適用を読みやすくするための構文上の工夫です：

```repl
Tutorial.Functions1> negate (isSmall `and` isOdd) 73
False
```

## 練習問題 7

前述の通り、Idris では独自のインフィックス演算子を定義できます。さらに、Idris は関数名の **オーバーロード (overloading)** をサポートしています。つまり、2つの関数や演算子が同じ名前を持ちながら、異なる型と実装を持つことができます。Idris は型情報を利用して、同じ名前の演算子や関数を区別します。

これを利用して、ブール代数の既存の演算子名や関数名を使って、練習問題 6 の `and`、`or`、`negate` を再実装してみましょう：

```idris
-- 両方の述語が成り立つ場合にのみ true を返す
(&&) : (Integer -> Bool) -> (Integer -> Bool) -> Integer -> Bool
x && y = and x y

-- 少なくとも一方の述語が成り立つ場合にのみ true を返す
(||) : (Integer -> Bool) -> (Integer -> Bool) -> Integer -> Bool

-- 述語が成り立たない場合に true を返す
not : (Integer -> Bool) -> Integer -> Bool
```

残り2つの関数を実装し、REPL でテストしてください：

```repl
Tutorial.Functions1> not (isSmall && isOdd) 73
False
```

<!-- vi: filetype=idris2:syntax=markdown
-->
