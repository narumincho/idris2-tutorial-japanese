# Foldable インターフェース (Interface Foldable)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Foldable.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Foldable.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Folds.Foldable

import Debug.Trace

%default total
```

前節の再帰の練習問題を振り返ると、リストに対する末尾再帰関数のほとんどが次の共通パターンを持っていました：先頭から末尾に向かってすべての要素を走査しながら、中間結果を蓄積するための状態（アキュムレータ）を引き渡していく。リストの末尾に達したら、最終状態をそのまま返すか、追加の関数呼び出しで変換して返す。

## 左畳み込み (Left Folds)

関数型プログラミングでは、このような繰り返し現れるパターンを抽象化します。リストを末尾再帰で走査するために必要なのは、アキュムレータ関数と初期状態だけです。アキュムレータの型は、現在の状態と次の要素を受け取って新しい状態を返す `state -> elem -> state` となります。これをカプセル化する高階関数を定義できます：

```idris
leftFold : (acc : state -> el -> state) -> (st : state) -> List el -> state
leftFold _   st []        = st
leftFold acc st (x :: xs) = leftFold acc (acc st x) xs
```

この関数を **左畳み込み（left fold）** と呼びます。リストを左から右（先頭から末尾）に向かって走査し、最終的に1つの値になるまでリストを集約（畳み込み / fold）するためです。`leftFold` は末尾再帰であるため、`leftFold` を使って実装されたすべての関数も自動的に末尾再帰（したがってスタックセーフ！）になります。

以下に使用例を示します：

```idris
sumLF : Num a => List a -> a
sumLF = leftFold (+) 0

reverseLF : List a -> List a
reverseLF = leftFold (flip (::)) Nil

-- `reverseLF` よりも自然な変換です！
toSnocListLF : List a -> SnocList a
toSnocListLF = leftFold (:<) Lin
```

## 右畳み込み (Right Folds)

`leftFold` を使った関数は、結果を計算するために常にリスト全体を走査しきる必要がありました。しかし、常にリストを最後まで走査する必要があるとは限りません。たとえば練習問題の `findList` のように、目的の要素が見つかった時点で走査を早期終了したい場合があります。`leftFold` ではパターンマッチが `Nil` に到達して初めて結果が返るため、このような早期脱出を実装することはできません。

興味深いことに、リストの構造をより自然に反映し、走査から早期脱出できる別の畳み込み（非末尾再帰）が存在します。これを **右畳み込み（right fold）** と呼びます：

```idris
rightFold : (acc : el -> state -> state) -> state -> List el -> state
rightFold acc st []        = st
rightFold acc st (x :: xs) = acc x (rightFold acc st xs)
```

一見すると `leftFold` との違いがわかりにくいかもしれません。これを見るために、まず遅延評価について説明します。

### Idris における遅延評価 (Lazy Evaluation)

一部の計算では、結果を返すために関数のすべての引数を評価する必要はありません。たとえば論理積演算子 `(&&)` を考えると、第1引数が `False` であれば、第2引数を評価するまでもなく結果が `False` であることが確定します。

REPL で以下を試してみましょう：

```repl
Tutorial.Folds> False && (length [1..10000000000] > 100)
False
```

もし第2引数が評価されていればメモリ不足でクラッシュするか膨大な時間がかかりますが、結果 `False` は即座に出力されます。`(&&)` の型を見ると以下のようになっています：

```repl
Tutorial.Folds> :t (&&)
Prelude.&& : Bool -> Lazy Bool -> Bool
```

第2引数が `Lazy` 型コンストラクタでラップされています。これは組み込み型であり、通常は Idris が自動的に処理してくれます。遅延引数は、関数内で実際に必要とされた（パターンマッチされたり、別の関数の正格引数として渡されたりした）瞬間にはじめて評価されます。

### 遅延評価と右畳み込み

`rightFold` と遅延評価を組み合わせることで、走査を途中で打ち切ることができる畳み込みを実装できます。`rightFold` の実装では、リストの残りの畳み込み結果がアキュムレータ関数 `acc` の引数として渡されている点に注目してください：

```repl
rightFold acc st (x :: xs) = acc x (rightFold acc st xs)
```

もし `acc` の第2引数が遅延評価されるなら、リストの末尾まで走査することなく結果を確定させて再帰を中断できます：

```idris
foldHead : List a -> Maybe a
foldHead = force . rightFold first Nothing
  where first : a -> Lazy (Maybe a) -> Lazy (Maybe a)
        first v _ = Just v
```

`Debug.Trace` モジュールの `trace` を使って、`first` が呼び出されるたびに "folded" を表示させてみましょう：

```idris
foldHeadTraced : List a -> Maybe a
foldHeadTraced = force . rightFold first Nothing
  where first : a -> Lazy (Maybe a) -> Lazy (Maybe a)
        first v _ = trace "folded" (Just v)
```

REPL で実行してみます：

```repl
Tutorial.Folds> :exec printLn $ foldHeadTraced [1..10]
folded
Just 1
```

リストに10個の要素があるにもかかわらず、`first` は1回しか呼ばれていません。

ただし、`rightFold` は一般的にはスタックセーフではない点に注意してください。数回の反復で確実に結果を返すことが保証されていない限り、明示的なパターンマッチを用いた末尾再帰で実装することを検討してください。

## 畳み込みとモノイド (Folds and Monoids)

左畳み込みと右畳み込みには共通パターンがあります：初期状態から開始し、アキュムレータ関数を使って現在の状態と現在の要素を結合していく点です。「初期値」から始めて「値を結合していく」という原則は、すでに学んだ **`Monoid`** インターフェースそのものです。したがって、リストをモノイド上で畳み込む関数を定義できます：

```idris
foldMapList : Monoid m => (a -> m) -> List a -> m
foldMapList f = leftFold (\vm,va => vm <+> f va) neutral
```

要素自体がすでにモノイド実装を持つ型であれば、変換関数すら不要です：

```idris
concatList : Monoid m => List m -> m
concatList = foldMapList id
```

## `List` だけに留まらない `Foldable` インターフェース

コンテナ内の値を単一の結果に集約（畳み込み）する操作は、`List` だけでなく `Vect`、`List1`、ローズツリー、さらには `Maybe`、`Either e`、`Identity` などの単一値コンテナに対しても同様に有用です。

これらすべての畳み込み可能なデータ構造を抽象化するインターフェースが **`Foldable`** であり、*Prelude* から提供されています。`:doc Foldable` で確認できるように、主に以下の 6 つの関数で構成されています：

- `foldr`（右畳み込み）
- `foldl`（左畳み込み）
- `null`（コンテナが空かどうかの判定）
- `foldlM`（モナド内でのエフェクトフルな畳み込み）
- `toList`（コンテナをリストに変換）
- `foldMap`（モノイドによる畳み込み）

`Foldable` の最小実装としては `foldr` のみを実装すれば十分ですが、パフォーマンス向上のために各コンテナ型に適した実装を個別に提供することが推奨されます。

<!-- vi: filetype=idris2:syntax=markdown
-->
