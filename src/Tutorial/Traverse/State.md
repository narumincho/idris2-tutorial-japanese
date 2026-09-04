# 状態を用いたプログラミング (Programming with State)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Traverse/State.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Traverse/State.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Traverse.State

import Data.HList
import Data.IORef
import Data.List1
import Data.String
import Data.Validated
import Data.Vect
import Text.CSV

%default total
```

CSV リーダーの話に戻りましょう。適切なエラーメッセージを得るために、各行にその行インデックスを付与したいとします：

```idris
zipWithIndex : List a -> List (Nat, a)
```

アドホックな再帰関数で実装するのは簡単です：

```idris
zipWithIndex = go 1
  where go : Nat -> List a -> List (Nat,a)
        go _ []        = []
        go n (x :: xs) = (n,x) :: go (S n) xs
```

しかし、ツリーやベクトル、非空リストなどの要素に対しても同じことを行いたい場合、抽象化できるパターンはないでしょうか？

## Idris における可変参照 (Mutable References)

命令型言語であれば、現在のインデックスを保持するローカル（可変）変数を定義し、ループ内でインクリメントしていくでしょう。

Idris は純粋関数型言語ですが、`IO` の世界であれば `Data.IORef` を使って本物の可変参照を扱うことができます。

```idris
pairWithIndexIO : IORef Nat -> a -> IO (Nat,a)
pairWithIndexIO ref va = do
  ix <- readIORef ref
  writeIORef ref (S ix)
  pure (ix,va)
```

`pairWithIndexIO ref` の型は `a -> IO (Nat, a)` です。これをリストの各要素に適用して `IO (List (Nat, a))` を得る操作は、まさに `traverse` そのものです：

```idris
zipListWithIndexIO : IORef Nat -> List a -> IO (List (Nat,a))
zipListWithIndexIO ref = traverse (pairWithIndexIO ref)
```

これは `List` だけでなく任意の `Traversable` コンテナに適用できます：

```idris
zipWithIndexIO : Traversable t => IORef Nat -> t a -> IO (t (Nat,a))
zipWithIndexIO ref = traverse (pairWithIndexIO ref)

zipWithIndexIO' : Traversable t => IORef Nat -> t a -> IO (t (Nat,a))
zipWithIndexIO' = traverse . pairWithIndexIO

zipFromZeroIO : Traversable t => t a -> IO (t (Nat,a))
zipFromZeroIO ta = newIORef 0 >>= (`zipWithIndexIO` ta)
```

REPL で動作確認してみます：

```repl
> :exec zipFromZeroIO {t = List} ["hello", "world"] >>= printLn
[(0, "hello"), (1, "world")]
> :exec zipFromZeroIO (Just 12) >>= printLn
Just (0, 12)
> :exec zipFromZeroIO {t = Vect 2} ["hello", "world"] >>= printLn
[(0, "hello"), (1, "world")]
```

## State モナド (The State Monad)

上記の `IO` を用いた解法はエレガントですが、本来純粋であるべき処理が `IO` に汚染されてしまうという問題があります。

純粋な関数型プログラミングにおいて、「状態を持つ純粋な計算」の本質は次の 2 つです：

1. **現在の状態へのアクセス**: 現在の状態を引数として受け取る。
2. **更新された状態の伝達**: 計算結果と更新後の状態のペア `(st, a)` を返す。

これらを型として表すと、純粋な状態付き計算は `st -> (st, a)` という関数型になります：

```idris
Stateful : (st : Type) -> (a : Type) -> Type
Stateful st a = st -> (st, a)

pairWithIndex' : a -> Stateful Nat (Nat,a)
pairWithIndex' v index = (S index, (index,v))
```

インターフェース実装を持たせるために、これをレコード型 `State` でラップします：

```idris
public export
record State st a where
  constructor ST
  runST : st -> (st,a)
```

これを用いて `pairWithIndex` や状態操作のユーティリティを定義できます：

```idris
export
pairWithIndex : a -> State Nat (Nat,a)
pairWithIndex v = ST $ \index => (S index, (index, v))

-- 現在の状態を取得
export
get : State st st
get = ST $ \s => (s,s)

-- 状態を上書き
export
put : st -> State st ()
put v = ST $ \_ => (v,())

-- 状態を変更
export
modify : (st -> st) -> State st ()
modify f = ST $ \v => (f v,())

export
runState : st -> State st a -> (st, a)
runState = flip runST

export
evalState : st -> State st a -> a
evalState s = snd . runState s

export
execState : st -> State st a -> st
execState s = fst . runState s
```

そして、`State st` は `Functor`、`Applicative`、`Monad` のインスタンスになります：

```idris
export
Functor (State st) where
  map f (ST run) = ST $ \s => let (s2,va) = run s in (s2, f va)

export
Applicative (State st) where
  pure v = ST $ \s => (s,v)

  ST fun <*> ST val = ST $ \s =>
    let (s2, f)  = fun s
        (s3, va) = val s2
     in (s3, f va)

export
Monad (State st) where
  ST val >>= f = ST $ \s =>
    let (s2, va) = val s
     in runST (f va) s2
```

更新された状態が確実に後続の計算へ引き渡されていく（スレッドされる）ことで、純粋性を保ったまま状態付きプログラミングが可能になります。

<!-- vi: filetype=idris2:syntax=markdown
-->
