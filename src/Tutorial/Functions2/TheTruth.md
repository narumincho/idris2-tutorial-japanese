# 関数の引数の真実

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions2/TheTruth.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions2/TheTruth.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions2.TheTruth

%default total
```

これまでトップレベル関数を定義する際、以下のようなコードを書いてきました：

```idris
zipEitherWith : (a -> b -> c) -> Either e a -> Either e b -> Either e c
zipEitherWith f (Right va) (Right vb) = Right (f va vb)
zipEitherWith f (Left e)   _          = Left e
zipEitherWith f _          (Left e)   = Left e
```

関数 `zipEitherWith` は、2つの `Either` 内に格納された値を二項関数で結合するジェネリックな高階関数です。いずれかの `Either` 引数が `Left` である場合、結果も `Left` になります。

これは型パラメータ `a`, `b`, `c`, `e` を持つ **ジェネリック関数** です。しかし、REPL で `:ti zipEitherWith` と入力すると（ここでの `i` は暗黙の引数 `implicit` を含めるよう Idris に指示します）、`zipEitherWith` のより詳細な型シグネチャが表示されます：

```idris
zipEitherWith' :  {0 a : Type}
               -> {0 b : Type}
               -> {0 c : Type}
               -> {0 e : Type}
               -> (a -> b -> c)
               -> Either e a
               -> Either e b
               -> Either e c
```

ここで何が起きているのかを理解するために、名前付き引数、暗黙の引数、および多重度について説明します。

## 名前付き引数 (Named Arguments)

関数の型シグネチャにおいて、各引数に名前を付けることができます：

```idris
fromMaybe : (deflt : a) -> (ma : Maybe a) -> a
fromMaybe deflt Nothing = deflt
fromMaybe _    (Just x) = x
```

ここでは第1引数に `deflt`、第2引数に `ma` という名前を付けています。これらの名前は、`deflt` のように関数の実装内で再利用できますが、必須ではありません（実装側で別の名前を使っても構いません）。引数に名前を付ける理由はいくつかあります。ドキュメントとしての役割を果たすだけでなく、以下の構文を使って引数を任意の順序で渡すことができるようになります：

```idris
extractBool : Maybe Bool -> Bool
extractBool v = fromMaybe { ma = v, deflt = False }
```

あるいは部分適用として以下のように書くこともできます：

```idris
extractBool2 : Maybe Bool -> Bool
extractBool2 = fromMaybe { deflt = False }
```

レコードコンストラクタの引数は、フィールド名に従って自動的に名前が付けられます：

```idris
record Dragon where
  constructor MkDragon
  name      : String
  strength  : Nat
  hitPoints : Int16

gorgar : Dragon
gorgar = MkDragon { strength = 150, name = "Gorgar", hitPoints = 10000 }
```

上記のユースケースにおいて、名前付き引数は単なる便利な機能であり、完全に任意です。しかし、Idris は **依存型 (dependently typed)** プログラミング言語です。型は値から計算でき、値に依存することができます。たとえば、関数の **戻り値の型** が引数の **値** に **依存** することができます。以下に例を示します：

```idris
IntOrString : Bool -> Type
IntOrString True  = Integer
IntOrString False = String

intOrString : (v : Bool) -> IntOrString v
intOrString False = "I'm a String"
intOrString True  = 1000
```

このようなコードを初めて目にする場合、理解するのが難しいかもしれません。まず、関数 `IntOrString` は `Bool` 値から `Type` を計算します。引数が `True` ならば `Integer` 型を返し、`False` ならば `String` 型を返します。これを利用して、関数 `intOrString` の戻り値の型をブール引数 `v` に基づいて計算しています。`v` が `True` の場合、戻り値の型は（`IntOrString True = Integer` に従って）`Integer` になり、それ以外の場合は `String` になります。

`intOrString` の型シグネチャにおいて、戻り値の型 `IntOrString v` で参照するために、`Bool` 型の引数に名前（`v`）を **付けなければならない** 点に注目してください。

なぜこのような機能が有用なのか、なぜこのような一見奇妙な型の関数を定義したいのか疑問に思うかもしれません。これについては後ほど非常に有用な例がたくさん登場します！ 現時点では、依存関数型を表現するためには、関数の引数に名前を付け、他の引数や戻り値の型の中でそれらを参照する必要がある、ということだけ理解しておけば十分です。

## 暗黙の引数 (Implicit Arguments)

暗黙の引数（Implicit arguments）とは、コンパイラが自動的に推論して補完すべき引数のことです。たとえば以下の関数シグネチャにおいて、型パラメータ `a` の値は他の引数の型からコンパイラが自動的に推論することを期待しています（`0` の多重度については次のサブセクションで解説するので、一旦無視してください）：

```idris
maybeToEither : {0 a : Type} -> Maybe a -> Either String a
maybeToEither Nothing  = Left "Nope"
maybeToEither (Just x) = Right x

-- 上記は以下と等価であることを思い出してください:
maybeToEither' : Maybe a -> Either String a
maybeToEither' Nothing  = Left "Nope"
maybeToEither' (Just x) = Right x
```

括弧 `()` で囲む明示的な名前付き引数とは異なり、暗黙の引数は波括弧 `{}` で囲まれます。暗黙の引数の値を常に推論できるとは限りません。たとえば REPL で以下のように入力すると、Idris はエラーを出力します：

```repl
Tutorial.Functions2> show (maybeToEither Nothing)
Error: Can't find an implementation for Show (Either String ?a).
```

Idris は、`a` が具体的に何であるかわからないため、`Show (Either String a)` の実装を見つけることができません。型パラメータの前のクエスチョンマーク `?a` に注目してください。このような場合、型チェッカーを助ける方法がいくつかあります。1つの方法は、暗黙の引数に対して明示的に値を渡すことです：

```repl
Tutorial.Functions2> show (maybeToEither {a = Int8} Nothing)
"Left \"Nope\""
```

このように、明示的な名前付き引数と同じ構文を使用し、2つの引数渡し形式を混在させることができます。

また、*Prelude* のユーティリティ関数 `the` を使用して式全体の型を明示的に指定することもできます：

```repl
Tutorial.Functions2> show (the (Either String Int8) (maybeToEither Nothing))
"Left \"Nope\""
```

`the` の型シグネチャを確認してみると有益です：

```repl
Tutorial.Functions2> :ti the
Prelude.the : (0 a : Type) -> a -> a
```

これを恒等関数 `id` と比較してみてください：

```repl
Tutorial.Functions2> :ti id
Prelude.id : {0 a : Type} -> a -> a
```

2つの関数の唯一の違いは、`the` では型パラメータ `a` が **明示的** な引数であるのに対し、`id` では **暗黙的** な引数である点です。これら2つの関数はほぼ同一の型（および実装！）を持っていますが、用途は全く異なります。`the` は型推論を補助するために使われ、`id` は引数を一切変更せずにそのまま返したい場合に使われます。

型推論を補助する上記2つの方法はどちらも頻繁に使われるため、Idris プログラマにとって必須の知識です。

## 多重度 (Multiplicities / Quantities)

最後に、本節のいくつかの型シグネチャに現れた多重度 `0` について説明します。Idris 2 は前身の Idris 1 とは異なり、**量的型理論 (Quantitative Type Theory; QTT)** と呼ばれるコア言語に基づいています。Idris 2 のすべての変数には、以下の3つの多重度のいずれかが関連付けられています：

- `0`: その変数が実行時に **消去 (erased)** されることを意味します。
- `1`: その変数が実行時に **ちょうど1回** 使用される（線形性を持つ）ことを意味します。
- **無制限 (Unrestricted; デフォルト)**: その変数が実行時に任意の回数使用されることを意味します。

多重度 `1` についてはここでは扱いません。しかし、多重度 `0` は頻繁に使用されます。多重度 `0` の変数は **コンパイル時にのみ** 関連します。実行時には一切存在せず、そのような変数の計算がプログラムの実行時パフォーマンスに影響を与えることはありません。

`maybeToEither` の型シグネチャでは、型パラメータ `a` が多重度 `0` を持っているため、実行時には消去されてコンパイル時のみに関与し、`Maybe a` 引数は無制限の多重度を持っています。

明示的な引数に多重度を注釈することも可能です。その場合、引数は括弧 `()` で囲む必要があります。例として先ほどの `the` の型シグネチャを思い出してください。

## アンダースコア `_` の活用

必要最小限のコードだけを書き、残りは Idris に推論させることが望ましい場合が多くあります。パターンマッチのキャッチオールパターンでその一例を見ました。パターンマッチ内の変数が右辺で使われない場合、単に省略することはできませんが、プレースホルダーとしてアンダースコア `_` を使用できます：

```idris
isRight : Either a b -> Bool
isRight (Right _) = True
isRight _         = False
```

しかし、`isRight` の型シグネチャを見ると、型パラメータ `a` と `b` も1度しか使われておらず、名前自体には重要性がないことがわかります。これらも省略してみましょう：

```idris
isRight' : Either _ _ -> Bool
isRight' (Right _) = True
isRight' _         = False
```

`zipEitherWith` の詳細な型シグネチャにおいて、暗黙の引数が `Type` 型であることは Idris にとって明白です。これらはすべて後で `Type -> Type -> Type` 型の `Either` 型コンストラクタに適用されるためです。これもアンダースコアに置き換えることができます：

```idris
zipEitherWith'' :  {0 a : _}
                -> {0 b : _}
                -> {0 c : _}
                -> {0 e : _}
                -> (a -> b -> c)
                -> Either e a
                -> Either e b
                -> Either e c
```

以下の例を考えてみましょう：

```idris
foo : Integer -> String
foo n = show (the (Either String Integer) (Right n))
```

`Integer` を `Right` でラップしているため、`Either String Integer` の第2引数が `Integer` であることは自明です。Idris が推論できないのは `String` 引数だけです。さらに、`Either` 自体も自明です！ 不要な冗長さを取り除いてみましょう：

```idris
foo' : Integer -> String
foo' n = show (the (_ String _) (Right n))
```

ただし、`foo'` のようにアンダースコアを過度に使用するとコードが難読化する可能性があるため、常に好ましいとは限らないことに注意してください。コードをより読みやすくするために糖衣構文を使い、単に賢く見せるためだけに使わないようにしましょう。

<!-- vi: filetype=idris2:syntax=markdown
-->
