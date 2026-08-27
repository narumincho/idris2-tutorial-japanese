# インターフェースの真実 (The Truth about Interfaces)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Truth.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Truth.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Predicates.Truth

import Tutorial.Predicates.Contracts
import Tutorial.Predicates.ErrorHandling

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

いよいよ明かされます。これがインターフェースの真実です。

内部的には、インターフェースは単なる **レコードデータ型（record data type）** であり、そのフィールドがインターフェースのメンバーに対応しています。インターフェースの実装は、そのようなレコードの **値** であり、証明探索で利用できるように `%hint` プラグマ（後述）で修飾されたものです。そして、制約付き関数は単に 1 つ以上の自動暗黙引数（auto implicit arguments）を持つ関数にすぎません。

例えば、以下はリスト内の要素を検索する同一の関数です。一方はおなじみの制約付き関数の構文で、もう一方は自動暗黙引数を使って書かれています。どちらの場合も、Idris が生成するコードは全く同じです：

```idris
isElem1 : Eq a => a -> List a -> Bool
isElem1 v []        = False
isElem1 v (x :: xs) = x == v || isElem1 v xs

isElem2 : {auto _ : Eq a} -> a -> List a -> Bool
isElem2 v []        = False
isElem2 v (x :: xs) = x == v || isElem2 v xs
```

単なるレコードにすぎないため、通常の関数の引数としてインターフェースを受け取り、パターンマッチで分解することもできます：

```idris
eq : Eq a -> a -> a -> Bool
eq (MkEq feq fneq) = feq
```

## インターフェースの手動定義 (A manual Interface Definition)

通常のインターフェース定義と実装で得られるのと全く同じ動作を、証明探索を使って実現できることを示します。前節のエラーハンドリングツールを使って CSV の例を仕上げたいので、エラーハンドラを実装してみましょう。

まず、インターフェースは単なるレコードです：

```idris
record Print a where
  constructor MkPrint
  print' : a -> String
```

制約付き関数の中でレコードにアクセスするには `%search` キーワードを使用します。これは証明探索によって目的の型（この場合は `Print a`）の値を自動生成しようとします：

```idris
print : Print a => a -> String
print = print' %search
```

別のアプローチとして、名前付き制約を使用して名前経由で直接アクセスすることもできます：

```idris
print2 : (impl : Print a) => a -> String
print2 = print' impl
```

さらに別の方法として、自動暗黙引数の構文を使用することもできます：

```idris
print3 : {auto impl : Print a} -> a -> String
print3 = print' impl
```

これら 3 つのバージョンの `print` は、実行時にはまったく同一に振る舞います。したがって、`{auto x : Foo} ->` と書く場所はいつでも `(x : Foo) =>` と書くことができ、その逆も同様です。

インターフェースの実装は指定されたレコード型の単なる値ですが、証明探索で利用可能にするためには `%hint` プラグマで注釈を付ける必要があります：

```idris
%hint
noNatPrint : Print NoNat
noNatPrint = MkPrint $ \e => "Not a natural number: \{e.str}"

%hint
noColTypePrint : Print NoColType
noColTypePrint = MkPrint $ \e => "Not a column type: \{e.str}"

%hint
outOfBoundsPrint : Print OutOfBounds
outOfBoundsPrint = MkPrint $ \e => "Index is out of bounds: \{show e.index}"

%hint
rowErrorPrint : Print RowError
rowErrorPrint = MkPrint $
  \case InvalidField r c ct s =>
          "Not a \{show ct} in row \{show r}, column \{show c}. \{s}"
        UnexpectedEOI r c =>
          "Unexpected end of input in row \{show r}, column \{show c}."
        ExpectedEOI r c =>
          "Expected end of input in row \{show r}, column \{show c}."
```

エラーのユニオンに対する `Print` の実装も記述できます。このために、まずユニオンのインデックス内のすべての型が `Print` の実装を持っているという証明を作成します：

```idris
0 All : (f : a -> Type) -> Vect n a -> Type
All f []        = ()
All f (x :: xs) = (f x, All f xs)

unionPrintImpl : All Print ts => Union ts -> String
unionPrintImpl (U Z val)     = print val
unionPrintImpl (U (S x) val) = unionPrintImpl $ U x val

%hint
unionPrint : All Print ts => Print (Union ts)
unionPrint = MkPrint unionPrintImpl
```

このようにインターフェースを定義することには利点があります。「魔法のような仕組み」が大幅に減り、フィールドの型や値をより細かく制御できるようになります。また、すべての「魔法」は「インターフェース実装」に付けられた探索ヒント（`%hint`）に由来している点にも注目してください。これらによって、対応する値や関数が証明探索で利用可能になります。

### CSV コマンドのパース (Parsing CSV Commands)

本章の締めくくりとして、前節の柔軟なエラーハンドリング手法を用いて CSV コマンドパーサーを再実装します。元のパーサーよりも記述量が必ずしも少なくなるわけではありませんが、このアプローチによってエラーの処理とエラーメッセージの出力がアプリケーションの他の部分から疎結合になります。失敗する可能性のある関数は異なるコンテキストで再利用でき、エラーメッセージ用のプリティプリンタも同様に再利用可能です。

まず、前章の内容をいくつかおさらいします。列のすべての値を出力するための新しいコマンドを追加しました：

```idris
record Table where
  constructor MkTable
  schema : Schema
  size   : Nat
  rows   : Vect size (Row schema)

data Command : (t : Table) -> Type where
  PrintSchema :  Command t
  PrintSize   :  Command t
  New         :  (newSchema : Schema) -> Command t
  Prepend     :  Row (schema t) -> Command t
  Get         :  Fin (size t) -> Command t
  Delete      :  Fin (size t) -> Command t
  Col         :  (name : String)
              -> (tpe  : ColType)
              -> (prf  : InSchema name t.schema tpe)
              -> Command t
  Quit        : Command t

applyCommand : (t : Table) -> Command t -> Table
applyCommand t                 PrintSchema = t
applyCommand t                 PrintSize   = t
applyCommand _                 (New ts)    = MkTable ts _ []
applyCommand (MkTable ts n rs) (Prepend r) = MkTable ts _ $ r :: rs
applyCommand t                 (Get x)     = t
applyCommand t                 Quit        = t
applyCommand t                 (Col _ _ _) = t
applyCommand (MkTable ts n rs) (Delete x)  = case n of
  S k => MkTable ts k (deleteAt x rs)
  Z   => absurd x
```

次に、以下は再実装されたコマンドパーサーです。全部で 7 通りの失敗の可能性があり、そのうちの少なくとも一部は大規模アプリケーションの他の部分でも発生しうるものです。

```idris
record UnknownCommand where
  constructor MkUnknownCommand
  str : String

%hint
unknownCommandPrint : Print UnknownCommand
unknownCommandPrint = MkPrint $ \v => "Unknown command: \{v.str}"

record NoColName where
  constructor MkNoColName
  str : String

%hint
noColNamePrint : Print NoColName
noColNamePrint = MkPrint $ \v => "Unknown column: \{v.str}"

0 CmdErrs : Vect 7 Type
CmdErrs = [ InvalidColumn
          , NoColName
          , NoColType
          , NoNat
          , OutOfBounds
          , RowError
          , UnknownCommand ]

readCommand : (t : Table) -> String -> Err CmdErrs (Command t)
readCommand _                "schema"  = Right PrintSchema
readCommand _                "size"    = Right PrintSize
readCommand _                "quit"    = Right Quit
readCommand (MkTable ts n _) s         = case words s of
  ["new",    str] => New     <$> readSchema str
  "add" ::   ss   => Prepend <$> decodeRow 1 (unwords ss)
  ["get",    str] => Get     <$> readFin str
  ["delete", str] => Delete  <$> readFin str
  ["column", str] => case inSchema ts str of
    Just (ct ** prf) => Right $ Col str ct prf
    Nothing          => fail $ MkNoColName str
  _               => fail $ MkUnknownCommand s
```

必要なエラー型がエラーのリストに含まれているため、`readFin` や `readSchema` などの関数を直接呼び出すことができる点に注目してください。

本節のまとめとして、コマンドの結果を出力する機能とアプリケーションのメインループを以下に示します。大部分は以前の章で扱った内容ですが、`print` の 1 回の呼び出しですべてのエラーを一度に処理できる点に注目してください：

```idris
encodeField : (t : ColType) -> IdrisType t -> String
encodeField I64     x     = show x
encodeField Str     x     = show x
encodeField Boolean True  = "t"
encodeField Boolean False = "f"
encodeField Float   x     = show x

encodeRow : (s : Schema) -> Row s -> String
encodeRow s = concat . intersperse "," . go s
  where go : (s' : Schema) -> Row s' -> Vect (length s') String
        go []        []        = []
        go (MkColumn _ c :: cs) (v :: vs) = encodeField c v :: go cs vs

encodeCol :  (name : String)
          -> (c    : ColType)
          -> InSchema name s c
          => Vect n (Row s)
          -> String
encodeCol name c = unlines . toList . map (\r => encodeField c $ getAt name r)

result :  (t : Table) -> Command t -> String
result t PrintSchema   = "Current schema: \{showSchema t.schema}"
result t PrintSize     = "Current size: \{show t.size}"
result _ (New ts)      = "Created table. Schema: \{showSchema ts}"
result t (Prepend r)   = "Row prepended: \{encodeRow t.schema r}"
result _ (Delete x)    = "Deleted row: \{show $ FS x}."
result _ Quit          = "Goodbye."
result t (Col n c prf) = "Column \{n}:\n\{encodeCol n c t.rows}"
result t (Get x)       =
  "Row \{show $ FS x}: \{encodeRow t.schema (index x t.rows)}"

covering
runProg : Table -> IO ()
runProg t = do
  putStr "Enter a command: "
  str <- getLine
  case readCommand t str of
    Left err   => putStrLn (print err) >> runProg t
    Right Quit => putStrLn (result t Quit)
    Right cmd  => putStrLn (result t cmd) >>
                  runProg (applyCommand t cmd)

covering
main : IO ()
main = runProg $ MkTable [] _ []
```

以下は REPL セッションの例です：

```repl
Tutorial.Predicates> :exec main
Enter a command: new name:Str,age:Int64,salary:Float
Not a column type: Int64
Enter a command: new name:Str,age:I64,salary:Float
Created table. Schema: name:Str,age:I64,salary:Float
Enter a command: add John Doe,44,3500
Row prepended: "John Doe",44,3500.0
Enter a command: add Jane Doe,50,4000
Row prepended: "Jane Doe",50,4000.0
Enter a command: get 1
Row 1: "Jane Doe",50,4000.0
Enter a command: column salary
Column salary:
4000.0
3500.0

Enter a command: quit
Goodbye.
```

<!-- vi: filetype=idris2:syntax=markdown
-->
