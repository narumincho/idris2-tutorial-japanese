# コンパイル時計算 (Compile-Time Computations)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent/Comptime.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent/Comptime.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Dependent.Comptime

import Tutorial.Dependent.LengthIndexedLists

%default total
```

前節（特にいくつかの練習問題）では、関数や値の型を記述するためにコンパイル時計算を多用し始めました。これは入力の型から出力の型を計算できる非常に強力な概念です。例を見てみましょう：

2つの `List` は `(++)` 演算子で連結できます。もちろん `Vect` に対しても同様の操作ができるべきです。しかし `Vect` は長さでインデックス付けされているため、入力の長さが出力の長さにどのように影響するかを型に正確に反映させる必要があります：

```idris
(++) : Vect m a -> Vect n a -> Vect (m + n) a
(++) []        ys = ys
(++) (x :: xs) ys = x :: (xs ++ ys)
```

型レベルで長さを追跡することにより、要素を誤って欠落させてしまうような一般的なプログラミングミスをここでも排除できています。

型レベルの計算を入力型のパターンとして使用することもできます。以下は、前の練習問題で `Fin n` 引数を使って実装した `drop` の代替となる型と実装です：

```idris
drop' : (m : Nat) -> Vect (m + n) a -> Vect n a
drop' 0     xs        = xs
drop' (S k) (_ :: xs) = drop' k xs
```

なお、第2引数の `(m + n)` の順序を `(n + m)` に変更すると、2つ目の `xs` でエラーが発生します：

```repl
While processing right hand side of drop'. Can't solve constraint between: plus n 0 and n.
```

その理由については次のセクションで学びます。

## 限界と制約 (Limitations)

ここまでの例や練習問題を見て、型の中に任意の式を書けば Idris が自動的にすべてを評価・単一化してくれる、という結論に至ったかもしれません。

残念ながら、現実はそこまで単純ではありません。本節の例は、コンパイル時に問題なく「そのまま動く」ことがわかっているものを厳選したものです。その理由は、自分たちが書いたパターンマッチと、コンパイル時に使用した関数の実装との間に直接の対応関係があったからです。

たとえば、自然数の加算の実装は以下のようになっています：

```idris
add : Nat -> Nat -> Nat
add Z     n = n
add (S k) n = S $ add k n
```

ご覧の通り、`add` は **第1引数** に対するパターンマッチによって実装されており、第2引数は一切検査されません。これが `Vect` に対する `(++)` の実装方法とまったく同じである点に注目してください。`(++)` でも第1引数に対してパターンマッチを行い、`Nil` のケースでは第2引数をそのまま返し、*cons* のケースでは先頭要素を残りの連結結果に追加しています。2つのパターンマッチの間に直接の対応関係があるため、Idris は `Nil` のケースで `0 + n` を `n` と単一化でき、*cons* のケースで `(S k) + n` を `S (k + n)` と単一化できるのです。

人間による補助なしには Idris が納得してくれない簡単な例を以下に示します：

```idris
failing "Can't solve constraint"
  reverse : Vect n a -> Vect n a
  reverse []        = []
  reverse (x :: xs) = reverse xs ++ [x]
```

上記を型チェックすると、Idris は次のエラーを出力して失敗します：「Can't solve constraint between: plus n 1 and S n.」 何が起きているのでしょうか：左辺のパターンマッチから、Idris はベクトルの長さが `xs` の長さに対応する自然数 `n` の後続者 `S n` であることを知っています。右辺のベクトルの長さは、`(++)` の型と `xs` および `[x]` の長さから `n + 1` になります。オーバーロードされた演算子 `(+)` は関数 `Prelude.plus` で実装されているため、エラーメッセージ内では `(+)` が `plus` に置き換わっています。

このように、Idris は `1 + n` と `n + 1` が同じものであることを自力で検証することができません。しかし、人間が手助けすることは可能です。上記の等式が成り立つこと（より一般的には、自然数の加算が **交換法則 (commutative)** を満たすこと）の **証明** を提供すれば、その証明を使って `reverse` の右辺の型を **書き換え (rewrite)** ることができます。証明の記述と `rewrite` の使用には詳細な説明と例が必要なため、これらは後の章で詳しく解説します。

## 無制限の暗黙引数 (Unrestricted Implicits)

`replicate` のような関数では、戻り値のベクトルの長さを推論するために、自然数 `n` を明示的かつ無制限の引数として渡しました。しかし状況によっては、`n` が文脈から推論できる場合があります。たとえば以下の例では、`n` を明示的に渡すのは冗長です：

```idris
ex4 : Vect 3 Integer
ex4 = zipWith (*) (replicate 3 10) (replicate 3 11)
```

値 `n` は明らかに文脈から導出可能であり、アンダースコアに置き換えても問題なく動作します：

```idris
ex5 : Vect 3 Integer
ex5 = zipWith (*) (replicate _ 10) (replicate _ 11)
```

したがって、`n` を **無制限 (unrestricted)** の多重度を持つ暗黙の引数として渡す `replicate` の代替バージョンを実装できます：

```idris
replicate' : {n : _} -> a -> Vect n a
replicate' = replicate n
```

`replicate'` の実装において、`n` を参照して `replicate` に明示的な引数として渡せている点に注目してください。

推論可能な引数を暗黙的に渡すか明示的に渡すかの判断は、Idris がその引数を実際に推論できる頻度がどれくらいあるかによって決まります。場合によっては、1つの関数に対して両方のバージョンを用意するのが有用なこともあります。なお、暗黙の引数であっても明示的に値を渡すことができることを思い出してください：

```idris
ex6 : Vect ? Bool
ex6 = replicate' {n = 2} True
```

上記の型シグネチャにおけるクエスチョンマーク（`?`）は、Idris が単一化によって自力で値を推論すべきであることを示しています。これにより、`ex6` の右辺で `n` を明示的に指定することが強制されます。

### 暗黙引数に対するパターンマッチ

`replicate'` の実装では `replicate` 関数を利用し、明示的な引数 `n` に対してパターンマッチを行いました。しかし、多重度が 0 でない名前付き暗黙引数に対して直接パターンマッチを行うことも可能です：

```idris
replicate'' : {n : _} -> a -> Vect n a
replicate'' {n = Z}   _ = Nil
replicate'' {n = S _} v = v :: replicate'' v
```

<!-- vi: filetype=idris2:syntax=markdown
-->
