# ジェネリックなデータ型 (Generic Data Types)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/GenericDataTypes.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/GenericDataTypes.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.GenericDataTypes

import Tutorial.DataTypes.Enumerations
```

特定の概念が十分に汎用的である場合、それを1つの型だけでなくあらゆる型に適用したいことがあります。たとえば、リストに入れたい型ごとにリストの概念を何度も定義し直さなければならないとしたら非常に不便です。整数のリストと文字列のリストは中身の型こそ違いますが、同じ構造を共有しており、その構造を重複して定義するのはコードの無駄です。代わりに、保持する値の型によって **パラメータ化** された、単一のジェネリックなリスト型を用意したいと考えます。

本節では、ジェネリックなデータ型の定義と使用法について学びます。

## Maybe

列挙型のセクションで説明した `Weekday` 型の値を、ユーザー入力からパース（文字列から変換）することを考えてみましょう。このパース関数は、ユーザーが渡した文字列が `"Saturday"` であれば `Saturday` を返すべきですが、たとえば `"sdfkl332"` のような無効な入力の場合は何を返すべきでしょうか？ いくつかの選択肢があります。たとえば `Sunday` のような「デフォルト値」を返すことも考えられますが、ライブラリの利用者がどのような挙動を期待するかを考慮しなければなりません。無効なユーザー入力に対して暗黙のうちにデフォルト値で処理を続行することは、混乱を招く原因となり、最善の選択肢であることは稀です。

従来の命令型言語であれば、このような無効な入力に遭遇した際にはおそらく例外をスローするでしょう。Idris でも *Prelude* の [`idris_crash`](https://www.idris-lang.org/Idris2/prelude/docs/Builtin.html#Builtin.idris_crash) 関数を使って例外を発生させることができますが、そのためには関数の全域性（totality）を放棄しなければなりません（すべての入力に対して値を返すことが保証されなくなります）。パースエラーのようなありふれた処理のために全域性を捨てるのは大きすぎる代償です。

Java、C#、C++ のような言語では、関数が何らかの `null` 値を返すこともあります（そして利用側のコードで適切に処理されなければ悪名高い `NullPointerException` を引き起こします）。ここで採用する解決策は概念的には似ていますが、暗黙的に `null` を返すのではなく、**失敗の可能性を型によって明示** します。失敗する可能性をカプセル化したカスタムデータ型を定義するのです。

Idris では新しいデータ型を非常にわずかなコードで安価に定義できるため、型安全性を高めるための手法としてこのパターンが非常によく使われます。今回のユースケースに対する専用の型と、それに関連するパース関数は以下のようになります：

```idris
data MaybeWeekday = WD Weekday | NoWeekday

total
readWeekday : String -> MaybeWeekday
readWeekday "Monday"    = WD Monday
readWeekday "Tuesday"   = WD Tuesday
readWeekday "Wednesday" = WD Wednesday
readWeekday "Thursday"  = WD Thursday
readWeekday "Friday"    = WD Friday
readWeekday "Saturday"  = WD Saturday
readWeekday "Sunday"    = WD Sunday
readWeekday _           = NoWeekday
```

しかし、ユーザー入力から `Bool` も読み取りたい場合はどうでしょうか？ また別のカスタム型 `MaybeBool` を書く必要があり、`String` からパースしたい型が増えるたびに同様の定義が必要になってしまいます。

他の多くの言語と同様に、Idris では **ジェネリックなデータ型 (generic data types)** を使用してこの挙動を一般化できます。`MaybeWeekday` の **ジェネリック** 版は以下のようになります：

> [!NOTE]
> Prelude ではこの型は `Maybe` と呼ばれていますが、ここでは名前の衝突を避けるために `Option` と呼んでいます。また、データコンストラクタの名前も変更しており、`Some` は `Just` に、`None` は `Nothing` に対応しています。
>
> `Option` という名前は他のプログラミング言語でも馴染みがあるかもしれません。たとえば Rust ではこの概念に `Option` という名前を使い、C++ では `optional` を使用します。

```idris
data Option a = Some a | None

total
readBool : String -> Option Bool
readBool "True"    = Some True
readBool "False"   = Some False
readBool _         = None
```

REPL でこれらの型を確認してみましょう：

```repl
Tutorial.DataTypes.GenericDataTypes> :t Some
Tutorial.DataTypes.GenericDataTypes.Some : a -> Option a
Tutorial.DataTypes.GenericDataTypes> :t None
Tutorial.DataTypes.GenericDataTypes.None : Option a
Tutorial.DataTypes.GenericDataTypes> :t Option
Tutorial.DataTypes.GenericDataTypes.Option : Type -> Type
```

> [!NOTE]
> `Option` は **型コンストラクタ (type constructor)** と呼ばれるものであり、それ単体ではまだ完全な型ではありません。これは `Type` から `Type` への **関数** です。`Type` 引数を与えて初めて実際の **型** になります。
>
> `Option` は `Type` 型の **パラメータ** によってパラメータ化された型コンストラクタであると言えます。`Option` 単体は型ではありませんが、`Option Bool` や `Option Weekday` は型です。`Option (Option Bool)` も有効な型です。
>
> `Some` と `None` は `Option` の **データコンストラクタ** であり、与えられた型 `a` に対する `Option a` 型の値を構築するための関数です。

`Option` の他のユースケースを見てみましょう。以下は安全な除算演算であり、ゼロ除算時に例外を投げる代わりに `None` を返します：

```idris
total
safeDiv : Integer -> Integer -> Option Integer
safeDiv n 0 = None
safeDiv n k = Some (n `div` k)
```

関数が `Maybe Integer` を返すことと、Java などの言語で `null` を返すことの違いを理解することが重要です。前者の場合、失敗の可能性が型に現れているため、型チェッカーによってプログラマは `Nothing` が返される可能性に対処することを強制されます。パターンマッチを行って `Nothing` の場合を明示的に処理しない限り `Maybe Integer` から `Integer` を取り出すことはできず、Idris ではパターンマッチのケースの処理漏れが許されません。これは、`null` がすべての参照型の有効な値として暗黙に含まれてしまい、プログラマが `null` チェックを忘れて予期せぬ実行時例外を引き起こしがちなアプローチとは対照的です。

## Either

`Maybe` は失敗の可能性を表現するのに非常に便利ですが、失敗時の値である `Nothing` は「何が失敗したのか」に関する情報を含まないため、あまり情報量が多くありません。これで十分な場合も多いですが（たとえば Map からのキー検索で `Nothing` が返ってきた場合はキーが存在しなかったと判断できるなど）、何が原因で失敗したのかを呼び出し元に伝えたい場合も多くあります。

たとえば `Weekday` のパース関数では、入力された無効な文字列が何であったかを後で知りたい場合があります。前節の `Maybe`/`Option` と同様に、この概念も十分に汎用的なので、エラー内容の型も柔軟に扱えるようにしたいと考えます。

これを表現するデータ型を作ってみましょう：

```idris
data Validated e a = Invalid e | Valid a
```

> [!NOTE]
> `Validated` は、`e` と `a` という **2つ** の型パラメータでパラメータ化された型コンストラクタです。
>
> そのデータコンストラクタは、エラー状態を表す値を保持する `Invalid` と、成功した計算結果を表す `Valid` です。

この `Validated` 型を使えば、`readWeekday` 関数に便利なエラー通知機能を追加できます：

```idris
total
readWeekdayV : String -> Validated String Weekday
readWeekdayV "Monday"    = Valid Monday
readWeekdayV "Tuesday"   = Valid Tuesday
readWeekdayV "Wednesday" = Valid Wednesday
readWeekdayV "Thursday"  = Valid Thursday
readWeekdayV "Friday"    = Valid Friday
readWeekdayV "Saturday"  = Valid Saturday
readWeekdayV "Sunday"    = Valid Sunday
readWeekdayV s           = Invalid ("Not a weekday: " ++ s)
```

> [!NOTE]
> `Maybe` と同様に、これも非常に一般的で頻出の概念であるため、*Prelude* にはすでに `Validated` と同等のデータ型が存在します。それが `Either` です。
>
> Either の `Left` データコンストラクタは `Validated` の `Invalid` に相当し、`Right` は `Valid` に相当します。

関数が失敗の可能性を表現するために `Either err val`（`err` はエラー型、`val` は期待される戻り値の型）を返すのは非常に一般的です。これは命令型言語でキャッチ可能な例外を投げることに対する、型安全（かつ全域的！）な代替手段を提供します。

> [!NOTE]
> `Either` の使用は常に `Left` がエラーで `Right` が成功を意味するとは限りません。`Either` を返す関数は単に2つの異なる型の結果を取り得て、それぞれが対応するデータコンストラクタでタグ付けされていることを意味します。

## リスト (List)

純粋関数型プログラミングにおける最も重要なデータ構造の1つが単方向連結リストです。以下のように定義されます（Prelude の `List` との衝突を避けるために `Seq` と命名しています）：

```idris
data Seq a = Nil | (::) a (Seq a)
```

> [!NOTE]
> `Seq` は2つの **データコンストラクタ** で構成されます：
>
> - `Nil`: 空リストを表す
> - `(::)`: 通常「cons（コンス）」と読まれ、型 `a` の要素を同じ型 `a` の別のリストの先頭に追加する
>
> 演算子をデータコンストラクタとして使用している点に注目してください。これは便利なこともありますが、通常は関数やデータコンストラクタにわかりやすい名前を付け、可読性が明らかに向上する場合にのみ演算子を控えめに使用するのが賢明です。

`List` のデータコンストラクタを直接使用すると、以下のようになります：

```idris
total
ints : List Int64
ints = 1 :: 2 :: -3 :: Nil
```

しかし、Idris には上記をより簡潔に書くための特別な構文（リスト構文）が用意されています：

```idris
total
ints2 : List Int64
ints2 = [1, 2, -3]

total
ints3 : List Int64
ints3 = []
```

`ints` と `ints2` の定義はコンパイラによって全く同一に扱われます。

> [!NOTE]
> リスト構文はパターンマッチでも使用できます。

`Seq` と `List` にはもう1つの特徴があります。cons 演算子が値と **別の** `List`/`Seq` を引数に取るため、型自身を使って定義されています。このようなデータ型を **再帰的データ型 (recursive data types)** と呼び、その再帰的な性質上、これらを分解・処理するには通常再帰関数が必要になります。

命令型言語ではリストの要素を走査するために for ループなどを使用しますが、破壊的変更のない純粋関数型言語には従来のループ構文は存在しません。整数のリストの合計を計算する再帰的な書き方を見てみましょう：

```idris
total
intSum : List Integer -> Integer
intSum Nil       = 0
intSum (n :: ns) = n + intSum ns
```

再帰関数は最初は分かりにくく感じるかもしれないので、ステップごとに分解してみましょう。空リストを渡して `intSum` を呼び出すと、最初のパターンにマッチしてすぐに 0 が返されます。一方、`[7, 5, 9]` のような空でないリストを渡すと、以下のように処理が進みます：

1. 2番目のパターンにマッチし、リストが2つに分割されます。先頭（`7`）が変数 `n` に、残りのリスト（`[5, 9]`）が `ns` に束縛されます：

   ```repl
   7 + intSum [5,9]
   ```

2. 2回目の呼び出しで、`intSum` は新しいリスト `[5, 9]` で呼ばれます。2番目のパターンにマッチし、`n` が `5`、`ns` が `[9]` になります：

   ```repl
   7 + (5 + intSum [9])
   ```

3. 3回目の呼び出しで、`intSum` はリスト `[9]` で呼ばれます。`n` が `9`、`ns` が `[]` になります：

   ```repl
   7 + (5 + (9 + intSum []))
   ```

4. 4回目の呼び出しで、`intSum` は空リスト `[]` で呼ばれ、直ちに `0` を返します：

   ```repl
   7 + (5 + (9 + 0))
   ```

5. 3回目の呼び出しの計算で、`9 + 0` が計算されて `9` が返されます：

   ```repl
   7 + (5 + 9)
   ```

6. 2回目の呼び出しの計算で、`5 + 9` が計算されて `14` が返されます：

   ```repl
   7 + 14
   ```

7. 最後に、最初の呼び出しの計算で `7 + 14` が計算され、`21` が返されます。

`intSum` の再帰的実装は一連の入れ子になった呼び出しを生成し、引数が空リストになった時点で終了します。

## ジェネリック関数 (Generic Functions)

ジェネリックなデータ型の汎用性を最大限に引き出すには、ジェネリック関数について理解する必要があります。ジェネリック型と同様に、ジェネリック関数も1つ以上の **型パラメータ** によってパラメータ化されます。

たとえば、`Option` データ型から値を取り出すことを考えてみましょう。`Some` が含まれている場合はその格納された値を返し、`None` の場合はデフォルト値を返したいとします。まず `Integer` に特化した関数を見てみましょう：

```idris
total
integerFromOption : Integer -> Option Integer -> Integer
integerFromOption _ (Some y) = y
integerFromOption x None     = x
```

このような特定型専用の実装では、`Option Bool` や `Option String` など、他のあらゆる `Option` 型から値を取り出すために同様の関数を個別に書かなければならなくなります。当然ながら、ジェネリック関数 `fromOption` を使えばもっとスマートに書くことができます：

```idris
total
fromOption : a -> Option a -> a
fromOption _ (Some y) = y
fromOption x None     = x
```

ここでの小文字の `a` は **型パラメータ** です。この型シグネチャは、「任意の型 `a` について、型 `a` の値と型 `Option a` の値が与えられたとき、型 `a` の値を返す」と読むことができます。

> [!NOTE]
> コンパイラは `a` が「何らかの型である」ということ以外は何も知りません。そのため、`Integer` のように適当な値を勝手に作り出すことはできません。`None` の場合に対処するためには、型 `a` のデフォルト値を引数として受け取る必要があります。

`Maybe` に対する `fromOption` 相当の関数は `fromMaybe` という名前で、*base* ライブラリの `Data.Maybe` モジュールで提供されています。

時には、`fromOption` でさえ汎用性が足りないことがあります。新しくパースした `Bool` の値を表示し、`None` の場合は汎用的なエラーメッセージを出力したいとします。入力は `Option Bool` で出力は `String` なので、`fromOption` は使えません。これを実現する1つの方法は以下の通りです：

```idris
total
option : b -> (a -> b) -> Option a -> b
option _ f (Some y) = f y
option x _ None     = x

total
handleBool : Option Bool -> String
handleBool = option "Not a boolean value." show
```

関数 `option` は **2つ** の型パラメータでパラメータ化されています。`a` パラメータは `Option` に格納されている値の型を表し、`b` は関数の戻り値の型を表します。`Option` が `Some` であった場合は得られた `a` を `b` に変換する必要があるため、第2引数として `a -> b` 型の関数を受け取ります。

Idris では、関数の型シグネチャにおける **小文字の識別子** は型パラメータとして扱われ、**大文字の識別子** はスコープ内に存在する必要がある具体的な型または型コンストラクタとして扱われます。

<!-- vi: filetype=idris2:syntax=markdown
-->
