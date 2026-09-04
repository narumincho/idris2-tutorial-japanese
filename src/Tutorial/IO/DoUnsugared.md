# Do ブロックの脱糖（糖衣構文の解除）

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/DoUnsugared.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/DoUnsugared.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.IO.DoUnsugared

import Data.List1
import Data.String
import Data.Vect

import Tutorial.IO.PureSideEffects

%default total
```

ここで重要な事実をお伝えします：**do ブロック** には特別な魔法は何一つありません。単なる糖衣構文（シンタックスシュガー）であり、一連の演算子の適用に変換（脱糖 / desugar）されるだけです。[糖衣構文](https://ja.wikipedia.org/wiki/%E7%B3%96%E8%A1%A3%E6%A7%8B%E6%96%87) とは、言語自体の表現力や機能を増やすことなく、特定のコードをより書きやすくするための構文のことです。つまり、すべての `IO` プログラムは `do` 記法を使わずに書くことも可能です。しかし、ネストが深くなって読みづらくなることがあるため、そのような場合に do ブロックが良い構文を提供してくれます。

以下のサンプルプログラムを考えてみましょう：

```idris
sugared1 : IO ()
sugared1 = do
  str1 <- getLine
  str2 <- getLine
  str3 <- getLine
  putStrLn (str1 ++ str2 ++ str3)
```

コンパイラは、**関数名の曖昧さ解消や型チェックを行う前** に、これを以下のプログラムに変換します：

```idris
desugared1 : IO ()
desugared1 =
  getLine >>= (\str1 =>
    getLine >>= (\str2 =>
      getLine >>= (\str3 =>
        putStrLn (str1 ++ str2 ++ str3)
      )
    )
  )
```

`desugared1` の実装に `(>>=)` という新しい演算子（**bind** と呼ばれます）が登場しました。REPL でその型を確認すると、以下のようになっています：

```repl
Main> :t (>>=)
Prelude.>>= : Monad m => m a -> (a -> m b) -> m b
```

これは `Monad` と呼ばれるインターフェースを要求する制約付き関数です。`Monad` とその仲間たちについては次の章で詳しく解説します。`IO` に特化させると、*bind* は以下の型を持ちます：

```repl
Main> :t (>>=) {m = IO}
>>= : IO a -> (a -> IO b) -> IO b
```

これは `IO` アクションの逐次実行（シーケンス）を表します。実行されると、1つ目の `IO` アクションが実行され、その結果が2つ目の `IO` アクションを生成する関数に引数として渡され、生成された2つ目のアクションも実行されます。

代数的データ型の章の練習問題で、`Maybe` や `Either e` に対する *bind* をすでに実装したことを覚えているかもしれません。次の章で学ぶように、`Maybe` や `Either e` にも `Monad` の実装が用意されています。現時点では、`Monad` を使うことで、最初の計算の **結果** を2つ目の計算を返す関数に渡しながら、エフェクトを伴う計算を順番に実行できる、と理解しておけば十分です。`desugared1` では、1つの `IO` アクションを実行し、その結果を使って次の `IO` アクションを計算しているのがわかります。ネストした無名関数が何層にも重なって読みにくいため、このような場合には *do ブロック* が優れた代替表現となります。

*do ブロック* は常に一連の *bind* 演算子の適用に脱糖されるため、任意のモナド計算を連結するために使用できます。たとえば、前節の `eval` 関数を *do ブロック* を使って次のように書き直すことができます：

```idris
evalDo : String -> Either Error Integer
evalDo s = case forget $ split isSpace s of
  [x,y,z] => do
    v1 <- readInteger x
    op <- readOperator y
    v2 <- readInteger z
    Right $ op v1 v2
  _       => Left (ParseError s)
```

まだピンとこなくても心配いりません。今後たくさんの例が登場するので、すぐに慣れることができます。重要なのは、*do ブロック* が `desugared1` に示したように常に *bind* 演算子の連鎖に変換されるという点です。

## Unit の束縛 (Binding Unit)

先ほどの `friendlyReadHello` の実装を覚えていますか？

```idris
friendlyReadHello' : IO ()
friendlyReadHello' = do
  _ <- putStrLn "Please enter your name."
  readHello
```

ここにあるアンダースコア `_ <-` は少し冗長で不要に見えます。実際、結果型が `Unit`（`()`）のエフェクトフルな計算を、単にその副作用のために連鎖させるのは非常によくあるユースケースです。たとえば、`friendlyReadHello` を3回繰り返す場合、以下のようになります：

```idris
friendly3 : IO ()
friendly3 = do
  _ <- friendlyReadHello
  _ <- friendlyReadHello
  friendlyReadHello
```

これはあまりに一般的なパターンであるため、Idris では束縛のアンダースコアを完全に省略できます：

```idris
friendly4 : IO ()
friendly4 = do
  friendlyReadHello
  friendlyReadHello
  friendlyReadHello
  friendlyReadHello
```

ただし、上記は少し異なる形に脱糖されます：

```idris
friendly4Desugared : IO ()
friendly4Desugared =
  friendlyReadHello >>
  friendlyReadHello >>
  friendlyReadHello >>
  friendlyReadHello
```

演算子 `(>>)` の型は以下の通りです：

```repl
Main> :t (>>)
Prelude.>> : Monad m => m () -> Lazy (m b) -> m b
```

型シグネチャ内の `Lazy` キーワードに注目してください。これは、ラップされた引数が **遅延評価 (lazily evaluated)** されることを意味します。これは多くの場合に理にかなっています。たとえば対象の `Monad` が `Maybe` である場合、第1引数が `Nothing` であれば結果も直ちに `Nothing` になるため、第2引数を評価する必要すらありません。

## Do のオーバーロード (Do, Overloaded)

Idris は関数や演算子のオーバーロードをサポートしているため、独自の *bind* 演算子を定義することで、`Monad` の実装を持たない型に対しても *do 記法* を使用できます。たとえば以下は、ベクトルを返す計算を連結するためのカスタム `(>>=)` の実装です。最初のベクトル（長さ `m`）の各要素が長さ `n` のベクトルに変換され、結果が連結されて長さ `m * n` のベクトルになります：

```idris
flatten : Vect m (Vect n a) -> Vect (m * n) a
flatten []        = []
flatten (x :: xs) = x ++ flatten xs

(>>=) : Vect m a -> (a -> Vect n b) -> Vect (m * n) b
as >>= f = flatten (map f as)
```

この振る舞いをカプセル化する `Monad` の実装を書くことはできません。型が合わないためです：`Vect` に特化したモナディックな *bind* は `Vect k a -> (a -> Vect k b) -> Vect k b` という型を持ちます。ご覧の通り、3箇所の `Vect` のサイズがすべて同一でなければならず、これはカスタム版の *bind* で表現した仕様とは異なります。実際の動作例を見てみましょう：

```idris
modString : String -> Vect 4 String
modString s = [s, reverse s, toUpper s, toLower s]

testDo : Vect 24 String
testDo = DoUnsugared.do
  s1 <- ["Hello", "World"]
  s2 <- [1, 2, 3]
  modString (s1 ++ show s2)
```

`testDo` を手動で脱糖し、REPL での結果と比較してどのように動作するか確認してみてください。`do` キーワードの前に演算子の名前空間の一部をプレフィックスとして付与することで、どのバージョンの *bind* 演算子を使用するかを Idris に指示している点に注目してください。

もちろん、*do ブロック* の挙動をオーバーロードしたい場合は、`(>>=)` と同様に `(>>)` もオーバーロードできます（すべきです）。

### モジュールと名前空間 (Modules and Namespaces)

すべてのデータ型、関数、演算子は、その **名前空間 (namespace)** をプレフィックスとして付けることで曖昧さなく一意に識別できます。関数の名前空間は通常、それが定義されたモジュール名と同じです。たとえば関数 `eval` の完全修飾名は `Tutorial.IO.eval` になります。関数名や演算子名は、その名前空間内で一意でなければなりません。

すでに見舞った通り、Idris は異なる名前空間で定義された同名の関数を、関与する型に基づいて曖昧さ解消することがよくあります。推論が不可能な場合は、関数名や演算子名の前に完全な名前空間の末尾（サフィックス）をプレフィックスとして付けることでコンパイラを助けることができます：

```repl
Tutorial.IO> :t (>>=)
Prelude.>>= : Monad m => m a -> (a -> m b) -> m b
Tutorial.IO.>>= : Vect m a -> (a -> Vect n b) -> Vect (m * n) b
```

このように、このモジュールを REPL にロードして `(>>=)` の型を確認すると、スコープ内に同名の演算子が2つ存在するため2つの結果が表示されます。カスタム *bind* 演算子の型だけを表示させたい場合は、完全な名前空間ではなく `IO.` をプレフィックスとして付けるだけで十分です：

```repl
Tutorial.IO> :t IO.(>>=)
Tutorial.IO.>>= : Vect m a -> (a -> Vect n b) -> Vect (m * n) b
Tutorial.IO> :t Tutorial.IO.(>>=)
Tutorial.IO.>>= : Vect m a -> (a -> Vect n b) -> Vect (m * n) b
```

同じモジュール内で同名のオーバーロード関数を複数定義したい場合のために、Idris ではモジュール内に追加の名前空間を追加できます（名前空間内のすべての定義は同じインデント幅で整列させる必要があります）：

```idris
namespace Foo
  export
  eval : Nat -> Nat -> Nat
  eval = (*)

-- ここで `eval` に名前空間を付けることは必須ではありません
testFooEval : Nat
testFooEval = Foo.eval 12 100
```

ここで重要な点があります：関数やデータ型がその名前空間やモジュールの外部からアクセスできるようにするには、`export` または `public export` キーワードでアノテーションを付けて **エクスポート** する必要があります。

`export` と `public export` の違いは以下の通りです：
- `export` で修飾された関数は、その型のみがエクスポートされ、他の名前空間から呼び出すことができます。`export` で修飾されたデータ型は、型コンストラクタのみがエクスポートされ、データコンストラクタは非公開になります。
- `public export` で修飾された関数は、その実装（定義）もエクスポートされます。これは、関数をコンパイル時計算で使用するために必要です。`public export` で修飾されたデータ型は、データコンストラクタもエクスポートされます。

一般的に、データ型は `public export` で修飾することを推奨します。そうしないと、外部モジュールからその型の値を生成したり、パターンマッチで分解したりできなくなるためです。一方、関数については、コンパイル時計算で使用する予定がない限り `export` で修飾するのが基本です。

## 感嘆符による Bind (Bind, with a Bang `!`)

エフェクトフルな計算の組み合わせを表現するのに、*do ブロック* でさえ冗長に感じられる場合があります。そのような場合、純粋な式はそのままにし、エフェクトフルな部分の先頭に感嘆符 `!` を付けることができます（空白を含む場合は括弧で囲みます）：

```idris
getHello : IO ()
getHello = putStrLn $ "Hello " ++ !getLine ++ "!"
```

上記は以下の *do ブロック* に脱糖されます：

```idris
getHello' : IO ()
getHello' = do
  s <- getLine
  putStrLn $ "Hello " ++ s ++ "!"
```

もう1つの例を示します：

```idris
bangExpr : String -> String -> String -> Maybe Integer
bangExpr s1 s2 s3 =
  Just $ !(parseInteger s1) + !(parseInteger s2) * !(parseInteger s3)
```

脱糖された *do ブロック* は以下の通りです：

```idris
bangExpr' : String -> String -> String -> Maybe Integer
bangExpr' s1 s2 s3 = do
  x1 <- parseInteger s1
  x2 <- parseInteger s2
  x3 <- parseInteger s3
  Just $ x1 + x2 * x3
```

糖衣構文は、コードをより読みやすく、より便利に書くために導入されたものであることを忘れないでください。単に賢く見せるためだけに乱用すると、他の人（そして未来の自分自身！）がコードを読んで理解するのが困難になってしまいます。

<!-- vi: filetype=idris2:syntax=markdown
-->
