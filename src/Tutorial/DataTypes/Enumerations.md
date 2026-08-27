# 列挙型

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Enumerations.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Enumerations.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.Enumerations
```

列挙型（Enumeration）は、直和型（Sum type）や [タグ付き直和（Tagged union）](https://ja.wikipedia.org/wiki/%E3%82%BF%E3%82%B0%E4%BB%98%E3%81%8D%E7%B5%90%E5%90%88) として知られるより一般的な概念の最も基本的な形態であり、代数的データ型の2つの基本形態の1つです。列挙型は、指定された複数の選択肢（値）のうちの1つを値として保持できるデータ型です。

最初の例として、曜日を表す基本的な列挙型を定義してみましょう。このシンプルな列挙型は他のプログラミング言語でも馴染みがあるかもしれません：

```idris
public export
data Weekday = Monday
             | Tuesday
             | Wednesday
             | Thursday
             | Friday
             | Saturday
             | Sunday
```

上記の宣言は、新しい **型**（`Weekday`）と、その型（`Weekday`）に属するいくつかの新しい **値**（`Monday` から `Sunday`）を定義しています。REPL でこの型を試してみましょう：

> [!NOTE]
> 値 `Monday` の型は `Weekday` であり、`Weekday` 自体の型は `Type` であることに注目してください。

```repl
Tutorial.DataTypes.Enumerations> :t Monday
Tutorial.DataTypes.Enumerations.Monday : Weekday
Tutorial.DataTypes.Enumerations> :t Weekday
Tutorial.DataTypes.Enumerations.Weekday : Type
```

重要な点として、`Weekday` 型の値は上に列挙された値のいずれか1つにしかなり得ません。`Weekday` が期待される場所で他の値を使用することは **型エラー** となります。

## パターンマッチ (Pattern Matching)

新しいデータ型を関数の引数として効果的に活用するには、関数型プログラミング言語における関数の基本構成要素の1つである **パターンマッチ** を導入する必要があります。

曜日の翌日を計算する関数を実装してみましょう：

```idris
total
next : Weekday -> Weekday
next Monday    = Tuesday
next Tuesday   = Wednesday
next Wednesday = Thursday
next Thursday  = Friday
next Friday    = Saturday
next Saturday  = Sunday
next Sunday    = Monday
```

`Weekday` 型の引数を調べるには、取り得る異なる値に対して **パターンマッチ** を行い、それぞれについて結果を返す必要があります。

これは非常に強力な概念であり、深くネストしたデータ構造から値をマッチングして抽出することができます。コンパイラはパターンマッチの各ケースを上から下へと順番に評価し、各パターンを現在の関数の引数と比較します。一致するパターンが見つかると、そのパターンの右辺にある計算が評価され、それ以降のパターンは無視されます。

たとえば、引数として `Thursday` を渡して `next` を呼び出すと、最初の3つのパターン（`Monday`、`Tuesday`、`Wednesday`）が引数と比較されますが一致しません。しかし、4番目のパターン `Thursday` は一致するため、結果として `Friday` が返されます。それ以降のパターンは、たとえ入力に一致する可能性があったとしても無視されます（これは後述するキャッチオールパターンで重要になります）。

この `next` 関数は証明可能に全域的（total）です。Idris は `Weekday` 型の取り得る値をすべて把握しているため、このパターンマッチがすべての可能性を網羅していることを判定できます。したがって、関数に `total` キーワードを注釈することができ、Idris が全域性を検証できない場合はコンパイルエラーとなります。

> [!NOTE]
> 全域性チェッカーと型チェッカーは非常に強力な保証を提供します。十分な計算資源が与えられれば、証明可能に全域的な関数は有限時間内に **必ず** 指定された型の一致する結果を返します（ここでいう *資源* とは、メモリや時間、再帰関数の場合のスタック空間などの計算資源を指します）。

`next` の節の1つを削除してみて、網羅性チェッカー（coverage checker）のエラーメッセージがどのように表示されるか確認してみてください。

## キャッチオールパターン (Catch-all Patterns)

場合によっては、型の取り得る値のサブセットにのみ明示的にマッチさせ、残りの可能性をキャッチオール節でまとめて処理するのが便利なことがあります：

```idris
export
total
isWeekend : Weekday -> Bool
isWeekend Saturday = True
isWeekend Sunday   = True
isWeekend _        = False
```

キャッチオールパターンを持つ最後の行（ここでは引数の正確な値を無視したいため `_` を使っていますが、変数名を指定することもできます）は、引数が `Saturday` にも `Sunday` にも等しくない場合にのみ実行されます。パターンマッチにおけるパターンは上から下へと比較され、最初に一致したパターンによって右辺の実行パスが決まることを覚えておいてください。

キャッチオールパターンを使用して、`Weekday` の値の等値性をテストする関数を実装できます（ここでは等値性演算子 `==` の実装の仕組みとして紹介します。インターフェースのセクションで詳しく学びます）。2つの引数が同じ `Weekday` である各ケースに対してパターンマッチを定義して `True` を返し、最後に `False` を返すキャッチオール節を指定します：

```idris
total
eqWeekday : Weekday -> Weekday -> Bool
eqWeekday Monday Monday        = True
eqWeekday Tuesday Tuesday      = True
eqWeekday Wednesday Wednesday  = True
eqWeekday Thursday Thursday    = True
eqWeekday Friday Friday        = True
eqWeekday Saturday Saturday    = True
eqWeekday Sunday Sunday        = True
eqWeekday _ _                  = False
```

## Prelude の列挙型

`Weekday` のように有限個の値のセットで構成されるデータ型は **列挙型** と呼ばれます。Idris の *Prelude* では、`Bool` や `Ordering` など、いくつかの一般的な列挙型があらかじめ定義されています。`Weekday` と同様に、これらの型に対する関数もパターンマッチを用いて実装できます：

```idris
-- これは Prelude での `not` の実装方法です
total
negate : Bool -> Bool
negate False = True
negate True  = False
```

`Ordering` データ型は、2つの値の間の順序関係（「より小さい」「等しい」「より大きい」という概念）を表します：

```idris
total
compareBool : Bool -> Bool -> Ordering
compareBool False False = EQ
compareBool False True  = LT
compareBool True True   = EQ
compareBool True False  = GT
```

ここで、`LT` は第1引数が第2引数より *小さい (Less Than)* こと、`EQ` は2つの引数が *等しい (Equal)* こと、`GT` は第1引数が第2引数より *大きい (Greater Than)* ことを意味します。

## Case 式 (Case Expressions)

関数の引数に直接パターンマッチするのではなく、まず何らかの計算を行い、その計算結果に対してパターンマッチを行いたい場合があります。**Case 式** は、そのような状況でパターンマッチを行う機能を提供します：

```idris
-- 2つの引数のうち大きい方を返す
total
maxBits8 : Bits8 -> Bits8 -> Bits8
maxBits8 x y =
  case compare x y of
    LT => y
    _  => x
```

Case 式の1行目（`case compare x y of`）は、引数 `x` と `y` を使って関数 `compare` を呼び出します。続くインデントされた行では、トップレベルの関数宣言とほぼ同様に、この計算結果に対してパターンマッチを行います（ただし `=` の代わりに `=>` を使用してパターンと評価式を区切ります）。`compare` を呼び出して得られる値は `Ordering` 型なので、結果として `LT`, `EQ`, `GT` の3つのコンストラクタのいずれかが得られます。最初の行では `LT` の場合を明示的に処理し、他の2つの場合はアンダースコア `_` を使ったキャッチオールパターンで処理しています。

インデントが重要であることに注意してください。Case ブロック全体がインデントされている必要があり（改行から始まる場合）、各ケースは他のすべてのケースと同じ空白量でインデントされている必要があります。

`compare` 関数は多くのデータ型に対してオーバーロードされており、これについてはインターフェースのセクションで詳しく学びます。

### If Then Else

`Bool` を扱う場合、多くのプログラミング言語で一般的な `if then else` 式という代替手段もあります：

```idris
total
maxBits8' : Bits8 -> Bits8 -> Bits8
maxBits8' x y = if compare x y == LT then y else x
```

`if then else` 式は **常に** 値を返す式であり、副作用の実行のために `else` を省略できる典型的な命令型言語とは異なり、`else` 節を省略することはできません。

## 命名規則: 識別子

関数名には小文字・大文字の識別子を自由に使用できますが、型コンストラクタおよびデータコンストラクタには、Idris を混乱させないために **大文字で始まる識別子** を付与する必要があります（演算子も使用可能です）。たとえば、以下のデータ定義は無効であり、Idris は大文字の識別子を期待しているというエラーを出力します：

```repl
data foo = bar | baz
```

レコードや直和型（後述）のような同様のデータ定義でも同じです：

```repl
-- 有効な Idris コードではありません
record Foo where
  constructor mkfoo
```

一方、関数名には通常小文字で始まる識別子を使用します（型レベルで主に使用する関数を除く）。ただしこれは Idris によって強制されているわけではないため、大文字の識別子が適しているドメインであれば大文字を使用することも可能です：

```idris
foo : Bits32 -> Bits32
foo = (* 2)

Bar : Bits32 -> Bits32
Bar = foo
```

<!-- vi: filetype=idris2:syntax=markdown
-->
