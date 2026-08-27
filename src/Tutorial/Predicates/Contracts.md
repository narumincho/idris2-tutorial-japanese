# 値どうしの契約 (Contracts between Values)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Contracts.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Contracts.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Predicates.Contracts

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

これまで見てきた述語は単一の型の値を制約するものでしたが、異なる複数の型の値の間にある「契約」を記述する述語を定義することも可能です。

## `Elem` 述語 (The `Elem` Predicate)

ヘテロジニアスリスト（`HList`）から指定した型の値を抽出したいとしましょう：

```idris
get' : (0 t : Type) -> HList ts -> t
```

一般にはこれは成り立ちません。もしこれが実装できてしまうと、即座に空虚（`Void`）の証明が手に入ってしまうからです：

```idris
voidAgain : Void
voidAgain = get' Void []
```

問題は明白です。値を取り出したい型 `t` は、ヘテロジニアスリストのインデックス（型のリスト）の要素でなければなりません。これを表現できる述語が以下です：

```idris
public export
data Elem : (elem : a) -> (as : List a) -> Type where
  Here  : Elem x (x :: xs)
  There : Elem x xs -> Elem x (y :: xs)
```

これは 2 つの値（型 `a` の値と、`a` のリスト）の間の契約を記述する述語です。この述語の値は、その値がリストの要素であることの証拠（witness）となります。この定義が再帰的である点に注目してください：
- 探している値がリストの先頭にあるケースは `Here` コンストラクタで扱われます（要素とリストの先頭に同じ変数 `x` が使われています）。
- 探している値がリストのより深い場所にあるケースは `There` コンストラクタで扱われます。これは「`x` が `xs` の要素であるならば、任意の `y` に対して `x` は `y :: xs` の要素でもある」と読めます。

感覚を掴むためにいくつか例を書いてみましょう：

```idris
MyList : List Nat
MyList = [1,3,7,8,4,12]

oneElemMyList : Elem 1 MyList
oneElemMyList = Here

sevenElemMyList : Elem 7 MyList
sevenElemMyList = There $ There Here
```

`Elem` は、値のリストに対するもうひとつのインデックス付けの方法と言えます。リストの長さによって制限される `Fin` インデックスを使う代わりに、「値が特定の位置に見つかる」という証明を使用します。

この `Elem` 述語を使って、ヘテロジニアスリストから目的の型の値を抽出できます：

```idris
get : (0 t : Type) -> HList ts -> (prf : Elem t ts) => t
```

ここで重要なのは、自動暗黙引数 `prf` を消去（多重度 0）にしてはならない点です。これは単一値データ型ではないため、値がヘテロジニアスリストのどれくらい奥に格納されているかを把握するために、この値にパターンマッチする必要があるからです：

```idris
get t (v :: vs) {prf = Here}    = v
get t (v :: vs) {prf = There p} = get t vs
get _ [] impossible
```

右辺にホールを使って `get` を自分で実装してみると、Idris が `Elem` 述語の値に基づいて推論するコンテキストや値の型を確認できて勉強になります。

REPL で試してみましょう：

```repl
Tutorial.Predicates> get Nat ["foo", Just "bar", S Z]
1
Tutorial.Predicates> get Nat ["foo", Just "bar"]
Error: Can't find an implementation for Elem Nat [String, Maybe String].

(Interactive):1:1--1:28
 1 | get Nat ["foo", Just "bar"]
     ^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

この例を見ると、**証明探索（proof search）** が実際に何を意味するのかが実感できるでしょう。値 `v` と値のリスト `vs` が与えられると、Idris は `v` が `vs` の要素であるという証明を自動で見つけ出そうとします。

なお、証明探索は万能ではありません。探索アルゴリズムには適切な **探索深度（search depth）** の制限があり、この制限を超えると探索は失敗します。例えば：

```idris
Tps : List Type
Tps = List.replicate 50 Nat ++ [Maybe String]

hlist : HList Tps
hlist = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        , 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        , Nothing ]
```

REPL で実行すると：

```repl
Tutorial.Predicates> get (Maybe String) hlist
Error: Can't find an implementation for Elem (Maybe String) [Nat,...
```

このように、Idris は `Maybe String` が `Tps` の要素であるという証明の探索に失敗します。探索深度は `%auto_implicit_depth` ディレクティブで増やすことができ、ソースファイルの残り（または別の値に設定されるまで）有効になります。デフォルト値は 25 です。一般に、これを大きすぎる値に設定するとコンパイル時間が大幅に増加するため推奨されません。

```idris
%auto_implicit_depth 100
aMaybe : Maybe String
aMaybe = get _ hlist

%auto_implicit_depth 25
```

## ユースケース: より扱いやすいスキーマ (A nicer Schema)

シグマ型の章では、CSV ファイル用のスキーマを導入しました。しかし、特定の列にアクセスするために自然数のインデックスを使わなければならず、あまり使い勝手が良くありませんでした。さらに悪いことに、この小さなライブラリのユーザーも同様にインデックスを使わざるを得ず、各列に名前をつけて名前でアクセスする方法がありませんでした。今回はこれを改善します。以下はこのユースケースのエンコーディングです：

```idris
public export
data ColType = I64 | Str | Boolean | Float

public export
IdrisType : ColType -> Type
IdrisType I64     = Int64
IdrisType Str     = String
IdrisType Boolean = Bool
IdrisType Float   = Double

public export
record Column where
  constructor MkColumn
  name : String
  type : ColType

infixr 8 :>

public export
(:>) : String -> ColType -> Column
(:>) = MkColumn

public export
Schema : Type
Schema = List Column

export
Show ColType where
  show I64     = "I64"
  show Str     = "Str"
  show Boolean = "Boolean"
  show Float   = "Float"

Show Column where
  show (MkColumn n ct) = "\{n}:\{show ct}"

export
showSchema : Schema -> String
showSchema = concat . intersperse "," . map show
```

このように、スキーマの中で列の型とその名前をペアにします。企業の従業員情報を保持する CSV ファイルのスキーマ例は以下のようになります：

```idris
EmployeeSchema : Schema
EmployeeSchema = [ "firstName"  :> Str
                 , "lastName"   :> Str
                 , "email"      :> Str
                 , "age"        :> I64
                 , "salary"     :> Float
                 , "management" :> Boolean
                 ]
```

このようなスキーマはもちろんユーザー入力から読み込むことも可能ですが、パーサーの実装は本章の後半まで待つことにします。この新しいスキーマを直接 `HList` と組み合わせて使うと型推論の問題が生じたため、カスタムの行型（スキーマでインデックス付けされたヘテロジニアスリスト）を用意しました：

```idris
public export
data Row : Schema -> Type where
  Nil  : Row []

  (::) :  {0 name : String}
       -> {0 type : ColType}
       -> (v : IdrisType type)
       -> Row ss
       -> Row (name :> type :: ss)
```

*cons* のシグネチャでは、消去される暗黙引数を明示的に列挙しています。これを行わないと、クライアントコードでこのようなデータコンストラクタを使用する際に Idris がシャドーイングの警告を出すことが多いため、良い習慣です。

従業員を表す CSV 行の型エイリアスを定義できます：

```idris
0 Employee : Type
Employee = Row EmployeeSchema

hock : Employee
hock = [ "Stefan", "Höck", "hock@foo.com", 46, 5443.2, False ]
```

`Employee` に多重度 0（zero quantity）を与えている点に注目してください。これにより、この関数はコンパイル時のみに使用可能で、実行時には決して使用できなくなります。これは、アプリケーションをビルドする際に型レベルの関数やエイリアスが実行可能バイナリに漏れ出さないようにするための安全な手法です。多重度 0 の関数や値は、型シグネチャや他の消去される値の計算では使えますが、実行時に関係する計算には使用できません。

次に、指定された名前に基づいて行の値にアクセスしたいと考えます。このために、指定された名前の列がスキーマの一部であることの証拠となるカスタム述語を作成します。ここで重要な点があります。この述語には、指定された名前を持つ列の「型」に対するインデックスを含めています。名前で列にアクセスする際、戻り値の型を把握する方法が必要だからです。しかし証明探索の間、この型は対象の列名とスキーマに基づいて Idris が導出する必要があります（そうでなければ、戻り値の型が事前に分かっていない限り証明探索は失敗します）。したがって、Idris に対してこの型を探索条件のリストに含めないよう指示する **必要があります**。そうしないと、証明探索を実行する前にコンテキストから（型推論を用いて）列の型を推論しようとしてしまうからです。これは、`[search name schema]` のように探索に使用するインデックスを明示的に指定することで実現できます。

```idris
public export
data InSchema :  (name    : String)
              -> (schema  : Schema)
              -> (colType : ColType)
              -> Type where
  [search name schema]
  IsHere  : InSchema n (n :> t :: ss) t
  IsThere : InSchema n ss t -> InSchema n (fld :: ss) t

export
Uninhabited (InSchema n [] c) where
  uninhabited IsHere impossible
  uninhabited (IsThere _) impossible
```

これにより、列名に基づいて特定の列の値にアクセスする準備が整いました：

```idris
export
getAt :  {0 ss : Schema}
      -> (name : String)
      -> (row  : Row ss)
      -> (prf  : InSchema name ss c)
      => IdrisType c
getAt name (v :: vs) {prf = IsHere}    = v
getAt name (_ :: vs) {prf = IsThere p} = getAt name vs
```

以下はコンパイル時にこれを使用する例です。Idris がどれだけの作業を肩代わりしてくれているかに注目してください。まず `firstName`、`lastName`、`age` が確かに `Employee` スキーマの有効な名前であるという証明を生成します。これらの証明から `getAt` の呼び出しの戻り値の型を自動的に割り出し、行から対応する値を抽出します。これらすべてが、全域性が証明可能かつ型安全な方法で行われます。

```idris
shoeck : String
shoeck =  getAt "firstName" hock
       ++ " "
       ++ getAt "lastName" hock
       ++ ": "
       ++ show (getAt "age" hock)
       ++ " years old."
```

実行時に列名を指定するためには、列名と対象のスキーマを比較して `InSchema` 型の値を計算する手段が必要です。命題的に等しいかどうか 2 つの文字列値を比較する必要があるため、ここでは `String` の `DecEq` 実装を使用します（Idris はすべてのプリミティブに対して `DecEq` 実装を提供しています）。同時に列の型を抽出し、これを（依存ペアとして）`InSchema` の証明とペアにします：

```idris
export
inSchema : (ss : Schema) -> (n : String) -> Maybe (c ** InSchema n ss c)
inSchema []                    _ = Nothing
inSchema (MkColumn cn t :: xs) n = case decEq cn n of
  Yes Refl   => Just (t ** IsHere)
  No  contra => case inSchema xs n of
    Just (t ** prf) => Just $ (t ** IsThere prf)
    Nothing         => Nothing
```

本章の最後では、CSV コマンドラインアプリケーションにおいて列のすべての値を一覧表示するために `InSchema` を使用します。

<!-- vi: filetype=idris2:syntax=markdown
-->
