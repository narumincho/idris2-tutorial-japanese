# ユースケース: スキーマ付き CSV ファイル (Use Case: CSV Files with a Schema)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DPair/CSV.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DPair/CSV.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.DPair.CSV

import Control.Monad.State

import Data.DPair
import Data.Either
import Data.HList
import Data.List
import Data.List1
import Data.Singleton
import Data.String
import Data.Vect

import Text.CSV

%default total
```

本節では、これまでの CSV パーサーの成果を発展させ、ユーザーが指定したスキーマに基づいて CSV テーブルをパースし、メモリ上に保持・操作できるコマンドラインツールを作成します。

設計方針として以下の 2 点を重視します：

- **純粋性 (Purity)**: メインループを除くすべての関数を純粋（`IO` などの副作用モナドを用いない）に保つ。
- **早期の失敗 (Fail Early)**: コマンドパーサーの段階ですべてのバリデーションを行い、テーブル更新や検索を行うコア関数は **絶対に失敗しない型** として実装する。

## スキーマのエンコード (Encoding the Schema)

実行時にテーブルスキーマを検査するために、サポートするカラム型を記述するカスタムデータ型を定義します：

```idris
data ColType = I64 | Str | Boolean | Float

Schema : Type
Schema = List ColType

IdrisType : ColType -> Type
IdrisType I64     = Int64
IdrisType Str     = String
IdrisType Boolean = Bool
IdrisType Float   = Double

Row : Schema -> Type
Row = HList . map IdrisType
```

テーブルは、現在のスキーマと行数を行のベクトルとともに保持する依存レコードとして定義します：

```idris
record Table where
  constructor MkTable
  schema : Schema
  size   : Nat
  rows   : Vect size (Row schema)
```

テーブルに対する操作（コマンド）を、現在のテーブルをインデックスに持つインデックス付きデータ型として定義します。これにより、インデックス範囲外アクセスやスキーマ不一致の行追加が型レベルで排除されます：

```idris
data Command : (t : Table) -> Type where
  PrintSchema : Command t
  PrintSize   : Command t
  New         : (newSchema : Schema) -> Command t
  Prepend     : Row (schema t) -> Command t
  Get         : Fin (size t) -> Command t
  Delete      : Fin (size t) -> Command t
  Quit        : Command t
```

アプリケーションのコアロジックは失敗の可能性がないため、`Either` でラップすることなく全域関数として実装できます：

```idris
applyCommand : (t : Table) -> Command t -> Table
applyCommand t                 PrintSchema = t
applyCommand t                 PrintSize   = t
applyCommand _                 (New ts)    = MkTable ts _ []
applyCommand (MkTable ts n rs) (Prepend r) = MkTable ts _ $ r :: rs
applyCommand t                 (Get x)     = t
applyCommand t                 Quit        = t
applyCommand (MkTable ts n rs) (Delete x)  = case n of
  S k => MkTable ts k (deleteAt x rs)
  Z   => absurd x
```

## コマンドのパース (Parsing Commands)

ユーザー入力のエラーハンドリングのために、エラー型を定義します：

```idris
data Error : Type where
  UnknownCommand : String -> Error
  UnknownType    : (pos : Nat) -> String -> Error
  InvalidField   : (pos : Nat) -> ColType -> String -> Error
  ExpectedEOI    : (pos : Nat) -> String -> Error
  UnexpectedEOI  : (pos : Nat) -> String -> Error
  OutOfBounds    : (size : Nat) -> (index : Nat) -> Error
  NoNat          : String -> Error
```

Idris の文字列補間構文（`"\{expr}"`）を用いてエラーメッセージを生成します：

```idris
showColType : ColType -> String
showColType I64      = "i64"
showColType Str      = "str"
showColType Boolean  = "boolean"
showColType Float    = "float"

showSchema : Schema -> String
showSchema = concat . intersperse "," . map showColType

allTypes : String
allTypes = concat
         . List.intersperse ", "
         . map showColType
         $ [I64,Str,Boolean,Float]

showError : Error -> String
showError (UnknownCommand x) = """
  Unknown command: \{x}.
  Known commands are: clear, schema, size, new, add, get, delete, quit.
  """

showError (UnknownType pos x) = """
  Unknown type at position \{show pos}: \{x}.
  Known types are: \{allTypes}.
  """

showError (InvalidField pos tpe x) = """
  Invalid value at position \{show pos}.
  Expected type: \{showColType tpe}.
  Value found: \{x}.
  """

showError (ExpectedEOI k x) = """
  Expected end of input.
  Position: \{show k}
  Input: \{x}
  """

showError (UnexpectedEOI k x) = """
  Unxpected end of input.
  Position: \{show k}
  Input: \{x}
  """

showError (OutOfBounds size index) = """
  Index out of bounds.
  Size of table: \{show size}
  Index: \{show index}
  Note: Indices start at 1.
  """

showError (NoNat x) = "Not a natural number: \{x}"
```

スキーマ、CSV 行、行インデックスのパーサーを実装します：

```idris
zipWithIndex : Traversable t => t a -> t (Nat, a)
zipWithIndex = evalState 1 . traverse pairWithIndex
  where pairWithIndex : a -> State Nat (Nat,a)
        pairWithIndex v = (,v) <$> get <* modify S

fromCSV : String -> List String
fromCSV = forget . split (',' ==)

readColType : Nat -> String -> Either Error ColType
readColType _ "i64"      = Right I64
readColType _ "str"      = Right Str
readColType _ "boolean"  = Right Boolean
readColType _ "float"    = Right Float
readColType n s          = Left $ UnknownType n s

readSchema : String -> Either Error Schema
readSchema = traverse (uncurry readColType) . zipWithIndex . fromCSV

decodeField : Nat -> (c : ColType) -> String -> Either Error (IdrisType c)
decodeField k c s =
  let err = InvalidField k c s
   in case c of
        I64     => maybeToEither err $ read s
        Str     => maybeToEither err $ read s
        Boolean => maybeToEither err $ read s
        Float   => maybeToEither err $ read s

decodeRow : {ts : _} -> String -> Either Error (Row ts)
decodeRow s = go 1 ts $ fromCSV s
  where go : Nat -> (cs : Schema) -> List String -> Either Error (Row cs)
        go k []       []         = Right []
        go k []       (_ :: _)   = Left $ ExpectedEOI k s
        go k (_ :: _) []         = Left $ UnexpectedEOI k s
        go k (c :: cs) (s :: ss) = [| decodeField k c s :: go (S k) cs ss |]

readFin : {n : _} -> String -> Either Error (Fin n)
readFin s = do
  S k <- maybeToEither (NoNat s) $ parsePositive {a = Nat} s
    | Z => Left $ OutOfBounds n Z
  maybeToEither (OutOfBounds n $ S k) $ natToFin k n

readCommand :  (t : Table) -> String -> Either Error (Command t)
readCommand _                "schema"  = Right PrintSchema
readCommand _                "size"    = Right PrintSize
readCommand _                "quit"    = Right Quit
readCommand (MkTable ts n _) s         = case words s of
  ["new",    str] => New     <$> readSchema str
  "add" ::   ss   => Prepend <$> decodeRow (unwords ss)
  ["get",    str] => Get     <$> readFin str
  ["delete", str] => Delete  <$> readFin str
  _               => Left $ UnknownCommand s
```

## アプリケーションの実行 (Running the Application)

結果表示とメインループを実装します：

```idris
encodeField : (t : ColType) -> IdrisType t -> String
encodeField I64     x     = show x
encodeField Str     x     = show x
encodeField Boolean True  = "t"
encodeField Boolean False = "f"
encodeField Float   x     = show x

encodeRow : (ts : List ColType) -> Row ts -> String
encodeRow ts = concat . intersperse "," . go ts
  where go : (cs : List ColType) -> Row cs -> Vect (length cs) String
        go []        []        = []
        go (c :: cs) (v :: vs) = encodeField c v :: go cs vs

result :  (t : Table) -> Command t -> String
result t PrintSchema = "Current schema: \{showSchema t.schema}"
result t PrintSize   = "Current size: \{show t.size}"
result _ (New ts)    = "Created table. Schema: \{showSchema ts}"
result t (Prepend r) = "Row prepended: \{encodeRow t.schema r}"
result _ (Delete x)  = "Deleted row: \{show $ FS x}."
result _ Quit        = "Goodbye."
result t (Get x)     =
  "Row \{show $ FS x}: \{encodeRow t.schema (index x t.rows)}"

covering
runProg : Table -> IO ()
runProg t = do
  putStr "Enter a command: "
  str <- getLine
  case readCommand t str of
    Left err   => putStrLn (showError err) >> runProg t
    Right Quit => putStrLn (result t Quit)
    Right cmd  => putStrLn (result t cmd) >>
                  runProg (applyCommand t cmd)

covering
main : IO ()
main = runProg $ MkTable [] _ []
```

<!-- vi: filetype=idris2:syntax=markdown
-->
