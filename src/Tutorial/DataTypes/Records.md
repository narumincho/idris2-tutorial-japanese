# レコード (Records)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Records.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Records.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.DataTypes.Records

import Tutorial.DataTypes.Enumerations
import Tutorial.DataTypes.SumTypes
```

関連する複数の値を1つの論理的な単位としてまとめると便利なことがよくあります。たとえば Web アプリケーションでは、ユーザーに関する複数の情報を1つのデータ型にまとめたい場合があります。このようなデータ型は **直積型 (product types)** と呼ばれます。直積型を定義する最も一般的で便利な方法は `record` キーワードを使用することです：

```idris
record User where
  constructor MkUser
  name  : String
  title : Title
  age   : Bits8
```

上記の宣言は、`User` という新しい **型** と、`MkUser` という新しい **データコンストラクタ** を作成します。いつものように REPL でそれらの型を確認してみましょう：

```repl
Tutorial.DataTypes.Records> :t User
Tutorial.DataTypes.Records.User : Type
Tutorial.DataTypes.Records> :t MkUser
Tutorial.DataTypes.Records.MkUser : String -> Title -> Bits8 -> User
```

`String -> Title -> Bits8 -> User` 型の関数である `MkUser` を使って、`User` 型の値を構築できます：

```idris
total
agentY : User
agentY = MkUser "Y" (Other "Agent") 51

total
drNo : User
drNo = MkUser "No" dr 73
```

直和型で学んだのと同様に、パターンマッチを使って `User` 型の値からフィールドを抽出し、ローカル変数に束縛することもできます：

```idris
total
greetUser : User -> String
greetUser (MkUser n t _) = greet t n
```

`greetUser` 関数では、`name` と `title` フィールドが2つの新しいローカル変数（それぞれ `n` と `t`）に束縛され、右辺の実装で使用されます。右辺で使用しない `age` フィールドには、値を無視することを表すアンダースコア `_` をキャッチオールパターンとして使用できます。

ここで引数の順序を取り違えた場合、Idris は型チェックエラーを出してプログラミングミスを防いでくれます。

これは `failing` ブロックを使って確認できます：

> [!NOTE]
> `failing` キーワードは、型チェックに失敗することが意図されているインデントされたコードブロックをマークします。Idris は `failing` ブロック内のコードのコンパイルを試み、実際に型チェックが通ってしまった場合にコンパイルエラーを発生させます。
>
> さらに、`failing` キーワードの引数として文字列を渡すこともできます。文字列が渡された場合、Idris は発生したコンパイルエラーにその文字列が含まれているかを検証し、含まれていなければエラーとします。
>
> `failing` ブロックは、型安全性が双方向に機能すること（正しいコードが型チェックを通るだけでなく、不正なコードが型チェックを通らないこと）を示すための有用なツールです。

```idris
failing "Mismatch between: String and Title"
  greetUser' : User -> String
  greetUser' (MkUser n t _) = greet n t
```

また、レコードコンストラクタの引数が実際には **名前付き引数 (named arguments)** であることを利用して、引数の順序によるミスを回避することもできます：

```idris
total
greetUser' : User -> String
greetUser' (MkUser {name = n, title = t, age = _}) = greet t n
```

この構文の詳細については後の章で解説しますが、名前付き引数構文を使用することで引数の順序を気にする必要がなくなります：

```idris
total
greetUser'' : User -> String
greetUser'' (MkUser {age = _, title = t, name = n}) = greet t n
```

レコードの各フィールドに対して、Idris は同名のアクセサ（ゲッター）関数を自動生成します。これは通常の関数として呼び出すことも、ドットで区切って後置記法で使用することもできます：

```idris
getAgeFunction : User -> Bits8
getAgeFunction u = age u

getAgePostfix : User -> Bits8
getAgePostfix u = u.age
```

## レコードの糖衣構文 (Syntactic Sugar)

はじめにで述べたように、Idris は **純粋** 関数型プログラミング言語です。純粋関数ではグローバルな変更可能状態を変更することは許されないため、レコードの値を「変更」したい場合は、元の値を変更せずに残したまま **新しい** レコード値を作成する必要があります。Idris の他の値と同様に、レコードは **不変 (immutable)** です。これはパフォーマンスに影響を与える可能性がありますが、関数にレコード値を自由に渡しても、その関数内で破壊的変更（in-place mutation）が行われる心配がないという強力な利点があります。これにより、コードの挙動を推論することが非常に容易になります。

レコードを変更する方法はいくつかありますが、最も一般的なのはレコードにパターンマッチして各フィールドを再構築することです。たとえば、`User` の年齢（`age`）を 1 増やしたい場合は以下のように書けます：

```idris
total
incAge : User -> User
incAge (MkUser name title age) = MkUser name title (age + 1)
```

このような単純な処理に対してこれは記述量が多いため、Idris にはレコードの値を「更新」するための便利な糖衣構文が用意されています。たとえば、**レコード構文** を使用して値の `age` フィールドに直接アクセスして更新できます：

> [!NOTE]
> レコード構文において、`:=` は指定されたフィールドを指定した **値** で更新し、`$=` は指定されたフィールドの現在の値に関数を適用した結果で更新します。

```idris
total
incAge2 : User -> User
incAge2 u = { age := u.age + 1 } u
```

ここで代入演算子 `:=` は、`u` に格納されたレコードの `age` フィールドに新しい値を割り当てています。これにより新しい `User` 値が作成され、`u` 内の元の値は影響を受けないことに注意してください。

レコードのフィールドへのアクセスは、フィールド名を射影関数として使う方法（`age u`。REPL で `:t age` も確認してみてください）か、ドット構文 `u.age` を使う方法のいずれかで行えます。これはレコード専用の特殊な構文であり、関数合成のドット演算子 `(.)` とは関係ありません。

レコードフィールドの更新は非常によくあるユースケースなので、Idris は専用の関数適用構文 `$=` も提供しています：

```idris
total
incAge3 : User -> User
incAge3 u = { age $= (+ 1) } u
```

この例では、演算子セクション `(+ 1)` を使って、数値を受け取って 1 を加算する関数（`age` フィールドの型により `Bits8 -> Bits8` と推論される）を簡潔に定義しています。より一般的な代替手段として、無名関数を使うこともできます：

```idris
total
incAge4 : User -> User
incAge4 u = { age $= \x => x + 1 } u
```

関数の引数 `u` は一番最後で1回使われているだけなので、完全に省略して以下の極めて簡潔なバージョンにすることができます（ポイントフリースタイル / 黙示的プログラミング）：

```idris
total
incAge5 : User -> User
incAge5 = { age $= (+ 1) }
```

REPL で試してみましょう：

```repl
Tutorial.DataTypes.Records> incAge5 drNo
MkUser "No" (Other "Dr.") 74
```

> [!NOTE]
> レコード構文を使用して、複数のフィールドを一度に設定・更新することも可能です。

```idris
total
drNoJunior : User
drNoJunior = { name $= (++ " Jr."), title := Mr, age := 17 } drNo
```

## タプル (Tuples)

先ほど、レコードを **直積型 (product types)** と呼びました。直和型が足し算のアナロジーで命名されているのと同様に、直積型は掛け算のアナロジーで命名されています。具体例として以下のレコードを見てみましょう：

```idris
record Foo where
  constructor MkFoo
  wd   : Weekday
  bool : Bool
```

`Foo` 型の取り得る値の総数を考えてみましょう。`wd` フィールドは `Weekday` 型なので 7 通り、`bool` フィールドは `Bool` 型なので 2 通りの値があります。`Foo` はこれら2つの型の有効な値のあらゆる組み合わせを取り得るため、取り得る値の総数はそれぞれの型の要素数の積となり、`7 * 2 = 14` 通りになります。

最も基本的な直積型は `Pair`（ペア）であり、異なる型の2つの値を保持する型です。Idris は *Prelude* で `Pair` を提供しています：

```idris
total
weekdayAndBool : Weekday -> Bool -> Pair Weekday Bool
weekdayAndBool wd b = MkPair wd b
```

関数から複数の値を `Pair` やより大きなタプルにまとめて返すことは非常によくあるため、Idris はタプルを扱うための糖衣構文を提供しています。`Pair Weekday Bool` の代わりに `(Weekday, Bool)` と書くことができます。同様に、`MkPair wd b` の代わりに `(wd, b)` と書くことができます：

```idris
total
weekdayAndBool2 : Weekday -> Bool -> (Weekday, Bool)
weekdayAndBool2 wd b = (wd, b)
```

これはネストしたタプルに対しても機能します：

```idris
total
triple : Pair Bool (Pair Weekday String)
triple = MkPair False (Friday, "foo")

total
triple2 : (Bool, Weekday, String)
triple2 = (False, Friday, "foo")
```

> [!NOTE]
> `triple2` のような3要素以上のタプルは、Idris コンパイラによって `triple` のようなネストしたペアに内部変換されます。
>
> `(a, b, c)` は `(a, (b, c))`（`Pair a (Pair b c)`）になり、`(a, b, c, d)` は `(a, (b, (c, d)))` になります。

タプル構文はパターンマッチでも使用できます：

```idris
total
bar : Bool
bar = case triple of
  (b,wd,_) => b && isWeekend wd
```

## As パターン (As Patterns)

パターンマッチによって値を分解しつつ、その後の計算のために元の値全体も保持しておきたい場合があります：

```idris
total
baz : (Bool,Weekday,String) -> (Nat,Bool,Weekday,String)
baz t@(_,_,s) = (length s, t)
```

`baz` 関数では、変数 `t` がタプル全体に **束縛** され、結果の4つ組タプルを構築するために再利用されています。`(Nat,Bool,Weekday,String)` は単に `Pair Nat (Bool,Weekday,String)` の糖衣構文であり、`(length s, t)` は `MkPair (length s) t` の糖衣構文です。そのため、上記の実装は正しく型チェックを通ります。

<!-- vi: filetype=idris2:syntax=markdown
-->
