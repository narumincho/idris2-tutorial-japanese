# Idris プロジェクトの構成方法 (Structuring Idris Projects)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Appendices/Projects.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Appendices/Projects.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

本節では、規模の大きい Idris プロジェクトの整理、インストール、および依存関係の管理方法について説明します。Idris パッケージ、モジュールシステム、型や関数の可視性（スコープ）、コメントやドキュメント文字列の書き方、そしてライブラリ管理に pack を使用する方法を見ていきます。

この節は、すでに Idris コードを少し書いたことのあるすべての読者にとって役立つはずです。ここでは高度な型レベルの魔法は行いませんが、これまで見たことがないかもしれない `failing` コードブロックを使用していくつかの概念を説明します。この比較的新しい言語機能により、エラボレーション（型チェック）中に失敗することが期待されるコードを記述できます。例えば：

```repl
failing "Can't find an implementation for FromString Bits8."
  ohno : Bits8
  ohno = "Oh no!"
```

`failing` ブロックの一部として、ドキュメント目的およびブロックが期待通りのエラーで失敗することを確認するために、コンパイラのエラーメッセージの部分文字列を指定できます。

## モジュール (Modules)

すべての Idris ソースファイルは **モジュール（module）** を定義し、通常は以下のようなモジュールヘッダーで始まります：

```idris
module Appendices.Projects
```

モジュール名はドットで区切られたいくつかの大文字で始まる識別子で構成され、モジュールが格納されている `.idr` ファイルのパスを反映している必要があります。例えば、このモジュールは `Appendices/Projects.md` に格納されているため、モジュール名は `Appendices.Projects` になります。

「ちょっと待って！」と思われるかもしれません。「`Appendices` の親フォルダはどうしてモジュール名の一部になっていないの？」と。これを理解するためには、**ソースディレクトリ（source directory）** の概念について説明する必要があります。ソースディレクトリとは、Idris がソースファイルを探す場所のことです。デフォルトでは、Idris 実行ファイルが実行されたディレクトリになります。例えば、このプロジェクトの `src` フォルダにいる場合、以下のようにソースファイルを開くことができます：

```sh
idris2 Appendices/Projects.md
```

しかし、このプロジェクトのルートフォルダから同じことを試みても動作しません：

```sh
$ idris2 src/Appendices/Projects.md
...
Error: Module name Appendices.Projects does not match file name "src/Appendices/Projects.md"
...
```

つまり、モジュール名にどのフォルダ名を含めるかは、ソースディレクトリと見なす親フォルダに依存します。ソースディレクトリに `src` という名前を付けるのが一般的な慣習ですが、これは必須ではありません（上記のように、デフォルトは Idris を実行するディレクトリです）。`--source-dir` コマンドラインオプションを使用すると、ソースディレクトリを変更できます。以下はプロジェクトのルートディレクトリから動作します：

```sh
idris2 --source-dir src src/Appendices/Projects.md
```

また、以下は親ディレクトリから動作します（このチュートリアルが `tutorial` フォルダに保存されていると仮定）：

```sh
idris2 --source-dir tutorial/src tutorial/src/Appendices/Projects.md
```

ただし、通常はプロジェクト用の `.ipkg` ファイルを用意し（本節の後半で説明）、そこでソースディレクトリを定義します。その後は、（`idris2` 実行ファイルの代わりに）pack を使用して REPL セッションを開始したりソースファイルを読み込んだりできます。

### モジュールのインポート (Module Imports)

Idris コードを書く際、他のモジュールから関数やデータ型をインポートする必要が頻繁に生じます。これは `import` 文で行うことができます。以下にいくつかの例を示します：

```idris
import Data.String
import Data.List
import Text.CSV
import public Appendices.Neovim
import Data.Vect as V
import public Data.List1 as L
```

最初の 2 行は、別の **パッケージ（package）**（パッケージについては後述）からモジュールをインポートしています。*base* パッケージの `Data.List` は、Idris インストールの一部としてインストールされます。

2 行目は、自分たちのソースディレクトリ `src` 内から `Text.CSV` モジュールをインポートしています。作業中のファイルと同じソースディレクトリの一部であるモジュールは常にインポート可能です。

3 行目は、再び自分たちのソースディレクトリから `Appendices.Neovim` モジュールをインポートしています。ただし、この `import` 文には `public` キーワードが付いている点に注目してください。これによりモジュールを **再エクスポート（re-export）** することができ、現在のモジュールに加えて他のモジュールからも利用可能になります。別のモジュールが `Appendices.Projects` をインポートした場合、追加の `import` 文なしで `Appendices.Neovim` もインポートされます。これは、複雑な機能を複数のモジュールに分割し、単一の統括モジュール経由ですべてをインポートしたい場合に便利です（*base* の `Control.Monad.State` モジュールを参照）。

あるモジュール `A` の関数を使用するために別のモジュール `B` のユーティリティも必要となる場合、`A` は `B` を再エクスポートするべきです。例えば、*base* の `Data.Vect` は `Data.Fin` を再エクスポートしています。ベクトルを操作する際に後者が頻繁に必要となるためです。

4 行目は `Data.Vect` モジュールをインポートし、より短いプレフィックスとして使用するために `V` という新しい名前を付けています。モジュール名でプレフィックスを付けて識別子の曖昧さを解消する必要がある場合、これによりコードをより簡潔にすることができます：

```idris
vectSum : Nat
vectSum = sum $ V.fromList [1..10]
```

最後に、5 行目ではモジュールを公開インポートし、新しい名前を付けています。この名前は、`Appendices.Projects` を経由して推移的に `Data.List1` をインポートした際に見える名前になります。これを確認するために、プロジェクトのルートフォルダからソースファイルを読み込まずに（チュートリアルの型チェック後に）REPL セッションを開始してみましょう：

```sh
pack typecheck tutorial
pack repl
```

モジュール `Appendices.Projects` をロードし、`singleton` の型を確認します：

```repl
Main> :module Appendices.Projects
Imported module Appendices.Projects
Main> :t singleton
Data.String.singleton : Char -> String
Data.List.singleton : a -> List a
L.singleton : a -> List1 a
```

`singleton` の `List1` バージョンが `Data.List1` ではなく `L` というプレフィックスになっていることが分かります。もちろん「公式」のプレフィックスを使用することも可能です：

```repl
Main> List1.singleton 12
12 ::: []
Main> L.singleton 12
12 ::: []
```

### 名前空間 (Namespaces)

時には、単一のモジュール内で同じ名前を持つ複数の関数やデータ型を定義したい場合があります。すべての名前はその **名前空間（namespace）** 内で一意でなければならず、モジュールの名前空間は完全修飾されたモジュール名そのものであるため、Idris は通常これを許可しません。しかし、`namespace` キーワードに続いて名前空間の名前を指定することで、モジュール内に追加の名前空間を定義することができます。この名前空間に属するすべての関数は、同じ量の空白でインデントされる必要があります。

例を示します：

```idris
data HList : List Type -> Type where
  Nil  : HList []
  (::) : (v : t) -> (vs : HList ts) -> HList (t :: ts)

head : HList (t :: ts) -> t
head (v :: _) = v

tail : HList (t :: ts) -> HList ts
tail (_ :: vs) = vs

namespace HVect
  public export
  data HVect : Vect n Type -> Type where
    Nil  : HVect []
    (::) : (v : t) -> (vs : HVect ts) -> HVect (t :: ts)

  public export
  head : HVect (t :: ts) -> t
  head (v :: _) = v

  public export
  tail : HVect (t :: ts) -> HVect ts
  tail (_ :: vs) = vs
```

関数名 `HVect.head` と `HVect.tail`、およびコンストラクタ `HVect.Nil` と `HVect.(::)` は、外側の名前空間（`Appendices.Projects`）の同名の関数やコンストラクタと衝突するため、独自の名前空間に配置する必要がありました。名前空間の外側から使用できるようにするには、それらをエクスポートする必要があります（以下の可視性の節を参照）。これらの名前の間の曖昧さを解消する必要がある場合は、名前空間の一部をプレフィックスとして付加できます。例えば、以下は曖昧性エラーで失敗します。スコープ内に `head` という名前の関数が複数存在し、`head` の引数（リスト構文をサポートするデータ型で、これも複数スコープにあります）からどのバージョンを求めているのか明確ではないためです：

```idris
failing "Ambiguous elaboration."
  whatHead : Nat
  whatHead = head [12,"foo"]
```

`head` にその名前空間の一部をプレフィックスとして付けることで、両方の曖昧さを解消できます。`[12,"foo"]` が `HVect` であることが即座に明確になります。それが `HVect.head` の引数の型だからです：

```idris
thisHead : Nat
thisHead = HVect.head [12,"foo"]
```

以降の節では、名前空間を利用して可視性の原則を説明します。

### 可視性 (Visibility)

関数やデータ型をそれが定義されたモジュールや名前空間の外側で使用するには、その **可視性（visibility）** を変更する必要があります。デフォルトの可視性は `private` です。このような関数やデータ型は、そのモジュールや名前空間の外側からは見えません：

```idris
namespace Foo
  foo : Nat
  foo = 12

failing "Name Appendices.Projects.Foo.foo is private."
  bar : Nat
  bar = 2 * foo
```

関数を可視にするには、`export` キーワードで修飾します：

```idris
namespace Square
  export
  square : Num a => a -> a
  square v = v * v
```

これにより、（`Appendices.Projects` をインポートした後で）他のモジュールや名前空間から `square` 関数を呼び出すことができるようになります：

```idris
OneHundred : Bits8
OneHundred = square 10
```

しかし、`square` の **実装（implementation）** はエクスポートされないため、`square` はエラボレーション中に簡約（reduce）されません：

```idris
failing "Can't solve constraint between: 100 and square 10."
  checkOneHundred : OneHundred === 100
  checkOneHundred = Refl
```

これを動作させるには、`square` を **公開エクスポート（publicly export）** する必要があります：

```idris
namespace SquarePub
  public export
  squarePub : Num a => a -> a
  squarePub v = v * v

OneHundredAgain : Bits8
OneHundredAgain = squarePub 10

checkOneHundredAgain : OneHundredAgain === 100
checkOneHundredAgain = Refl
```

したがって、エラボレーション中に関数を簡約する必要がある場合は、`export` の代わりに `public export` で修飾してください。これは型を計算するために関数を使用する場合に特に重要です。そのような関数はエラボレーション中に簡約されなければ完全に無意味になってしまうためです：

```idris
namespace Stupid
  export
  0 NatOrString : Type
  NatOrString = Either String Nat

failing "Can't solve constraint between: Either String ?b and NatOrString."
  natOrString : NatOrString
  natOrString = Left "foo"
```

型エイリアスを公開エクスポートすれば、すべて正常に型チェックを通過します：

```idris
namespace Better
  public export
  0 NatOrString : Type
  NatOrString = Either String Nat

natOrString : Better.NatOrString
natOrString = Left "bar"
```

### データ型の可視性 (Visibility of Data Types)

データ型の可視性は少し異なった振る舞いをします。`private`（デフォルト）に設定されている場合、*型コンストラクタ* も *データコンストラクタ* も定義された名前空間の外側からは見えません。`export` で修飾された場合、型コンストラクタはエクスポートされますが、データコンストラクタはエクスポートされません：

```idris
namespace Export
  export
  data Foo : Type where
    Foo1 : String -> Foo
    Foo2 : Nat -> Foo

  export
  mkFoo1 : String -> Export.Foo
  mkFoo1 = Foo1

foo1 : Export.Foo
foo1 = mkFoo1 "foo"
```

名前空間 `Export` の外側で型 `Foo` および関数 `mkFoo1` を使用できることが分かります。しかし、`Foo1` コンストラクタを使って直接 `Foo` 型の値を作成することはできません：

```idris
failing "Export.Foo1 is private."
  foo : Export.Foo
  foo = Foo1 "foo"
```

データ型を公開エクスポートすると、この動作が変わります：

```idris
namespace PublicExport
  public export
  data Foo : Type where
    Foo1 : String -> PublicExport.Foo
    Foo2 : Nat -> PublicExport.Foo

foo2 : PublicExport.Foo
foo2 = Foo2 12
```

インターフェースについても同様です。公開エクスポートされている場合、インターフェース（型コンストラクタ）とそのすべての関数がエクスポートされ、定義された名前空間の外側で実装を記述できます：

```idris
namespace PEI
  public export
  interface Sized a where
    size : a -> Nat

Sized Nat where size = id

sumSizes : Foldable t => Sized a => t a -> Nat
sumSizes = foldl (\n,e => n + size e) 0
```

公開エクスポートされていない場合、定義された名前空間の外側で実装を記述することはできません（ただし、コード内でその型や関数を使用することは可能です）：

```idris
namespace EI
  export
  interface Empty a where
    empty : a -> Bool

  export
  Empty (List a) where
    empty [] = True
    empty _  = False

failing
  Empty Nat where
    empty Z = True
    empty (S _) = False

nonEmpty : Empty a => a -> Bool
nonEmpty = not . empty
```

### 子名前空間 (Child Namespaces)

時には、別のモジュールや名前空間にあるプライベート関数にアクセスする必要が生じることがあります。これは **子名前空間（child namespaces）**（親モジュールや名前空間のプレフィックスを共有するモジュールや名前空間）から可能です。例えば：

```idris
namespace Inner
  testEmpty : Bool
  testEmpty = nonEmpty (the (List Nat) [12])
```

名前空間 `Appendices.Projects.Inner` の内側から `nonEmpty` 関数にアクセスできることが分かります。これはモジュール `Appendices.Projects` のプライベート関数であるにもかかわらずです。これはモジュール間でも可能です。もし `Data.List.Magic` というモジュールを作成した場合、*base* の `Data.List` モジュールで定義されたプライベートなユーティリティ関数にアクセスできます。実際に `Data.List.Magic` モジュールを追加して Idris モジュールシステムのこの仕様を実演しています（ぜひ覗いてみてください！）。一般に、これは可視性の制約を回避するためのやや裏技的な方法ですが、時には役立ちます。

## パラメータブロック (Parameter Blocks)

ここでは、複数の関数にわたって一連の共通の読み取り専用引数（パラメータ）を共有できる `parameters` ブロックという言語機能を見ていきます。これにより、より簡潔な関数シグネチャを記述できます。小さなサンプルプログラムを使ってその有用性を実演します。

ある外部情報を関数で利用可能にする最も基本的な方法は、それを追加の引数として渡すことです。オブジェクト指向プログラミングでは、この原則は [依存性の注入（DI / dependency injection）](https://ja.wikipedia.org/wiki/%E4%BE%9D%E5%AD%98%E6%80%A7%E3%81%AE%E6%B3%A8%E5%85%A5) と呼ばれ、多くのライブラリやフレームワークがこれを取り巻いて構築されています。

関数型プログラミングでは、これらすべてを非常にシンプルに扱えます。アプリケーションの設定データが必要なら、関数に追加の引数として渡すだけです。ローカルな可変状態を使いたいなら、対応する `IORef` を追加の引数として関数に渡します。これは非常に効率的で信じられないほどシンプルです。唯一の欠点は、関数のシグネチャが肥大化する可能性があることです（この概念を抽象化するための `Reader` モナドも存在し、base ライブラリの `Control.Monad.Reader` モジュールにあります）。

しかし Idris では、さらにシンプルなアプローチが可能です。自動暗黙引数を用いた証明探索を依存性の注入に活用できます。以下に例を示します：

```idris
data Error : Type where
  NoNat  : String -> Error
  NoBool : String -> Error

record Console where
  constructor MkConsole
  read : IO String
  put  : String -> IO ()

record ErrorHandler where
  constructor MkHandler
  handle : Error -> IO ()

getCount' : (h : ErrorHandler) => (c : Console) => IO Nat
getCount' = do
  str <- c.read
  case parsePositive str of
    Nothing => h.handle (NoNat str) $> 0
    Just n  => pure n

getText' : (h : ErrorHandler) => (c : Console) => (n : Nat) -> IO (Vect n String)
getText' n = sequence $ replicate n c.read

prog' : ErrorHandler => (c : Console) => IO ()
prog' = do
  c.put "Please enter the number of lines to read."
  n  <- getCount'
  c.put "Please enter \{show n} lines of text."
  ls <- getText' n
  c.put "Read \{show n} lines and \{show . sum $ map length ls} characters."
```

このサンプルプログラムは、ある `Console` 型から入力を読み込み、出力を表示します。その実装は関数の呼び出し元に委ねられています。これは依存性の注入の典型例です。私たちの `IO` アクションはテキスト行をどのように読み書きするかについて何も知らず（`putStrLn` や `getLine` を直接呼び出したりしません）、これらのタスクを処理するために外部の *オブジェクト* に依存しています。これにより、テスト中はシンプルな *モックオブジェクト* を使用し、実際のアプリケーション実行時には 2 つのファイルハンドルやデータベース接続などを使用することができます。これらはオブジェクト指向プログラミングでよく見られる典型的な技法であり、事実、この例は純粋関数型言語において典型的なオブジェクト指向パターンをエミュレートしています。`Console` のような型は機能（メソッド `read` と `put`）を提供する *クラス* と見なすことができ、`Console` 型の値はそのクラスの *オブジェクト* と見なすことができます。

エラーハンドリングについても同様です。エラーハンドラは発生したエラーを単に無視することもできますし、同時に `stderr` に出力してログファイルに書き込むこともできます。それが何をするにせよ、私たちの関数は気にする必要がありません。

しかし、この非常に単純な例でさえすでに 2 つの追加の関数引数を導入しており、実際のアプリケーションではさらに多くの引数が必要になり、関数のシグネチャがあっという間に肥大化することが容易に想像できます。幸いなことに、Idris にはこれに対する非常にクリーンでシンプルな解決策があります。それが **`parameters` ブロック** です。これにより、ブロック内に列挙されたすべての関数によって共有される **パラメータ**（変化しない関数引数）のリストを指定できます。これらの引数は各関数ごとに個別に列挙する必要がなくなり、関数シグネチャをすっきりと保つことができます。上記の例をパラメータブロックで書き直したものが以下です：

```idris
parameters {auto c : Console} {auto h : ErrorHandler}
  getCount : IO Nat
  getCount = do
    str <- c.read
    case parsePositive str of
      Nothing => h.handle (NoNat str) $> 0
      Just n  => pure n

  getText : (n : Nat) -> IO (Vect n String)
  getText n = sequence $ replicate n c.read

  prog : IO ()
  prog = do
    c.put "Please enter the number of lines to read."
    n  <- getCount
    c.put "Please enter \{show n} lines of text."
    ls <- getText n
    c.put "Read \{show n} lines and \{show . sum $ map length ls} characters."
```

`parameters` ブロック内のパラメータとして、任意の多重度、明示的、暗黙的、自動暗黙的、名前付き、名前なしの引数を自由に指定できますが、暗黙引数や自動暗黙引数で最も効果的に機能します。明示的な引数は、同じ明示的引数を持つ他のパラメータブロックから呼び出す場合でも関数に明示的に渡す必要があり、やや混乱を招く可能性があります。

この例を完成させるために、プログラムを実行する main 関数を以下に示します。`prog` を呼び出す際に使用する `Console` と `ErrorHandler` を明示的に組み立てている点に注目してください。

```idris
main : IO ()
main =
  let cons := MkConsole (trim <$> getLine) putStrLn
      err  := MkHandler (const $ putStrLn "It didn't work")
   in prog
```

自動暗黙引数による依存性の注入は、パラメータブロックの可能な応用のひとつにすぎません。複数の関数に対して繰り返される引数リストが存在するあらゆる場面で有用です。

## ドキュメンテーション (Documentation)

ドキュメントは極めて重要です。私たちが書いたライブラリを利用する他のプログラマのためであれ、（将来の自分自身を含む）コードを理解しようとする人たちのためであれ、自明でない実装の詳細を説明するコメントや、エクスポートされたデータ型や関数の意図と機能を説明する docstring でコードを注釈することは不可欠です。

### コメント (Comments)

Idris ソースファイルでコメントを書くのは、2 つのハイフンの後にテキストを追加するだけです：

```idris
-- これは実に退屈なコメントです
boring : Bits8 -> Bits8
boring a = a -- Prelude の `id` を使うべきかもしれません
```

文字列リテラルの一部ではない 2 つのハイフンが含まれる行では、その行の残りが Idris によってコメントとして解釈されます。

また、デリミタ `{-` と `-}` を使用して複数行コメントを書くことも可能です：

```idris
{-
  これは複数行コメントです。
  大規模なソースファイルで複数の型エラーが発生した場合などに、
  コードブロック全体をコメントアウトするために使用できます。
-}
```

### ドキュメント文字列 (Doc Strings)

コメントがソースコードを読んで理解しようとするプログラマ向けであるのに対し、ドキュメント文字列（doc strings）はエクスポートされた関数やデータ型に対するドキュメントを提供し、その意図や動作を他者に説明します。

以下はドキュメント付き関数の例です：

```idris
||| リストの先頭から最初の 2 つの要素を抽出しようとします。
|||
||| リストに 2 つ以上の要素がある場合、`Just` でラップされた値のペアを返します。
||| リストの要素が 2 つ未満の場合、`Nothing` を返します。
export
firstTwo : List a -> Maybe (a,a)
firstTwo (x :: y :: _) = Just (x,y)
firstTwo _             = Nothing
```

REPL でドキュメント文字列を確認できます：

```repl
Appendices.Projects> :doc firstTwo
Appendices.Projects.firstTwo : List a -> Maybe (a,a)
  リストの先頭から最初の 2 つの要素を抽出しようとします。

  リストに 2 つ以上の要素がある場合、`Just` でラップされた値のペアを返します。
  リストの要素が 2 つ未満の場合、`Nothing` を返します。
  Visibility: export
```

データ型とそのコンストラクタも同様の方法でドキュメント化できます：

```idris
||| 保持する値の数でインデックス付けされた二分木。
|||
||| @param `n` : `Tree` に格納されている値の数
||| @param `a` : `Tree` に格納されている値の型
public export
data Tree : (n : Nat) -> (a : Type) -> Type where
  ||| 二分木の葉に格納された単一の値。
  Leaf   : (v : a) -> Tree 1 a

  ||| 2 つの部分木を統合する枝。
  Branch : Tree m a -> Tree n a -> Tree (m + n) a
```

実際に REPL でこれが生成するドキュメント文字列を確認してみてください。

コードのドキュメント化は非常に重要です。他人のコードを理解しようとしたときや、数か月前に自分で書いて以来見ていなかった自明でないソースコードに戻ってきたときに、その重要性を痛感するはずです。適切にドキュメント化されていないコードを読み解くのは苦痛を伴います。Idris はコードをドキュメント化・注釈するために必要なツールを提供してくれているので、時間をかけてドキュメントを残しましょう。それは十分に価値のある投資です。

## パッケージ (Packages)

Idris パッケージを使用すると、複数のモジュールを論理的な単位にまとめ、パッケージを **インストール** することで他の Idris プロジェクトから利用可能にすることができます。本節では、Idris パッケージの構造と、プロジェクト内で他のパッケージに依存する方法について学びます。

### `.ipkg` ファイル (The `.ipkg` File)

Idris パッケージの中心にあるのが `.ipkg` ファイルであり、通常（必須ではありませんが）プロジェクトのルートディレクトリに配置されます。例えば、この Idris チュートリアルの場合、ルートディレクトリに `tutorial.ipkg` ファイルが存在します。

`.ipkg` ファイルはいくつかのキー・値のペア（その大半はオプション）で構成されており、ここでは最も重要なものを説明します。新しい Idris プロジェクトをセットアップする最も簡単な方法は、pack や Idris 自体に任せることです。新しいライブラリのスケルトンを作成するには：

```sh
pack new lib pkgname
```

新しいアプリケーションをセットアップするには：

```sh
pack new bin appname
```

を実行します。これらのコマンドは、新しいディレクトリと適切な `.ipkg` ファイルを作成するだけでなく、後述する `pack.toml` ファイルも追加します。

### 依存関係 (Dependencies)

`.ipkg` ファイルの最も重要な側面のひとつは、`depends` フィールドにライブラリが依存するパッケージを列挙することです。以下は、Idris でプロパティテストを作成するためのフレームワークである [*hedgehog* パッケージ](https://github.com/stefan-hoeck/idris2-hedgehog) からの抜粋です：

```ipkg
depends    = base         >= 0.5.1
           , contrib      >= 0.5.1
           , elab-util    >= 0.5.0
           , pretty-show  >= 0.5.0
           , sop          >= 0.5.0
```

*hedgehog* は、すべての Idris インストールに含まれる *base* や *contrib* だけでなく、エラボレータスクリプト（Idris コードを書いて Idris 宣言を生成する強力な技術）用ユーティリティライブラリである [*elab-util*](https://github.com/stefan-hoeck/idris2-elab-util)、直積の直和（SOP）表現を介してインターフェース実装をジェネリックに導出するためのライブラリ [*sop*](https://github.com/stefan-hoeck/idris2-sop)、および Idris 値のプリティプリント用ライブラリ [*pretty-show*](https://github.com/stefan-hoeck/idris2-pretty-show)（テスト失敗時に *hedgehog* が使用）にも依存しています。

したがって、自分のプロジェクトで *hedgehog* を使ってプロパティテストを書く前に、*hedgehog* 自体をインストールする前にそれが依存するパッケージをインストールする必要があります。これを手動で行うのは骨が折れるため、pack のようなパッケージマネージャに任せるのが最善です。

#### 依存関係のバージョン (Dependency Versions)

依存関係に対して Idris が使用すべき特定のバージョン（または範囲）を指定したい場合があります。同じパッケージの複数のバージョンがインストールされており、そのすべてがプロジェクトと互換性があるわけではない場合に役立ちます。以下にいくつかの例を示します：

```ipkg
depends    = base         == 0.5.1
           , contrib      == 0.5.1
           , elab-util    >= 0.5.0
           , pretty-show
           , sop          >= 0.5.0 && < 0.6.0
```

これは、指定された正確なバージョンの *base* および *contrib*、バージョン `0.5.0` 以上の *elab-util*、任意のバージョンの *pretty-show*、および指定された範囲内のバージョンの *sop* を探します。いずれの場合も、インストールされているパッケージの複数のバージョンが指定された範囲に一致する場合、最新のバージョンが使用されます。

自身のパッケージでこれを活用できるように、すべての `.ipkg` ファイルにはパッケージの名前と現在のバージョンを記載するべきです：

```ipkg
package tutorial

version    = 0.1.0
```

後述するように、pack とその精選されたパッケージコレクションを使用する場合、パッケージバージョンの重要性は大幅に低下します。それでも、上流で導入された破壊的変更を確実に検知するために、受け入れるパッケージのバージョンを制限することを検討してもよいでしょう。

### ライブラリモジュール (Library Modules)

GitHub で公開されている多くの（おそらく大半の）Idris パッケージはプログラミング **ライブラリ** です。これらは何らかの機能を実装し、そのパッケージに依存するすべてのプロジェクトで利用できるようにします。これは、コンピュータ上で実行できる実行可能ファイルにコンパイルされる Idris **アプリケーション** とは異なります。Idris プロジェクト自体はその両方を提供しています。他の Idris ライブラリやアプリケーションを型チェックおよびビルドするために使用する Idris コンパイラアプリケーションと、大半の Idris プロジェクトで有用な基本的なデータ型や関数を提供する *prelude*、*base*、*contrib* などのいくつかのライブラリです。

ライブラリで作成したモジュールを型チェックおよびインストールするには、`.ipkg` ファイルの `modules` フィールドにそれらを列挙する必要があります。以下は *sop* パッケージからの抜粋です：

```ipkg
modules = Data.Lazy
        , Data.SOP
        , Data.SOP.Interfaces
        , Data.SOP.NP
        , Data.SOP.NS
        , Data.SOP.POP
        , Data.SOP.SOP
        , Data.SOP.Utils
```

このリストに含まれていないモジュールはインストール **されず**、したがって sop ライブラリに依存する他のパッケージからは利用できません。

### pack と精選されたパッケージコレクション (Pack and its curated Collection of Packages)

プロジェクトの依存関係グラフが大きく複雑になってくると、すなわちプロジェクトが多くのライブラリに依存し、それらのライブラリがさらに別のライブラリに依存している場合、2 つのパッケージが第 3 のパッケージの異なる（そして潜在的に互換性のない）バージョンに同時に依存してしまうことがあります。この状況を解決するのはほぼ不可能であり、競合するライブラリを操作する際に多くのフラストレーションの原因となります。

したがって、**精選されたパッケージコレクション（curated package collections）** を利用することで、最初からそのような状況を回避することが pack プロジェクトの哲学です。pack コレクションは、Idris コンパイラの特定の Git コミットと、それぞれ特定の Git コミットにおける一連のパッケージで構成され、それらすべてが相互に問題なく連携して動作することがテストされています。pack で利用可能なパッケージの一覧は [こちら](https://github.com/stefan-hoeck/idris2-pack-db/blob/main/STATUS.md) で確認できます。

作業中のプロジェクトが pack のパッケージコレクションに掲載されているライブラリのいずれかに依存している場合、pack は自動的にそのライブラリとすべての依存関係をインストールします。しかし、pack のコレクションにまだ含まれていないライブラリに依存したい場合もあります。その場合、`pack.toml` ファイル（`$HOME/.pack/user/pack.toml` にあるグローバルなもの、または現在のプロジェクトやその親ディレクトリにあるローカルなもの）に対象のライブラリを指定する必要があります。そこでは、システム上のローカルな依存関係か、Git プロジェクト（ローカルまたはリモート）のいずれかを指定できます。それぞれの例を以下に示します：

```toml
[custom.all.foo]
type = "local"
path = "/path/to/foo"
ipkg = "foo.ipkg"

[custom.all.bar]
type   = "github"
url    = "https://github.com/me/bar"
commit = "latest:main"
ipkg   = "bar.ipkg"
```

どちらの場合も、プロジェクトが存在する場所と、その `.ipkg` ファイルの名前および場所を指定する必要があります。Git プロジェクトの場合、使用すべきコミットも pack に伝える必要があります。上記の例では、`main` ブランチの最新コミットを使用したいと考えています。`pack fetch` を使用して、現在最新のコミットハッシュを取得して保存できます。

上記のようなエントリを追加するだけで、カスタムライブラリのサポートを pack に追加できます。これで、自身のプロジェクトの `.ipkg` ファイルにこれらのライブラリを依存関係として列挙できるようになり、pack が自動的にインストールしてくれるようになります。

## おわりに (Conclusion)

これで Idris プロジェクトの構成に関する節を終わります。エラボレーションの失敗を示す `failing` ブロック、同一ソースファイル内で名前をオーバーロードするための `namespace`、関数間でパラメータリストを共有するための `parameters` ブロックなど、いくつかの種類のコードブロックについて学び、複数のソースファイルを Idris ライブラリやアプリケーションにグループ化する方法を学びました。最後に、Idris プロジェクトに外部ライブラリを含める方法と、それらの依存関係を管理するために pack を活用する方法を学びました。

<!-- vi: filetype=idris2:syntax=markdown
-->
