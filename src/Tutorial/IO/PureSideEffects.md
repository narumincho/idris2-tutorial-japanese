# 純粋な副作用？

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/PureSideEffects.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/PureSideEffects.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.IO.PureSideEffects

import Data.List1
import Data.String
import Data.Vect

%default total
```

導入章の *Hello World* の例を思い出すと、次のような型と実装になっていました：

```idris
hello : IO ()
hello = putStrLn "Hello World!"
```

このモジュールを REPL にロードして `hello` を評価すると、次のような出力が得られます：

```repl
Tutorial.IO> hello
MkIO (prim__putStr "Hello World!")
```

「Hello World!」と画面に表示されることを期待していたなら、これは意外な結果かもしれません。何が起きているかを説明するために、REPL での式の評価方法を簡単に見てみましょう。

REPL で式を評価すると、Idris はどこかで簡約できなくなる（行き詰まる）まで式を値へと簡約（reduce）しようとします。上の例では、Idris は `prim__putStr` 関数で行き詰まります。これは *Prelude* で定義されている **外部関数 (foreign function)** であり、各バックエンドが動作するために実装を提供する必要があります。コンパイル時（および REPL 上）において、Idris は外部関数の実装について何も知らないため、コンパイラ自身に組み込まれていない限り外部関数の呼び出しを簡約することはできません。しかしそれ以上に、`IO a` 型（`a` は型パラメータ）の値はそもそも通常は簡約されません。

重要なのは、`IO a` 型の値は「**実行されたときに**、途中で任意の副作用を実行した後に `a` 型の値を返すプログラムの **記述（Description）**」であると理解することです。たとえば `putStrLn` の型は `String -> IO ()` です。これは「`putStrLn` は、`String` 引数を受け取ると、出力型が `()` であるエフェクトフルなプログラムの記述を返す関数である」と読みます（`()` は *Prelude* で定義されている要素数 0 のタプル `Unit` 型の糖衣構文であり、唯一の値 `MkUnit` を持ち、コード内でも `()` と書くことができます）。

`IO a` 型の値はエフェクトフルな計算の単なる記述に過ぎないため、そのような値を返したり引数として受け取ったりする関数は依然として **純粋 (pure)** であり、参照透過です。しかし、`IO a` 型の値から `a` 型の値を取り出すことはできません。つまり、一般的な関数 `IO a -> a` は存在しません。もしそのような関数が存在すれば、引数から結果を取り出す際に不意に副作用が実行されてしまい、参照透過性が崩れてしまうからです（実際には `unsafePerformIO` という関数が存在しますが、何をしているか完全に理解していない限り絶対に使わないでください）。

## Do ブロック (Do Blocks)

純粋関数型プログラミングが初めての方は、「エフェクトフルなプログラムの記述があっても、実行できないなら何の役にも立たないではないか」と思うかもしれません。もう少しお付き合いください。プログラムを書く際に `IO a` 型の値を自分で実行することはできず（`IO a -> a` という関数は存在しない）、しかしそのような計算を連鎖させてより複雑なプログラムを記述することはできます。Idris はそのための特別な構文である **do ブロック (do block)** を提供しています。以下に例を示します：

```idris
export
readHello : IO ()
readHello = do
  name <- getLine
  putStrLn $ "Hello " ++ name ++ "!"
```

何が起きているかを説明する前に、REPL で実行してみましょう：

```repl
Tutorial.IO> :exec readHello
Stefan
Hello Stefan!
```

これは対話的なプログラムであり、標準入力から1行読み取り（`getLine`）、その結果を変数 `name` に代入し、その `name` を使って挨拶を作成して標準出力に書き出します。

`readHello` の実装の先頭にある `do` キーワードに注目してください。これは **do ブロック** を開始し、`IO` 計算を連鎖させたり、左向きの矢印（`<-`）を使って中間結果を変数に束縛し、後続の `IO` アクションで使用したりできます。この概念は非常に強力であり、副作用を伴う任意のプログラムを単一の `IO` 型の値としてカプセル化できます。そして、その記述はコンパイルされた Idris バイナリの実行時エントリポイントである `main` 関数から返すことができます。

## プログラムの記述と実行の違い

エフェクトフルな計算の **記述** とその **実行** の違いをより深く理解するために、小さなプログラムを見てみましょう：

```idris
launchMissiles : IO ()
launchMissiles = putStrLn "Boom! You're dead."

export
friendlyReadHello : IO ()
friendlyReadHello = do
  _ <- putStrLn "Please enter your name."
  readHello

actions : Vect 3 (IO ())
actions = [launchMissiles, friendlyReadHello, friendlyReadHello]

runActions : Vect (S n) (IO ()) -> IO ()
runActions (_ :: xs) = go xs
  where go : Vect k (IO ()) -> IO ()
        go []        = pure ()
        go (y :: ys) = do
          _ <- y
          go ys

readHellos : IO ()
readHellos = runActions actions
```

このコードの動作を説明する前に、`runActions` の実装で使用されている `pure` 関数に注目してください。これは制約付き関数であり、次の章で詳しく学びます。`IO` に特化させると `a -> IO a` というジェネリックな型を持ち、値を `IO` アクションでラップします。生成された `IO` プログラムは、いかなる副作用も実行せずにラップされた値をそのまま返します。それでは `readHellos` の全体像を見てみましょう。

まず、より親切なバージョンの `readHello` を定義します：実行されると、名前を明示的に尋ねます。`putStrLn` の結果はこれ以上使用しないため、アンダースコア `_` をプレースホルダーとして使用しています。その後 `readHello` が呼び出されます。また、実行されると地球を破滅させる `launchMissiles` も定義しています。

さて、`runActions` は「`IO` アクションの記述」と「その実行」が異なることを示すための関数です。この関数は、引数として受け取った空でないベクトルから先頭のアクションを破棄し、残りの `IO` アクションを順番に実行することを記述した新しい `IO` アクションを返します。期待通りに動作すれば、`runActions` に渡された最初のアクションは、その潜在的な副作用ごと静かに破棄されるはずです。

REPL で `readHellos` を実行すると、`actions` の先頭に `launchMissiles` が含まれているにもかかわらず、名前を2回尋ねられるだけです。幸いなことに、破滅的な処理を記述したものの、そのアクションは評価・実行されず安全であることがわかります。

この例から以下の重要な教訓が得られます：

- `IO a` 型の値はプログラムの **純粋な記述** であり、**実行されたときに** 任意の副作用を実行して `a` 型の値を返します。
- `IO a` 型の値は、勝手に実行される危険なしに、関数から安全に返したり、引数やデータ構造の中で引き回したりできます。
- `IO a` 型の値は、**do ブロック** 内で安全に組み合わせて新しい `IO` アクションを **記述** できます。
- `IO` アクションが実際に実行されるのは、REPL で `:exec` に渡されたときか、コンパイルされた Idris プログラムの `main` 関数として実行されたときだけです。
- `IO` のコンテキストから抜け出すことは決してできません：`IO a -> a` という型を持つ関数は存在しません。なぜなら、そのような関数は最終結果を取り出すために引数を実行する必要があり、参照透過性を破壊してしまうからです。

## 純粋なコードと `IO` アクションの組み合わせ

この小見出しは多少語弊があるかもしれません。`IO` アクション自体も純粋な値ですが、ここで一般に意味するのは、非 `IO` の関数とエフェクトフルな計算を組み合わせるということです。

例として、簡単な算術式を評価する小さなプログラムを作成してみましょう。簡単のため、1つの演算子と2つの引数（両方とも整数）のみを持つ式（例: `12 + 13`）のみを扱います。

*base* の `Data.String` モジュールの `split` 関数を使って算術式をトークン化します。その後、2つの整数値と演算子のパースを試みます。ユーザー入力が無効な可能性があるため、これらの操作は失敗する可能性があり、エラー型が必要になります。単に `String` を使うこともできますが、エラー条件には専用の直和型を定義するのが良いプラクティスです。

```idris
public export
data Error : Type where
  NotAnInteger    : (value : String) -> Error
  UnknownOperator : (value : String) -> Error
  ParseError      : (input : String) -> Error

dispError : Error -> String
dispError (NotAnInteger v)    = "Not an integer: " ++ v ++ "."
dispError (UnknownOperator v) = "Unknown operator: " ++ v ++ "."
dispError (ParseError v)      = "Invalid expression: " ++ v ++ "."
```

整数リテラルをパースするために、`Data.String` の `parseInteger` 関数を使用します：

```idris
export
readInteger : String -> Either Error Integer
readInteger s = maybe (Left $ NotAnInteger s) Right $ parseInteger s
```

同様に、算術演算子をパースする関数を宣言・実装します：

```idris
export
readOperator : String -> Either Error (Integer -> Integer -> Integer)
readOperator "+" = Right (+)
readOperator "*" = Right (*)
readOperator s   = Left (UnknownOperator s)
```

これでシンプルな算術式をパースして評価する準備が整いました。これには複数のステップ（入力文字列の分割、各リテラルのパース）が含まれ、そのいずれも失敗する可能性があります。後でモナドについて学ぶと、このような場合にも do ブロックを使用できることがわかります。しかし今回は、別の便利な構文である **let 束縛でのパターンマッチ** を使用してみます：

```idris
eval : String -> Either Error Integer
eval s =
  let [x,y,z]  := forget $ split isSpace s | _ => Left (ParseError s)
      Right v1 := readInteger x  | Left e => Left e
      Right op := readOperator y | Left e => Left e
      Right v2 := readInteger z  | Left e => Left e
   in Right $ op v1 v2
```

このコードを分解してみましょう。1行目では、入力文字列をすべての空白文字の位置で分割します。`split` は `List1`（*base* の `Data.List1` からエクスポートされている空でないリストの型）を返しますが、`List` に対するパターンマッチの方が扱いやすいため、`Data.List1.forget` を使って変換しています。代入演算子 `:=` の左辺でパターンマッチを行っている点に注目してください。これは部分的な（網羅的でない）パターンマッチであるため、縦線 `|` の後で他の可能性に対処する必要があります。これは「左辺のパターンマッチが成功し、ちょうど3つのトークンからなるリストが得られた場合は `let` 式を続行し、それ以外の場合は直ちに `ParseError` を `Left` で返す」と読めます。

他の3行もまったく同様に動作します。左辺に部分パターンマッチがあり、無効な入力の場合に何を返すかが縦線の後に指定されています。この構文は後ほど **do ブロック** 内でも利用できることを見ます。

ここまで実装したすべての機能は **純粋** であり、副作用を伴う計算を記述していない点に注目してください（失敗の可能性自体を観測可能な「エフェクト」と呼ぶこともできますが、それでも上記のコードは参照透過であり、REPL で簡単にテストでき、コンパイル時に評価できます）。

最後に、標準入力から文字列を読み取り、算術式の評価を試みる `IO` アクションにこの機能をラップします：

```idris
exprProg : IO ()
exprProg = do
  s <- getLine
  case eval s of
    Left err  => do
      putStrLn "An error occured:"
      putStrLn (dispError err)
    Right res => putStrLn (s ++ " = " ++ show res)
```

`exprProg` では、失敗の可能性に対処し、結果を表示するために `Either` の両方のコンストラクタを適切に分岐処理する必要がある点に注目してください。また、do ブロックは通常の式であるため、case 式の右辺などで新しい do ブロックを開始できることにも注目してください。

<!-- vi: filetype=idris2:syntax=markdown
-->
