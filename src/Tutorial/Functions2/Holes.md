# ホール（Hole）を用いたプログラミング

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions2/Holes.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions2/Holes.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions2.Holes

%default total
```

ここまでの練習問題はすべて解けましたか？ 型チェッカーがエラーばかり出して全然助けてくれないと憤りを感じていませんか？ そろそろその見方を変える時です。Idris には非常に強力な対話的編集機能が備わっています。型が十分に具体的であれば、コンパイラが完全な関数実装を自動生成してくれることさえあります。それができない場合でも、型が複雑になりすぎたときに大いに助けとなってくれる重要で便利な機能があります。それが **ホール (Hole)** です。ホールとは、クエスチョンマーク `?` で始まる変数名のことです。後で実装する予定のコードのプレースホルダー（未実装箇所）として使用できます。さらに、ホールの型や、スコープ内にある他のすべての変数の型・数量を REPL（またはプラグインをセットアップしたエディタ）で確認できます。実際にホールを使ってみましょう。

先ほどの練習問題の `traverseList` の例を覚えていますか？ アプリカティブなリストのトラバース（走査）に初めて触れた場合、かなり難しく感じたかもしれません。ここではそれをもう少し発展させてみましょう。`Semigroup` の実装を持つ型 `e` を使って `Either e` を返す関数に対して同じ機能を実装し、途中で遭遇したすべての `Left` 内の値を集約（累積）できるようにします。

関数の型は以下の通りです：

```idris
traverseEither :  Semigroup e
               => (a -> Either e b)
               -> List a
               -> Either e (List b)
```

任意の練習として、まずは自力で実装に挑戦してみるのも良いでしょう。必要な知識はすべて学びました：

- 半群（Semigroup）は、2つの値を1つに結合する演算 `<+> : e -> e -> e` を持っています。
- 空リストの場合は自明に成功（`Right []`）します。
- 関数の適用のいずれかが失敗した場合、すべてのエラー `e` を統合して返します。
- すべての関数の適用が成功した場合、すべての結果 `b` を含むリストを返します。
- コンパイルが通ったら、本節の末尾にあるテスト関数と変数を使って意図通りに動作することを確認できます。

さて、解説に沿って進めるために、Idris ソースファイルを新しく作成して REPL セッションにロードし、以下のようにコードを書き進めてみてください。最初に行うのは、右辺にホールを置いた骨格の実装を書くことです：

```repl
traverseEither fun as = ?impl
```

REPL に戻って `:r` コマンドでファイルを再読み込みすると、`:m` コマンドですべての **メタ変数 (metavariables / holes)** を一覧表示できます：

```repl
Tutorial.Functions2> :m
1 hole:
  Tutorial.Functions2.impl : Either e (List b)
```

次に、ホールの型（周囲のコンテキストにあるすべての変数とその型を含む）を確認します：

```repl
Tutorial.Functions2> :t impl
 0 b : Type
 0 a : Type
 0 e : Type
   as : List a
   fun : a -> Either e b
------------------------------
impl : Either e (List b)
```

このように、消去される型パラメータ（`a`, `b`, `e`）、`List a` 型の値 `as`、そして `a -> Either e b` 型の関数 `fun` がスコープ内に存在します。私たちの目標は、`Either e (List b)` 型の値を作り出すことです。

単に `Right []` を返すこともできますが、それは入力リストが実際に空リストである場合にしか意味を成しません。したがって、まずはリストに対するパターンマッチから始めます：

```repl
traverseEither fun []        = ?impl_0
traverseEither fun (x :: xs) = ?impl_1
```

これにより2つのホールが生成され、それぞれに一意の名前を付ける必要があります。`impl_0` を調べると、以下の結果が得られます：

```repl
Tutorial.Functions2> :t impl_0
 0 b : Type
 0 a : Type
 0 e : Type
   fun : a -> Either e b
------------------------------
impl_0 : Either e (List b)
```

これは興味深い状況です。手元に利用できる値が何もない状態で、`Either e (List b)` 型の値を作り出さなければなりません。`a` については何も知らないため、`fun` を呼び出すための引数を用意できません。同様に `e` や `b` についても何も知らないため、それらの値を新しく作り出すこともできません。唯一可能な選択肢は、`impl_0` を `Right` でラップされた空リストに置き換えることだけです：

```idris
traverseEither fun []        = Right []
```

空でないリストの場合はもう少し複雑です。`?impl_1` のコンテキストは以下のようになります：

```repl
Tutorial.Functions2> :t impl_1
 0 b : Type
 0 a : Type
 0 e : Type
   x : a
   xs : List a
   fun : a -> Either e b
------------------------------
impl_1 : Either e (List b)
```

`x` は `a` 型なので、`fun` の引数として渡すか、無視するかのどちらかです。一方 `xs` は残りのリストで `List a` 型です。これも無視するか、`traverseEither` を再帰的に呼び出して処理を続行するかのどちらかです。目標は **すべての** 値を変換することなので、どちらも無視すべきではありません。また、2つの `Left` が発生した場合は値を集約する必要があるため、最終的に両方の計算（`fun` の呼び出しと `traverseEither` の再帰呼び出し）を実行する必要があります。したがって、両方をペア（`Pair`）にまとめて同時に実行し、1つのパターンマッチで結果を分析します：

```repl
traverseEither fun (x :: xs) =
  case (fun x, traverseEither fun xs) of
   p => ?impl_2
```

再びコンテキストを確認します：

```repl
Tutorial.Functions2> :t impl_2
 0 b : Type
 0 a : Type
 0 e : Type
   xs : List a
   fun : a -> Either e b
   x : a
   p : (Either e b, Either e (List b))
------------------------------
impl_2 : Either e (List b)
```

次に、ペア `p` に対してパターンマッチを行い、2つの計算のうちどちらが成功したかを判別する必要があります：

```repl
traverseEither fun (x :: xs) =
  case (fun x, traverseEither fun xs) of
    (Left y, Left z)   => ?impl_6
    (Left y, Right _)  => ?impl_7
    (Right _, Left z)  => ?impl_8
    (Right y, Right z) => ?impl_9
```

この段階で、元々何をしたかったのか忘れてしまうことがあるかもしれません。その場合もゴールを確認できます：

```repl
Tutorial.Functions2> :t impl_6
 0 b : Type
 0 a : Type
 0 e : Type
   xs : List a
   fun : a -> Either e b
   x : a
   y : e
   z : e
------------------------------
impl_6 : Either e (List b)
```

目標は依然として `Either e (List b)` 型の値であり、スコープ内には `e` 型の2つの値があります。仕様に従い、`e` の `Semigroup` 実装を使ってこれらを `<+>` で結合します。他のケースについても同様に進め、すべての変換が成功した場合にのみ `Right` を返すようにします：

```idris
traverseEither fun (x :: xs) =
  case (fun x, traverseEither fun xs) of
    (Left y, Left z)   => Left (y <+> z)
    (Left y, Right _)  => Left y
    (Right _, Left z)  => Left z
    (Right y, Right z) => Right (y :: z)
```

完成した関数の動作を、小さな例で確認してみましょう：

```idris
data Nucleobase = Adenine | Cytosine | Guanine | Thymine

readNucleobase : Char -> Either (List String) Nucleobase
readNucleobase 'A' = Right Adenine
readNucleobase 'C' = Right Cytosine
readNucleobase 'G' = Right Guanine
readNucleobase 'T' = Right Thymine
readNucleobase c   = Left ["Unknown nucleobase: " ++ show c]

DNA : Type
DNA = List Nucleobase

readDNA : String -> Either (List String) DNA
readDNA = traverseEither readNucleobase . unpack
```

REPL で試してみましょう：

```repl
Tutorial.Functions2> readDNA "CGTTA"
Right [Cytosine, Guanine, Thymine, Thymine, Adenine]
Tutorial.Functions2> readDNA "CGFTAQ"
Left ["Unknown nucleobase: 'F'", "Unknown nucleobase: 'Q'"]
```

## 対話的編集 (Interactive Editing)

関数を実装する際に Idris コンパイラとの対話を容易にするプラグインが、いくつかのエディタ向けに提供されています。Idris コミュニティでよく使われているエディタの1つが Neovim です。[付録](../../Appendices/Neovim.md) に Neovim で利用可能な機能の例を記載しています。

他のエディタを使用している場合でも、現在作業中のソースファイルを読み込んだ REPL セッションを常に開いておくことをお勧めします。これにより、コードを書きながらメタ変数を導入し、その型やコンテキストを確認しながら開発を進めることができます。

<!-- vi: filetype=idris2:syntax=markdown
-->
