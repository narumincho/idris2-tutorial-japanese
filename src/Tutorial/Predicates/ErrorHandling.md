# ユースケース: 柔軟なエラーハンドリング (Use Case: Flexible Error Handling)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/ErrorHandling.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/ErrorHandling.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Predicates.ErrorHandling

import Tutorial.Predicates.Contracts

import Data.Either
import Data.List1
import Data.String
import Data.Vect
import Data.HList
import Decidable.Equality

import Text.CSV
import System.File

%default total
```

規模の大きなアプリケーションを作成する際によく現れるパターンとして、それぞれ固有の失敗型（failure types）を持つプログラムの異なる部分を、ひとつの大きな作用を伴う計算の中で組み合わせるというものがあります。例えば、CSV ファイルを操作するコマンドラインツールを実装した際にもこれを見かけました。そこでは、ファイルからのデータ読み書き、列の型やスキーマのパース、行や列のインデックスのパース、コマンドラインのコマンドのパースなどを行いました。これらの操作はすべて失敗する可能性を秘めており、アプリケーションの異なる部分で実装されている可能性があります。

これらの異なる失敗型を統合するために、以前はそれぞれの型をカプセル化するカスタム直和型（sum type）を作成し、その直和型に対する単一のハンドラを記述しました。そのアプローチはその時点では問題ありませんでしたが、拡張性に乏しく柔軟性にも欠けています。そこで、ここでは別のアプローチを試みます。

まず手始めに、失敗する可能性のあるいくつかの関数とカスタムエラー型を実装します：

```idris
public export
record NoNat where
  constructor MkNoNat
  str : String

readNat' : String -> Either NoNat Nat
readNat' s = maybeToEither (MkNoNat s) $ parsePositive s

public export
record NoColType where
  constructor MkNoColType
  str : String

readColType' : String -> Either NoColType ColType
readColType' "I64"     = Right I64
readColType' "Str"     = Right Str
readColType' "Boolean" = Right Boolean
readColType' "Float"   = Right Float
readColType' s         = Left $ MkNoColType s
```

しかし、`Fin n` をパースしたい場合、すでに失敗の原因が 2 通り存在します。対象の文字列が自然数を表していない場合（`NoNat` エラー）と、範囲外である場合（`OutOfBounds` エラー）です。戻り値の型でこの 2 つの可能性を何らかの形でエンコードする必要があります。例えばエラー型として `Either` を使う方法が考えられます：

```idris
public export
record OutOfBounds where
  constructor MkOutOfBounds
  size  : Nat
  index : Nat

readFin' : {n : _} -> String -> Either (Either NoNat OutOfBounds) (Fin n)
readFin' s = do
  ix <- mapFst Left (readNat' s)
  maybeToEither (Right $ MkOutOfBounds n ix) $ natToFin ix n
```

これは非常に不格好です。カスタム直和型を使えば少しはマシになるかもしれませんが、それでも `readNat'` を呼び出す際に `mapFst` を使う必要があり、エラーの組み合わせごとにカスタム直和型を書くのもすぐに煩雑になってしまいます。

ここで必要となるのは、**一般化された直和型（generalized sum type）** です。つまり、型のリスト（選択肢のリスト）でインデックス付けされ、対象の型のうちちょうど 1 つの値を保持する型です。以下は最初の素朴な試みです：

```idris
data Sum : List Type -> Type where
  MkSum : (val : t) -> Sum ts
```

しかし、これには決定的な情報が欠けています。`t` が `ts` の要素であることも、実際に「どの」型であるかも検証されていません。事実、これは消去された存在型の別の一例であり、実行時に `t` について知る手がかりが一切ありません。

必要なのは、その値の型 `t` が `ts` の要素であるという証明と値をペアにすることです。これにも再び `Elem` を使うことができますが、一部のユースケースではリスト内の型の個数にアクセスする必要があります。そのため、インデックスとしてリストの代わりにベクトル（`Vect`）を使用します。以下は `Elem` に似ていますがベクトルに対する述語です：

```idris
public export
data Has :  (v : a) -> (vs  : Vect n a) -> Type where
  Z : Has v (v :: vs)
  S : Has v vs -> Has v (w :: vs)

export
Uninhabited (Has v []) where
  uninhabited Z impossible
  uninhabited (S _) impossible
```

`Has v vs` 型の値は、`v` が `vs` の要素であることの証拠です。これを使って、インデックス付き直和型（**オープンユニオン / open union** とも呼ばれます）を実装できます：

```idris
public export
data Union : Vect n Type -> Type where
  U : (ix : Has t ts) -> (val : t) -> Union ts

export
Uninhabited (Union []) where
  uninhabited (U ix _) = absurd ix
```

`HList` と `Union` の違いに注意してください。`HList` は **一般化された積型（generalized product type）** であり、インデックス内の各型に対して値を 1 つずつ保持します。一方、`Union` は **一般化された直和型（generalized sum type）** であり、インデックスに列挙された型のいずれか 1 つの値のみを保持します。

これを使って、より柔軟なエラー型を定義できます：

```idris
public export
0 Err : Vect n Type -> Type -> Type
Err ts t = Either (Union ts) t
```

`Err ts a` を返す関数は、`ts` に列挙されたエラーのいずれかで失敗する可能性のある計算を表します。まずユーティリティ関数を用意しましょう。

```idris
inject : (prf : Has t ts) => (v : t) -> Union ts
inject v = U prf v

export
fail : Has t ts => (err : t) -> Err ts a
fail err = Left $ inject err

failMaybe : Has t ts => (err : Lazy t) -> Maybe a -> Err ts a
failMaybe err = maybeToEither (inject err)
```

次に、先ほど書いたパーサーのより柔軟なバージョンを記述できます：

```idris
readNat : Has NoNat ts => String -> Err ts Nat
readNat s = failMaybe (MkNoNat s) $ parsePositive s

readColType : Has NoColType ts => String -> Err ts ColType
readColType "I64"     = Right I64
readColType "Str"     = Right Str
readColType "Boolean" = Right Boolean
readColType "Float"   = Right Float
readColType s         = fail $ MkNoColType s
```

`readFin` を実装する前に、複数のエラー型が存在しなければならないことを指定するためのショートカットを導入します：

```idris
public export
0 Errs : List Type -> Vect n Type -> Type
Errs []        _  = ()
Errs (x :: xs) ts = (Has x ts, Errs xs ts)
```

関数 `Errs` は制約のタプルを返します。これは、列挙されたすべての型が型のベクトル内に存在することの証拠として使用できます。Idris は必要に応じてタプルから証明を自動的に抽出します。

```idris
export
readFin : {n : _} -> Errs [NoNat, OutOfBounds] ts => String -> Err ts (Fin n)
readFin s = do
  S ix <- readNat s | Z => fail (MkOutOfBounds n Z)
  failMaybe (MkOutOfBounds n (S ix)) $ natToFin ix n
```

最後の例として、スキーマと CSV 行のパーサーを以下に示します：

```idris
fromCSV : String -> List String
fromCSV = forget . split (',' ==)

public export
record InvalidColumn where
  constructor MkInvalidColumn
  str : String

readColumn : Errs [InvalidColumn, NoColType] ts => String -> Err ts Column
readColumn s = case forget $ split (':' ==) s of
  [n,ct] => MkColumn n <$> readColType ct
  _      => fail $ MkInvalidColumn s

export
readSchema : Errs [InvalidColumn, NoColType] ts => String -> Err ts Schema
readSchema = traverse readColumn . fromCSV

public export
data RowError : Type where
  InvalidField  : (row, col : Nat) -> (ct : ColType) -> String -> RowError
  UnexpectedEOI : (row, col : Nat) -> RowError
  ExpectedEOI   : (row, col : Nat) -> RowError

decodeField :  Has RowError ts
            => (row,col : Nat)
            -> (c : ColType)
            -> String
            -> Err ts (IdrisType c)
decodeField row col c s =
  let err = InvalidField row col c s
   in case c of
        I64     => failMaybe err $ read s
        Str     => failMaybe err $ read s
        Boolean => failMaybe err $ read s
        Float   => failMaybe err $ read s

export
decodeRow :  Has RowError ts
          => {s : _}
          -> (row : Nat)
          -> (str : String)
          -> Err ts (Row s)
decodeRow row = go 1 s . fromCSV
  where go : Nat -> (cs : Schema) -> List String -> Err ts (Row cs)
        go k []       []                    = Right []
        go k []       (_ :: _)              = fail $ ExpectedEOI row k
        go k (_ :: _) []                    = fail $ UnexpectedEOI row k
        go k (MkColumn n c :: cs) (s :: ss) =
          [| decodeField row k c s :: go (S k) cs ss |]
```

以下は `readSchema` をテストする REPL セッションの例です。便宜上 `:let` コマンドを使って変数 `ts` を定義しています。エラー型のリストに `InvalidColumn` と `NoColType` が含まれてさえいれば、エラー型の順序は関係ない点に注目してください：

```repl
Tutorial.Predicates> :let ts = the (Vect 3 _) [NoColType,NoNat,InvalidColumn]
Tutorial.Predicates> readSchema {ts} "foo:bar"
Left (U Z (MkNoColType "bar"))
Tutorial.Predicates> readSchema {ts} "foo:Float"
Right [MkColumn "foo" Float]
Tutorial.Predicates> readSchema {ts} "foo Float"
Left (U (S (S Z)) (MkInvalidColumn "foo Float"))
```

## エラーハンドリング (Error Handling)

エラーを処理するテクニックにはいくつかあり、いずれも状況に応じて役立ちます。例えば、一部のエラーを早期に個別で処理し、他のエラーはアプリケーションのずっと後で処理したい場合があります。あるいは、すべてのエラーを一挙にまとめて処理したい場合もあります。ここでは両方のアプローチを見ていきます。

まず、単一のエラーを個別に処理するには、ユニオンを 2 つの可能性（対象のエラー型の値であるか、他のエラー型のいずれかを保持する新しいユニオンであるか）に **分割（split）** する必要があります。これには、ベクトル内の値の存在だけでなく、その値を削除した結果もエンコードする新しい述語が必要です：

```idris
data Rem : (v : a) -> (vs : Vect (S n) a) -> (rem : Vect n a) -> Type where
  [search v vs]
  RZ : Rem v (v :: rem) rem
  RS : Rem v vs rem -> Rem v (w :: vs) (w :: rem)
```

ここでも、インデックスの 1 つ（`rem`）を関数の戻り値の型で使いたいため、証明探索中は他のインデックスのみを使用します。オープンユニオンから値を切り離す関数は以下のようになります：

```idris
split : (prf : Rem t ts rem) => Union ts -> Either t (Union rem)
split {prf = RZ}   (U Z     val) = Left val
split {prf = RZ}   (U (S x) val) = Right (U x val)
split {prf = RS p} (U Z     val) = Right (U Z val)
split {prf = RS p} (U (S x) val) = case split {prf = p} (U x val) of
  Left vt        => Left vt
  Right (U ix y) => Right $ U (S ix) y
```

これはユニオンから型 `t` の値を抽出しようとします。成功した場合は結果が `Left` にラップされ、そうでない場合は `Right` で新しいユニオンが返されます。この新しいユニオンの型のリストからは `t` が削除されています。

これを使って、単一のエラーに対するハンドラを実装できます。エラーハンドリングは作用を伴うコンテキストで発生することが多い（コンソールにメッセージを表示したり、ログファイルにエラーを書き込んだりする）ため、エラーを処理する環境として Applicative 作用型を使用します。

```idris
handle :  Applicative f
       => Rem t ts rem
       => (h : t -> f a)
       -> Err ts a
       -> f (Err rem a)
handle h (Left x)  = case split x of
  Left v    => Right <$> h v
  Right err => pure $ Left err
handle _ (Right x) = pure $ Right x
```

すべてのエラーを一度に処理するには、エラーのベクトルでインデックス付けされ、出力型でパラメータ化されたハンドラ型を使用できます：

```idris
namespace Handler
  public export
  data Handler : (ts : Vect n Type) -> (a : Type) -> Type where
    Nil  : Handler [] a
    (::) : (t -> a) -> Handler ts a -> Handler (t :: ts) a

extract : Handler ts a -> Has t ts -> t -> a
extract (f :: _)  Z     val = f val
extract (_ :: fs) (S y) val = extract fs y val
extract []        ix    _   = absurd ix

handleAll : Applicative f => Handler ts (f a) -> Err ts a -> f a
handleAll _ (Right v)       = pure v
handleAll h (Left $ U ix v) = extract h ix v
```

以下では、エラーハンドリング用のカスタムインターフェースを定義することで、すべてのエラーを一度に処理するもうひとつの方法を見ていきます。

<!-- vi: filetype=idris2:syntax=markdown
-->
