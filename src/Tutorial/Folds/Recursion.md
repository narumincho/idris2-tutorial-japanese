# 再帰 (Recursion)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Recursion.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Recursion.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Folds.Recursion

import Data.List1
import Data.Maybe
import Data.Vect
import Debug.Trace

%default total
```

本節では、一般的な再帰と、特に末尾再帰について詳しく見ていきます。

再帰関数とは、特定の終了条件（**基底ケース / base case** と呼ばれます）が満たされるまで、タスクや計算を繰り返すために自分自身を呼び出す関数のことです。全域性の検証を難しくしているのは再帰関数です。全ケースを網羅（*covering*）している非再帰関数は、他の全域関数のみを呼び出している限り、自動的に全域（total）となります。

以下は再帰関数の例です：指定された長さのリストを生成し、同一の値で埋めます：

```idris
replicateList : Nat -> a -> List a
replicateList 0     _ = []
replicateList (S k) x = x :: replicateList k x
```

このモジュールの冒頭には `%default total` プラグマがありますが、この関数は全域であることが証明されています。Idris は再帰呼び出しのたびに `Nat` 引数が **真に小さく（strictly smaller）** なっていることを検証し、したがって関数が最終的に必ず終了することを保証します。もちろん `Vect` に対しても同様のことができます：

```idris
replicateVect : (n : Nat) -> a -> Vect n a
replicateVect 0     _ = []
replicateVect (S k) x = x :: replicateVect k x
```

`List` や `Vect` などのデータ型の値を **生成** するために再帰を使用するだけでなく、それらの値を **消費（走査・集約）** する際にも再帰を使用します。たとえば、リストの長さを計算する関数は以下の通りです：

```idris
len : List a -> Nat
len []        = 0
len (_ :: xs) = 1 + len xs
```

ここでも、再帰ケースで渡されるリストが元のリスト引数よりも真に小さいため、Idris は `len` が全域であることを検証できます。

では、どのような場合に再帰関数は非全域になるのでしょうか？ 以下の関数は、指定された生成関数（`gen`）が `Nothing` を返すまで値のシーケンスを生成します：

```idris
covering
unfold : (gen : s -> Maybe (s,a)) -> s -> List a
unfold gen vs = case gen vs of
  Just (vs',va) => va :: unfold gen vs'
  Nothing       => []
```

`unfold` では、Idris はどの引数も基底ケースに向かって収束していることを検証できません。そのため、Idris は `unfold` が全域であることを拒絶し、`covering` の注釈が必要になります。実際、以下の関数は無限リストを生成します（メモリを使い果たしてしまうため、REPL で評価しないでください）：

```idris
fiboHelper : (Nat,Nat) -> ((Nat,Nat),Nat)
fiboHelper (f0,f1) = ((f1, f0 + f1), f0)

covering
fibonacci : List Nat
fibonacci = unfold (Just . fiboHelper) (1,1)
```

有限個のフィボナッチ数を安全に生成するには、たとえばリストの長さを制限するなどして、生成関数が有限ステップで停止することを保証する必要があります：

```idris
unfoldTot : Nat -> (gen : s -> Maybe (s,a)) -> s -> List a
unfoldTot 0     _   _  = []
unfoldTot (S k) gen vs = case gen vs of
  Just (vs',va) => va :: unfoldTot k gen vs'
  Nothing       => []

fibonacciN : Nat -> List Nat
fibonacciN n = unfoldTot n (Just . fiboHelper) (1,1)
```

## コールスタック (The Call Stack)

末尾再帰の意義を理解するために、次の `main` 関数を考えてみましょう：

```idris
main : IO ()
main = printLn . len $ replicateList 10000 10
```

もしシステムに [Node.js](https://nodejs.org/ja/) がインストールされているなら、以下の実験を試してみてください。デフォルトの Chez Scheme バックエンドの代わりに Idris の Node.js バックエンドを使ってこのモジュールをコンパイル・実行します：

```sh
idris2 --cg node -o test.js --find-ipkg src/Tutorial/Folds.md
node build/exec/test.js
```

Node.js は `RangeError: Maximum call stack size exceeded` というエラーとスタックトレースを出力してクラッシュします。全域であることが証明されているプログラムなのに、なぜ例外で失敗するのでしょうか？

まず、「全域（total）」とは、**メモリなどの計算リソースが十分にあるという前提の下で**、有限時間内に値を生成することを意味します。Node.js はコールスタックのサイズ制限が非常に小さいため、十分なリソースが与えられていませんでした。**コールスタック** はネストした関数呼び出しが積まれるスタック構造（LIFO）です。再帰関数の場合、再帰呼び出しのたびにスタックサイズが1つずつ増加します。上記の `main` では長さ 10,000 のリストを生成・消費するため、コールスタックには少なくとも 10,000 回分の呼び出しが積まれます。これが Node.js のスタック制限を大幅に超えてしまい、スタックオーバーフローが発生したのです。

なお、Scheme バックエンドはスタック制限がはるかに大きく、内部で最適化を行うためこの問題は発生しにくいですが、JavaScript バックエンドなどをターゲットにする際には極めて重要な考慮事項になります。

## 末尾再帰 (Tail Recursion)

すべての再帰呼び出しが **末尾位置（tail position）**（式の中で最後に評価される関数の位置）にある再帰関数を **末尾再帰（tail recursive）** であると呼びます。たとえば、以下の `lenOnto` は末尾再帰です：

```idris
lenOnto : Nat -> List a -> Nat
lenOnto k []        = k
lenOnto k (_ :: xs) = lenOnto (k + 1) xs
```

先ほどの `len` と比較してみましょう：先ほどの `len` では、最後に呼ばれるのは加算演算子 `(+)` であり、再帰呼び出しはその引数の中で行われていました：

```repl
len (_ :: xs) = 1 + len xs
```

`lenOnto` を使って、追加の `Nat` 引数を持たない末尾再帰版の `len` を実装できます：

```idris
lenTR : List a -> Nat
lenTR = lenOnto 0
```

これは末尾再帰関数を書く際の典型的なパターンです：中間結果を蓄積（アキュムレート）するための引数を1つ追加し、各再帰呼び出しでそれを明示的に渡していきます。以下は `replicateList` の末尾再帰版です：

```idris
replicateListTR : Nat -> a -> List a
replicateListTR n v = go Nil n
  where go : List a -> Nat -> List a
        go xs 0     = xs
        go xs (S k) = go (v :: xs) k
```

末尾再帰関数の最大の利点は、Idris コンパイラによって **効率的な命令型ループ（ループ文）に自動変換** されるため、**スタックセーフ（stack safe）** になる点です。再帰呼び出しがコールスタックに積まれなくなるため、スタックオーバーフローを回避できます。

```idris
main1 : IO ()
main1 = printLn . lenTR $ replicateListTR 10000 10
```

これを Node.js バックエンドで実行すると、スタックオーバーフローを起こさずに正常に完了します：

```sh
$ idris2 --cg node --exec main1 --find-ipkg src/Tutorial/Folds.md
10000
```

末尾再帰関数は、複数の分岐を持つ pattern match で構成されていても、各分岐の末尾で再帰呼び出しが行われていれば問題ありません：

```idris
countTR : (a -> Bool) -> List a -> Nat
countTR p = go 0
  where go : Nat -> List a -> Nat
        go k []        = k
        go k (x :: xs) = case p x of
          True  => go (S k) xs
          False => go k xs
```

## 相互再帰 (Mutual Recursion)

複数の関連する関数が互いを再帰的に呼び出し合う **相互再帰（mutual recursion）** を書きたい場合があります。Idris では型チェック時に実装が必要になる場合があるため、他の関数から呼び出される前に宣言されている必要があります。1つの方法は宣言を先にまとめて書き、後から実装を書くことです：

```idris
even : Nat -> Bool

odd : Nat -> Bool

even 0     = True
even (S k) = odd k

odd 0     = False
odd (S k) = even k
```

宣言と実装を近くにまとめておきたい場合は、`mutual` ブロックを使用できます：

```idris
mutual
  even' : Nat -> Bool
  even' 0     = True
  even' (S k) = odd' k

  odd' : Nat -> Bool
  odd' 0     = False
  odd' (S k) = even' k
```

単一の再帰関数と同様に、相互再帰関数もすべての再帰呼び出しが末尾位置にあれば命令型ループに最適化（相互末尾呼び出し最適化）されます：

```idris
main2 : IO ()
main2 =  printLn (even 100000)
      >> printLn (odd 100000)
```

```sh
$ idris2 --cg node --exec main2 --find-ipkg src/Tutorial/Folds.md
True
False
```

## まとめと留意点

- 純粋関数型プログラミングでは、再帰が反復処理を記述するための基本手段です。
- 再帰関数は、再帰呼び出しごとに引数の1つが真に小さくなっていることを検証できれば全域性チェッカーをパスします。
- 任意の再帰は、スタック制限の厳しいバックエンドでスタックオーバーフローを引き起こす可能性があります。
- Idris の JavaScript バックエンドは末尾呼び出し最適化を行い、末尾再帰関数をスタックセーフなループに変換します。

なお、*prelude* や *base* ライブラリ内の多くの再帰関数は、現時点ではあえて末尾再帰になっていないものがあります。これは、非末尾再帰関数の方がコンパイル時の等式証明において単一化しやすく扱いやすいためです。Idris では実行時のパフォーマンスとコンパイル時の証明の書きやすさのバランスが考慮されています。

<!-- vi: filetype=idris2:syntax=markdown
-->
