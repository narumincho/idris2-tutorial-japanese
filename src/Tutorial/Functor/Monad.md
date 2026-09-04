# Monad (モナド)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Monad.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Monad.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Functor.Monad

import Tutorial.Functor.Functor
import Tutorial.Functor.Applicative

import Data.List1
import Data.String
import Data.Vect

%default total
```

ついに **`Monad`（モナド）** です。モナドについてはこれまで多くの説明や解説が書かれてきましたが、`IO` の章ですでに学んだこと以上の複雑な概念はほとんどありません。`Monad` は `Applicative` を拡張し、関連する2つの新しい関数を追加します：*bind* 演算子（`(>>=)`）と `join` 関数です。以下はその定義です：

```idris
interface Applicative' m => Monad' m where
  bind  : m a -> (a -> m b) -> m b
  join' : m (m a) -> m a
```

`Monad` の実装者は、`(>>=)` または `join` のいずれか一方（あるいは両方）を自由に実装できます。練習問題で、`join` を *bind* を使って実装する方法、およびその逆を体験します。

`Monad` と `Applicative` の決定的な違いは、**前の計算の結果に依存して次の計算を決定できるかどうか** です。たとえば、標準入力から読み取った文字列に基づいて、ファイルを削除するか音楽を再生するかを決定できます。1つ目の `IO` アクションの結果（ユーザー入力）が、次に実行する `IO` アクションを左右します。これは *apply* 演算子 `(<*>)` では不可能です：

```repl
(<*>) : IO (a -> b) -> IO a -> IO b
```

`(<*>)` に引数として渡された時点で、2つの `IO` アクションはすでに確定しています。一般論として、1つ目の結果が2つ目にどの計算を実行するかに影響を与えることはできません。

この違いを具体例で見てみましょう。CSV リーダーを拡張して、トークンの行を直和型（sum type）にデコードできるようにしたいとします。たとえば、CSV ファイルの行から CRUD リクエストをデコードします：

```idris
data Crud : (i : Type) -> (a : Type) -> Type where
  Create : (value : a) -> Crud i a
  Update : (id : i) -> (value : a) -> Crud i a
  Read   : (id : i) -> Crud i a
  Delete : (id : i) -> Crud i a
```

行ごとにどのデータコンストラクタを選択するかを決定する手段が必要です。その1つの方法は、CSV の第1列にデータコンストラクタ名（または識別タグ）を配置することです：

```idris
hlift : (a -> b) -> HList [a] -> b
hlift f [x] = f x

hlift2 : (a -> b -> c) -> HList [a,b] -> c
hlift2 f [x,y] = f x y

decodeCRUD :  CSVField i
           => CSVField a
           => (line : Nat)
           -> (s    : String)
           -> Either CSVError (Crud i a)
decodeCRUD l s =
  let h ::: t = split (',' ==) s
   in do
     MkName n <- readField l 1 h
     case n of
       "Create" => hlift  Create  <$> decodeAt l 2 t
       "Update" => hlift2 Update  <$> decodeAt l 2 t
       "Read"   => hlift  Read    <$> decodeAt l 2 t
       "Delete" => hlift  Delete  <$> decodeAt l 2 t
       _        => Left (FieldError l 1 n)
```

重要なのは、1つ目のパース結果に対してパターンマッチを行い、その値に応じて使用するデータコンストラクタ、ひいては次に適用するパース関数を決定している点です。

REPL での動作は以下のようになります：

```repl
Tutorial.Functor> decodeCRUD {i = Nat} {a = Email} 1 "Create,jon@doe.ch"
Right (Create (MkEmail "jon@doe.ch"))
Tutorial.Functor> decodeCRUD {i = Nat} {a = Email} 1 "Update,12,jane@doe.ch"
Right (Update 12 (MkEmail "jane@doe.ch"))
Tutorial.Functor> decodeCRUD {i = Nat} {a = Email} 1 "Delete,jon@doe.ch"
Left (FieldError 1 2 "jon@doe.ch")
```

まとめると、`Monad` は `Applicative` と異なり、中間結果が後続の計算の振る舞いに影響を与えるような順次的な計算チェーンを記述できます。互いに独立した複数のエフェクトフルな計算を純粋な多引数関数で結合したいだけであれば `Applicative` で十分です。しかし、エフェクトフルな計算の結果に基づいて次に実行する計算を分岐・決定したい場合は `Monad` が必要になります。

ただし、`Monad` には `Applicative` に比べて1つの大きな弱点があります：**一般にモナド同士は合成できない** という点です。たとえば、`Either e . IO` に対する汎用的な `Monad` インスタンスは作れません。後の章で、他のモナドと合成可能なモナド変換子（monad transformers）について学びます。

## モナド則 (Monad Laws)

モナドが満たすべき法則は以下の通りです：

- `ma >>= pure = ma` および `pure v >>= f = f v`：モナドの **単位元（Identity）** 則。`pure` が *bind* に関して中立に振る舞うことを要求します。
- `(m >>= f) >>= g = m >>= (f >=> g)`：モナドの **結合律（Associativity）**。演算子 `(>=>)`（Kleisli 結合）はエフェクトフルな関数同士を合成する演算子です：

  ```repl
  Tutorial.Functor> :t (>=>)
  Prelude.>=> : Monad m => (a -> m b) -> (b -> m c) -> a -> m c
  ```

さらに、Idris や Haskell では `Monad` が `Applicative` を継承しているため、次の整合性の法則も満たす必要があります：
- `mf <*> ma = mf >>= (\fun => map (fun $) ma)`（`(<*>)` の振る舞いは、`(>>=)` で実装した場合と同一でなければならない）。

<!-- vi: filetype=idris2:syntax=markdown
-->
