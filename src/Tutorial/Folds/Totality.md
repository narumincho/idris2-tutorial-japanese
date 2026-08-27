# 全域性チェックに関する補足 (Notes on Totality Checking)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Totality.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Totality.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Folds.Totality

%default total
```

Idris の全域性チェッカーは、再帰呼び出しにおける少なくとも1つの（消去されている可能性もある）引数が基底ケースに向かって収束しているかを検証します。たとえば自然数の場合、基底ケースが 0（データコンストラクタ `Z`）であり、`S k` に対するパターンマッチの後に `k` を渡していれば、Idris は `Nat` のコンストラクタの構造から `k` が `S k` より真に小さいことを導出し、再帰が必ず終了すると判断できます。リストをパターンマッチして末尾（tail）のみを再帰呼び出しに渡す場合も全く同じ推論が行われます。

これは多くのケースで機能しますが、常に期待通りにいくとは限りません。以下では、人間から見れば確実に全域であるにもかかわらず、全域性チェックが失敗する代表的な例を紹介します。

## ケース 1: プリミティブ型に対する再帰

Idris はプリミティブデータ型の内部構造を認識していません。そのため、明らかに有限回で終了する以下の関数であっても、全域性チェッカーには受け入れられません：

```idris
covering
replicatePrim : Bits32 -> a -> List a
replicatePrim 0 v = []
replicatePrim x v = v :: replicatePrim (x - 1) v
```

帰納的データ型として定義されている自然数（`Nat`）とは異なり、Idris は `x - 1` が `x` より真に小さいことを判定できないため、基底ケースに収束することを検証できません（`x - 1` はコンパイラ組み込みのプリミティブ関数 `prim__sub_Bits32` で実装されているためです）。

非全域性（partial）は伝播するため（部分関数を呼び出す関数はすべて全域性チェッカーによって部分関数と見なされる）、全域性チェッカーを納得させて関数に `total` を付与するためのユーティリティ関数 `assert_smaller` が用意されています：

```idris
replicatePrim' : Bits32 -> a -> List a
replicatePrim' 0 v = []
replicatePrim' x v = v :: replicatePrim' (assert_smaller x $ x - 1) v
```

ただし、`assert_smaller` を使って全域性チェッカーを黙らせる場合、全域性を証明する責任はプログラマ自身に委ねられます。誤った使い方をすると、予期せぬプログラムの挙動を引き起こす可能性があります。

### 偽からは何でも導ける (Ex Falso Quodlibet)

デモンストレーションとして、`Void` の簡単な「偽の証明」を示します。`Void` は値を持たない **無人型（uninhabited type）** です。`Void` を証明する（`Void` 型の値を返す関数を全域性チェッカーに通す）ことができてしまうと、型システムが提供するすべての安全性の保証を完全に無効化できてしまいます：

```idris
-- `Void` を証明するために、`assert_smaller` を悪用して無限ループを全域と誤認させる
proofOfVoid : Bits8 -> Void
proofOfVoid n = proofOfVoid (assert_smaller n n)

-- `Void` 型の値からは何でも導ける！
-- `Void` 型の値は存在しないため、この関数自体は安全で全域的
exFalsoQuodlibet : Void -> a
exFalsoQuodlibet _ impossible

-- `proofOfVoid` を `exFalsoQuodlibet`（Prelude では `void` としてエクスポート）に渡すことで、
-- 任意の値を任意の別の型の値にキャストできてしまう。
-- これにより型チェックは完全に無力化される。
coerce : a -> b
coerce _ = exFalsoQuodlibet (proofOfVoid 0)

-- 文字列を期待する `putStrLn` に整数を渡せてしまう
pain : IO ()
pain = putStrLn $ coerce 0
```

`coerce` は「任意の値を任意の別の型に変換できる」と主張し、実装には全域関数しか使われていないため型上は完全に安全に見えます。問題は当然ながら、`proofOfVoid` を全域関数として偽装してしまった点にあります。

これを実行すると、当然ながら実行時エラーでクラッシュします：

```sh
$ idris2 --cg node --exec pain --find-ipkg src/Tutorial/Folds.md
ERROR: No clauses
```

このように、たった1箇所で `assert_smaller` を不適切に使用するだけで、型安全性と全域性が一瞬で崩壊します。使用には細心の注意を払ってください。

## ケース 2: 高階関数経由の再帰

以下は [ローズツリー（Rose Tree / 多分木）](https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%84%E3%83%AA%E3%83%BC) の実装です：

```idris
record Tree a where
  constructor Node
  value  : a
  forest : List (Tree a)

Forest : Type -> Type
Forest = List . Tree
```

この木のサイズを計算しようとすると、以下のようになります：

```idris
covering
size : Tree a -> Nat
size (Node _ forest) = S . sum $ map size forest
```

上記のコードでは、再帰呼び出しが `map` の内部で行われています。人間は `forest` の各要素（部分木）に対して再帰していることがわかりますが、Idris は `map` の中身まで追跡してそれを認識することができません。そのため、全域関数として承認されません。

これに対処する安全な方法は、**相互再帰** を使って明示的な再帰関数を書くことです：

```idris
mutual
  treeSize : Tree a -> Nat
  treeSize (Node _ forest) = S $ forestSize forest

  forestSize : Forest a -> Nat
  forestSize []        = 0
  forestSize (x :: xs) = treeSize x + forestSize xs
```

これならば、Idris は各再帰ステップで引数が真に小さくなっていることを検証できます。

一方、ボイラープレートを書くのが極めて面倒な場合（たとえば `Show` インスタンスの実装など）のために、最終手段として `assert_total` というマクロも提供されています：

```idris
Show a => Show (Tree a) where
  showPrec p (Node v ts) =
    assert_total $ showCon p "Node" (showArg v ++ showArg ts)
```

`assert_total` も `assert_smaller` と同様のリスクを伴うため、慎重に使用する必要があります。

<!-- vi: filetype=idris2:syntax=markdown
-->
