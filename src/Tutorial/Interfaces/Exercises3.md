# インターフェース 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

これらの練習問題は、Idris コードを書く際に頻繁に行うことになる「独自のデータ型に対するインターフェースの実装」に慣れるためのものです。

`Eq`、`Ord`、`Num` などのインターフェースがなぜ有用であるかは直感的に分かりやすいですが、`Semigroup` や `Monoid` の有用性は最初は実感しにくいかもしれません。そのため、これらに対する様々なインスタンスを実装する練習問題をいくつか用意しました。

01. 2つの `Double` 型の値をペアにした複素数を表すレコード型 `Complex` を定義してください。`Complex` に対してインターフェース `Eq`、`Num`、`Neg`、および `Fractional` を実装してください。

02. `Complex` に対して `Show` インターフェースを実装してください。データ型 `Prec` と関数 `showPrec`、およびこれらが *Prelude* において `Either` や `Maybe` のインスタンスを実装するためにどのように使われているかを調べてみてください。

    `Complex` 型の値を `Just` でラップし、REPL で `show` を実行して、実装が正しく動作することを確認してください。

03. オプショナルな値のための以下のラッパーレコードを考えます：

    ```idris
    record First a where
      constructor MkFirst
      value : Maybe a
    ```

    `First a` に対してインターフェース `Eq`, `Ord`, `Show`, `FromString`, `FromChar`, `FromDouble`, `Num`, `Neg`, `Integral`, `Fractional` を実装してください。これらすべてにおいて、型パラメータ `a` に対する適切な制約が必要になります。適宜、以下のユーティリティ関数を実装して使用することを検討してください：

    ```idris
    pureFirst : a -> First a

    mapFirst : (a -> b) -> First a -> First b

    mapFirst2 : (a -> b -> c) -> First a -> First b -> First c
    ```

04. `First a` に対して `Semigroup` と `Monoid` インターフェースを実装してください。`(<+>)` は最初の `Nothing` でない引数を返し、`neutral` がそれに対応する単位元となるようにします。これらの実装では型パラメータ `a` に制約を付けてはいけません。

05. レコード `Last` に対して練習問題 3 と 4 を繰り返してください。`Semigroup` 実装は最後の `Nothing` でない値を返すようにします。

    ```idris
    record Last a where
      constructor MkLast
      value : Maybe a
    ```

06. 関数 `foldMap` を使用すると、`Monoid` を返す関数をリストの要素にマップしながら、同時に `(<+>)` を使って結果を集約（累積）できます。これはリスト内の値を集計する非常に強力な方法です。`foldMap` と `Last` を使用して、リストから（存在すれば）末尾の要素を取り出す関数を実装してください。

    なお、`foldMap` の型はより一般的であり、リスト専用ではありません。`Maybe` や `Either`、その他まだ触れていないコンテナ型に対しても機能します。`Foldable` インターフェースについては後のセクションで学びます。

07. ブール値のためのラッパーレコード `Any` と `All` を考えます：

    ```idris
    record Any where
      constructor MkAny
      any : Bool

    record All where
      constructor MkAll
      all : Bool
    ```

    `Any` に対して `Semigroup` と `Monoid` を実装してください。引数の少なくとも一方が `True` である場合にのみ `(<+>)` の結果が `True` になるようにします。`neutral` がこの操作の正しい単位元であることを確認してください。

    同様に、`All` に対して `Semigroup` と `Monoid` を実装してください。両方の引数が `True` である場合にのみ `(<+>)` の結果が `True` になるようにします。`neutral` がこの操作の正しい単位元であることを確認してください。

08. `foldMap` と `Any` または `All` をそれぞれ使用して、関数 `anyElem` と `allElems` を実装してください：

    ```idris
    -- 少なくとも1つの要素に対して述語が成り立つ場合に True
    anyElem : (a -> Bool) -> List a -> Bool

    -- すべての要素に対して述語が成り立つ場合に True
    allElems : (a -> Bool) -> List a -> Bool
    ```

09. ラッパーレコード `Sum` と `Product` は主に数値型を保持するために使用されます。

    ```idris
    record Sum a where
      constructor MkSum
      value : a

    record Product a where
      constructor MkProduct
      value : a
    ```

    `Num a` の実装が与えられたとき、`(<+>)` が加算に対応するように `Semigroup (Sum a)` と `Monoid (Sum a)` を実装してください。

    同様に、`(<+>)` が乗算に対応するように `Semigroup (Product a)` と `Monoid (Product a)` を実装してください。

    `neutral` を実装する際、数値型を扱うときは整数リテラルを使用できることを思い出してください。

10. 練習問題 9 のラッパーと `foldMap` を組み合わせて、`sumList` と `productList` を実装してください：

    ```idris
    sumList : Num a => List a -> a

    productList : Num a => List a -> a
    ```

11. `foldMap` の強力さと汎用性を実感するために、練習問題 6〜10 を解いた後（または REPL セッションで `Solutions.Interfaces` をロードした後）、REPL で以下を実行してみてください。これは **リストの1回の走査だけで**、リストの先頭と末尾の要素、および全要素の合計と積を同時に計算します！

    ```repl
    > foldMap (\x => (pureFirst x, pureLast x, MkSum x, MkProduct x)) [3,7,4,12]
    (MkFirst (Just 3), (MkLast (Just 12), (MkSum 26, MkProduct 1008)))
    ```

    なお、`Ord` の実装を持つ型に対しても `Semigroup` 実装が存在し、2つの値のうち小さい方または大きい方を返すことができます。絶対的な最小値または最大値を持つ型（たとえば自然数の 0、`Bits8` の 0 と 255 など）の場合は、`Monoid` に拡張することも可能です。

12. 前の練習問題で化学元素を表すデータ型を実装し、その原子量を計算する関数を書きました。原子量を表す新しい単一フィールドのレコード型を定義し、それに対して `Eq`, `Ord`, `Show`, `FromDouble`, `Semigroup`, `Monoid` インターフェースを実装してください。

13. 練習問題 12 の新しいデータ型を使用して元素の原子量を計算し、化学式で与えられた分子の分子量を計算してください。

    ヒント: 適切なユーティリティ関数を用意すれば、ここでも `foldMap` を活用できます。

補足: 関数型プログラミングが初めての方は、練習問題 6〜10 の実装をぜひ REPL で試してみてください。これらの関数をいかに最小限のコードで実装できるか、そして練習問題 11 に示したように、これらの振る舞いをリストの1回の走査でいかに合成できるかに注目してください。

