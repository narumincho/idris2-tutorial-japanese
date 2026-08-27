# 依存型 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

01. `List` の長さを計算する関数 `len : List a -> Nat` を実装してください。たとえば `len [1, 1, 1]` は `3` を返します。

02. 空でないベクトルに対する関数 `head` を実装してください：

    ```idris
    head : Vect (S n) a -> a
    ```

    `Vect` の長さにパターン `S n` を使用することで、空でないことをどのように表現できるかに注目してください。これにより `Nil` のケースが排除され、結果を `Maybe` でラップすることなく `a` 型の値を返すことができます！ （ここでは厳密には必須ではありませんが）`Nil` のケースに対して `impossible` 節を追加してみてください。

03. `head` を参考に、空でないベクトルに対する関数 `tail` を宣言・実装してください。出力が入力よりも正確に1要素短いことが型に反映されるようにしてください。

04. `zipWith3` を実装してください。可能であれば `zipWith` の実装を見ずに挑戦してみてください：

    ```idris
    zipWith3 : (a -> b -> c -> d) -> Vect n a -> Vect n b -> Vect n c -> Vect n d
    ```

05. `Semigroup` の結合演算子（`(<+>)`）を使って `List` 内の値を集約する関数 `foldSemi` を宣言・実装してください（`Monoid` 制約ではなく、`Semigroup` 制約のみを使用するようにしてください）。

06. 練習問題 5 と同様の処理を空でないベクトルに対して行ってください。ベクトルが空でないという情報は戻り値の型にどのように影響するでしょうか？

07. `a` 型の初期値と `a -> a` 型の関数が与えられたとき、先頭が `a`、2番目の値が `f a`、3番目が `f (f a)` と続く `Vect` を生成したいとします。

    たとえば `a` が 1 で `f` が `(* 2)` の場合、`[1,2,4,8,16,...]` のような結果が得られます。

    この動作をカプセル化する関数 `iterate` を宣言・実装してください。どこから始めればよいかわからない場合は `replicate` を参考にしてください。

08. 状態型 `s` の初期値と関数 `fun : s -> (s,a)` が与えられたとき、`a` の `Vect` を生成したいとします。この動作をカプセル化する関数 `generate` を宣言・実装してください。`fun` を新しく呼び出すたびに、更新された状態を使用するようにしてください。

    以下は、これを使って最初の `n` 個のフィボナッチ数を生成する例です：

    ```repl
    generate 10 (\(x,y) => let z = x + y in ((y,z),z)) (0,1)
    [1, 2, 3, 5, 8, 13, 21, 34, 55, 89]
    ```

09. 値のリストを同じ長さの `Vect` に変換する関数 `fromList` を実装してください。行き詰まったらホールを活用してください：

    ```idris
    fromList : (as : List a) -> Vect (length as) a
    ```

    `fromList` の型において、リスト引数を関数 `length` に渡すことで、結果のベクトルの長さを **計算** できている点に注目してください。

10. 以下の宣言を考えます：

```idris
maybeSize : Maybe a -> Nat

fromMaybe : (m : Maybe a) -> Vect (maybeSize m) a
```

`maybeSize` に適切な実装を与え、その後 `fromMaybe` を実装してください。

